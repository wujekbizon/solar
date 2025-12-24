'use client';

import { useEffect } from 'react';
import * as THREE from 'three';

interface SolarPanelsProps {
  sceneRef: React.RefObject<THREE.Scene | null>;
  solarPanelsRef: React.RefObject<THREE.Group | null>;
  panelCount: number;
  panelAngle: number;
}

/**
 * Solar panel array mounted on house roof
 * Creates panels on both slopes of gabled roof
 * Dynamic: recreates on panel count change, rotates on angle change
 */
export function SolarPanels({ sceneRef, solarPanelsRef, panelCount, panelAngle }: SolarPanelsProps) {
  // Recreate panels when count changes
  useEffect(() => {
    if (!sceneRef.current) return;

    const panelGroup = createSolarPanels(sceneRef.current, panelCount, panelAngle);
    solarPanelsRef.current = panelGroup;

    return () => {
      sceneRef.current?.remove(panelGroup);
      // Dispose all panel geometries and materials
      panelGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (child.material instanceof THREE.Material) {
            child.material.dispose();
          }
        }
      });
    };
  }, [panelCount]);

  // Update angle when it changes (without recreating)
  useEffect(() => {
    if (!solarPanelsRef.current) return;

    const angleRad = (panelAngle * Math.PI) / 180;
    const roofAngleRad = (30 * Math.PI) / 180; // Fixed roof at 30°
    const tiltDiff = angleRad - roofAngleRad;

    // Interpolate Y position: 0.1 at 30°, 0.85 at 90°
    const panelHeight = 0.1 + ((panelAngle - 30) / 60) * 0.75;

    solarPanelsRef.current.children.forEach((slopeGroup, slopeIndex) => {
      if (slopeGroup instanceof THREE.Group) {
        slopeGroup.children.forEach((panel) => {
          if (panel instanceof THREE.Mesh) {
            // Panel tilts on Z axis (perpendicular to roof ridge)
            // Left slope (index 0) and right slope (index 1) need opposite rotations
            panel.rotation.z = slopeIndex === 0 ? tiltDiff : -tiltDiff;
            // Adjust height to prevent roof clipping
            panel.position.y = panelHeight;
          }
        });
      }
    });
  }, [panelAngle]);

  return null;
}

/**
 * Internal helper to create solar panel grid
 * Splits panels between left and right roof slopes
 */
function createSolarPanels(scene: THREE.Scene, panelCount: number, angle: number = 30): THREE.Group {
  const panelGroup = new THREE.Group();
  panelGroup.name = 'solarPanels';

  // Panel dimensions
  const panelWidth = 2;
  const panelDepth = 1.5;
  const panelGeometry = new THREE.BoxGeometry(panelWidth, 0.1, panelDepth);
  const panelMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    metalness: 0.8,
    roughness: 0.2,
  });

  // Roof parameters for gabled roof (match House dimensions)
  const houseHeight = 6; // Single story
  const houseWidth = 18;
  const roofDepth = 15; // Match overhang
  const angleRad = (angle * Math.PI) / 180;
  const halfHouseWidth = houseWidth / 2;
  const ridgeHeight = halfHouseWidth * Math.tan(angleRad);
  const slopeWidth = halfHouseWidth / Math.cos(angleRad);

  // Panel spacing and pitch
  const panelSpacing = 0.1;
  const panelPitchSlope = panelWidth + panelSpacing; // Along slope (X direction when rotated)
  const panelPitchZ = panelDepth + panelSpacing; // Along ridge (Z direction)

  // Calculate how many panels fit on one slope
  const maxPanelsAcrossSlope = Math.floor((slopeWidth - 0.2) / panelPitchSlope);
  const maxPanelsAlongRidge = Math.floor((roofDepth - 0.2) / panelPitchZ);

  // Split panels between two slopes
  const panelsPerSlope = Math.ceil(panelCount / 2);

  // Calculate angle-based values for panel rotation and height
  const roofAngleRad = (30 * Math.PI) / 180;
  const tiltDiff = angleRad - roofAngleRad;
  const panelHeight = 0.1 + ((angle - 30) / 60) * 0.75;

  let panelsPlaced = 0;

  // LEFT SLOPE (facing -X)
  const leftSlopeGroup = new THREE.Group();
  const leftPanelsToPlace = Math.min(panelsPerSlope, panelCount);

  for (let i = 0; i < leftPanelsToPlace; i++) {
    const row = Math.floor(i / maxPanelsAcrossSlope);
    const col = i % maxPanelsAcrossSlope;

    if (row >= maxPanelsAlongRidge) break;

    const panel = new THREE.Mesh(panelGeometry, panelMaterial);

    // Position on slope: X (down slope), Z (along ridge)
    const xOnSlope = -slopeWidth / 2 + panelWidth / 2 + 0.25 + col * panelPitchSlope;
    // Start from back of roof (+Z direction, top/back gable)
    const zAlongRidge = roofDepth / 2 - panelDepth / 2 - 0.25 - row * panelPitchZ;

    panel.position.set(xOnSlope, panelHeight, zAlongRidge); // Height based on angle
    panel.rotation.z = tiltDiff; // Rotate panel relative to roof
    panel.castShadow = true;
    leftSlopeGroup.add(panel);
    panelsPlaced++;
  }

  // Rotate and position left slope group (fixed at 30° roof angle)
  leftSlopeGroup.rotation.z = roofAngleRad; // Tilt down to left
  leftSlopeGroup.position.set(-halfHouseWidth / 2, houseHeight + (halfHouseWidth * Math.tan(roofAngleRad)) / 2, 0);
  panelGroup.add(leftSlopeGroup);

  // RIGHT SLOPE (facing +X)
  if (panelsPlaced < panelCount) {
    const rightSlopeGroup = new THREE.Group();
    const rightPanelsToPlace = panelCount - panelsPlaced;

    for (let i = 0; i < rightPanelsToPlace; i++) {
      const row = Math.floor(i / maxPanelsAcrossSlope);
      const col = i % maxPanelsAcrossSlope;

      if (row >= maxPanelsAlongRidge) break;

      const panel = new THREE.Mesh(panelGeometry, panelMaterial);

      // Position on slope: X (down slope), Z (along ridge)
      // RIGHT SLOPE - mirror X position to flow from ridge outward
      const xOnSlope = slopeWidth / 2 - panelWidth / 2 - 0.25 - col * panelPitchSlope;
      // Start from back of roof (+Z direction, top/back gable) - same as left slope
      const zAlongRidge = roofDepth / 2 - panelDepth / 2 - 0.25 - row * panelPitchZ;

      panel.position.set(xOnSlope, panelHeight, zAlongRidge); // Height based on angle
      panel.rotation.z = -tiltDiff; // Right slope rotation (mirrored)
      panel.castShadow = true;
      rightSlopeGroup.add(panel);
      panelsPlaced++;
    }

    // Rotate and position right slope group (fixed at 30° roof angle, mirror of left)
    rightSlopeGroup.rotation.z = -roofAngleRad; // Tilt down to right
    rightSlopeGroup.position.set(halfHouseWidth / 2, houseHeight + (halfHouseWidth * Math.tan(roofAngleRad)) / 2, 0);
    panelGroup.add(rightSlopeGroup);
  }

  scene.add(panelGroup);
  return panelGroup;
}
