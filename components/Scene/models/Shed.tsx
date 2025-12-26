'use client';

import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { POSITIONS } from '../constants';
import type { Vector3D } from '@/types/energy';
import { createConcreteTexture } from '../helpers/floor';

interface ShedProps {
  sceneRef: React.RefObject<THREE.Scene | null>;
  shedPositionRef: React.RefObject<Vector3D>;
}

/**
 * Creates a 6×4×8 garage structure with transparent walls (like house)
 * Battery storage and inverter location
 * Returns position for power line connections
 */
export function Shed({ sceneRef, shedPositionRef }: ShedProps) {
  const concreteTexture = useMemo(() => createConcreteTexture(), []);
  useEffect(() => {
    if (!sceneRef.current) return;

    const garageGroup = new THREE.Group();
    const garageWidth = 6;
    const garageDepth = 8;
    const pos = POSITIONS.shed;

    // Walls: 6×4×8 (W×H×D), semi-transparent like house
    const wallGeom = new THREE.BoxGeometry(6, 4, 8);
    const wallMat = new THREE.MeshLambertMaterial({
      color: 0x8B7355,
      transparent: true,
      opacity: 0.3,
      side: THREE.FrontSide,
      depthWrite: false,
    });
    const walls = new THREE.Mesh(wallGeom, wallMat);
    walls.position.set(pos.x, 2, pos.z); // Center at Y=2 (half of 4H)
    walls.castShadow = true;
    walls.receiveShadow = true;
    garageGroup.add(walls);

    // Roof: 6.3×0.2×8.3 (slight overhang)
    const roofGeom = new THREE.BoxGeometry(6.3, 0.2, 8.3);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const roof = new THREE.Mesh(roofGeom, roofMat);
    roof.position.set(pos.x, 4.1, pos.z); // Top at Y=4.1
    roof.castShadow = true;
    roof.receiveShadow = true;
    garageGroup.add(roof);

    const floorGeom = new THREE.PlaneGeometry(garageWidth, garageDepth);
    const floorMat = new THREE.MeshStandardMaterial({
      map: concreteTexture,
      roughness: 0.8,
    });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(pos.x, 0.02, pos.z);
    floor.receiveShadow = true;
    garageGroup.add(floor);

    // Garage door: 4×3×0.1 on front (facing +Z)
    const doorGeom = new THREE.BoxGeometry(4, 3, 0.1);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x505050 }); // Gray metal garage door
    const door = new THREE.Mesh(doorGeom, doorMat);
    door.position.set(pos.x, 1.5, pos.z + 4); // Front face, centered
    door.castShadow = true;
    garageGroup.add(door);

    // Inverter: 0.8×1.2×0.25 wall-mounted on right side (outside)
    const inverterGeom = new THREE.BoxGeometry(0.8, 1.2, 0.25);
    const inverterMat = new THREE.MeshStandardMaterial({
      color: 0x404040,
      metalness: 0.6,
      roughness: 0.4,
    });
    const inverter = new THREE.Mesh(inverterGeom, inverterMat);
    inverter.position.set(POSITIONS.inverter.x, POSITIONS.inverter.y, POSITIONS.inverter.z);
    inverter.rotation.y = Math.PI / 2; // Rotate 90° to lay flat on wall
    inverter.castShadow = true;
    garageGroup.add(inverter);

    sceneRef.current.add(garageGroup);
    shedPositionRef.current = POSITIONS.inverter;

    return () => {
      sceneRef.current?.remove(garageGroup);
      // Dispose geometries and materials
      wallGeom.dispose();
      wallMat.dispose();
      roofGeom.dispose();
      roofMat.dispose();
      doorGeom.dispose();
      doorMat.dispose();
      inverterGeom.dispose();
      inverterMat.dispose();
    };
  }, []);

  return null;
}
