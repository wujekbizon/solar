'use client';

import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { createWoodTexture } from '../helpers/floor';

interface HouseProps {
  sceneRef: React.RefObject<THREE.Scene | null>;
  houseGroupRef: React.RefObject<THREE.Group | null>;
}

/**
 * Main house structure with gabled roof
 * Single-story 18x14x6 building with transparent walls to show interior
 * Includes floor, walls, gables, and 30° pitched roof
 */
export function House({ sceneRef, houseGroupRef }: HouseProps) {
  const woodTexture = useMemo(() => createWoodTexture(), []);

  useEffect(() => {
    if (!sceneRef.current) return;

    const houseGroup = new THREE.Group();

    // Main house structure - single story
    const houseWidth = 18;
    const houseHeight = 6;
    const houseDepth = 14;

    const houseMaterial = new THREE.MeshLambertMaterial({
      color: 0x8B7355,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    });

    // Rectangular box walls (bottom part)
    const houseGeometry = new THREE.BoxGeometry(houseWidth, houseHeight, houseDepth);
    const house = new THREE.Mesh(houseGeometry, houseMaterial);
    house.position.y = houseHeight / 2;
    house.castShadow = true;
    house.receiveShadow = true;
    houseGroup.add(house);

    // Interior floor
    const floorGeom = new THREE.PlaneGeometry(houseWidth, houseDepth);
    const floorMat = new THREE.MeshStandardMaterial({
      map: woodTexture,
      roughness: 0.8,
    });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.02;
    floor.receiveShadow = true;
    houseGroup.add(floor);

    // Calculate gable dimensions (for 30° roof)
    const panelAngle = 30;
    const angleRad = (panelAngle * Math.PI) / 180;
    const halfHouseWidth = houseWidth / 2;
    const ridgeHeight = halfHouseWidth * Math.tan(angleRad);

    // Front gable end (triangular wall at +Z)
    const gableShape = new THREE.Shape();
    gableShape.moveTo(-halfHouseWidth, 0);
    gableShape.lineTo(halfHouseWidth, 0);
    gableShape.lineTo(0, ridgeHeight);
    gableShape.lineTo(-halfHouseWidth, 0);

    const gableGeometry = new THREE.ShapeGeometry(gableShape);
    const frontGable = new THREE.Mesh(gableGeometry, houseMaterial);
    frontGable.position.set(0, houseHeight, houseDepth / 2);
    frontGable.castShadow = true;
    frontGable.receiveShadow = true;
    houseGroup.add(frontGable);

    // Back gable end (triangular wall at -Z)
    const backGable = new THREE.Mesh(gableGeometry, houseMaterial);
    backGable.position.set(0, houseHeight, -houseDepth / 2);
    backGable.rotation.y = Math.PI;
    backGable.castShadow = true;
    backGable.receiveShadow = true;
    houseGroup.add(backGable);

    // Gabled roof (2 slopes)
    const roofMaterial = new THREE.MeshStandardMaterial({
      color: 0x707070,
      metalness: 0.8,
      roughness: 0.3,
      side: THREE.DoubleSide
    });
    const roofDepth = houseDepth + 1;
    const roofOverhang = 0.5;
    const roofAngleRad = (30 * Math.PI) / 180;
    const roofSlopeWidth = halfHouseWidth / Math.cos(roofAngleRad);

    // Left slope
    const leftSlopeGroup = new THREE.Group();
    leftSlopeGroup.position.set(0, houseHeight + ridgeHeight, 0);

    const leftSlopeGeom = new THREE.PlaneGeometry(roofSlopeWidth, roofDepth + roofOverhang * 2);
    const leftSlope = new THREE.Mesh(leftSlopeGeom, roofMaterial);
    leftSlope.rotation.x = -Math.PI / 2;
    leftSlope.position.set(-roofSlopeWidth / 2, 0, 0);
    leftSlope.castShadow = true;
    leftSlope.receiveShadow = true;
    leftSlopeGroup.add(leftSlope);

    leftSlopeGroup.rotation.z = roofAngleRad;
    houseGroup.add(leftSlopeGroup);

    // Right slope
    const rightSlopeGroup = new THREE.Group();
    rightSlopeGroup.position.set(0, houseHeight + ridgeHeight, 0);

    const rightSlopeGeom = new THREE.PlaneGeometry(roofSlopeWidth, roofDepth + roofOverhang * 2);
    const rightSlope = new THREE.Mesh(rightSlopeGeom, roofMaterial);
    rightSlope.rotation.x = -Math.PI / 2;
    rightSlope.position.set(roofSlopeWidth / 2, 0, 0);
    rightSlope.castShadow = true;
    rightSlope.receiveShadow = true;
    rightSlopeGroup.add(rightSlope);

    rightSlopeGroup.rotation.z = -roofAngleRad;
    houseGroup.add(rightSlopeGroup);

    // Ridge cap
    const ridgeCapGeom = new THREE.BoxGeometry(0.3, 0.3, roofDepth + roofOverhang * 2);
    const ridgeCap = new THREE.Mesh(ridgeCapGeom, roofMaterial);
    ridgeCap.position.set(0, houseHeight + ridgeHeight, 0);
    ridgeCap.castShadow = true;
    houseGroup.add(ridgeCap);

    sceneRef.current.add(houseGroup);
    houseGroupRef.current = houseGroup;

    return () => {
      sceneRef.current?.remove(houseGroup);
      // Dispose geometries and materials
      houseGeometry.dispose();
      houseMaterial.dispose();
      floorGeom.dispose();
      floorMat.dispose();
      gableGeometry.dispose();
      leftSlopeGeom.dispose();
      rightSlopeGeom.dispose();
      roofMaterial.dispose();
      ridgeCapGeom.dispose();
    };
  }, [woodTexture]);

  return null;
}
