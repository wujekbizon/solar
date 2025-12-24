'use client';

import { useEffect } from 'react';
import * as THREE from 'three';
import { POSITIONS } from '../constants';
import type { Vector3D } from '@/types/energy';

interface ShedProps {
  sceneRef: React.RefObject<THREE.Scene | null>;
  shedPositionRef: React.RefObject<Vector3D>;
}

/**
 * Shed/Battery enclosure with inverter
 * Creates a 4x3x3 structure with transparent walls to show internal inverter
 * Returns position for power line connections
 */
export function Shed({ sceneRef, shedPositionRef }: ShedProps) {
  useEffect(() => {
    if (!sceneRef.current) return;

    const shedGroup = new THREE.Group();
    const pos = POSITIONS.shed;

    // Walls: 4×3×3 (W×D×H), semi-transparent
    const wallGeom = new THREE.BoxGeometry(4, 3, 3);
    const wallMat = new THREE.MeshLambertMaterial({
      color: 0x8B7355,
      transparent: true,
      opacity: 0.3,
      side: THREE.FrontSide, // Only exterior faces
      depthWrite: false, // Prevents z-fighting with transparent objects
    });
    const walls = new THREE.Mesh(wallGeom, wallMat);
    walls.position.set(pos.x, pos.y, pos.z);
    walls.castShadow = true;
    walls.receiveShadow = true;
    shedGroup.add(walls);

    // Roof: 4.2×3.2×0.2 (slight overhang)
    const roofGeom = new THREE.BoxGeometry(4.2, 0.2, 3.2);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const roof = new THREE.Mesh(roofGeom, roofMat);
    roof.position.set(pos.x, 3.1, pos.z); // Top at Y=3.1
    roof.castShadow = true;
    roof.receiveShadow = true;
    shedGroup.add(roof);

    // Door: 1×2×0.1 on house-facing side
    const doorGeom = new THREE.BoxGeometry(1, 2, 0.1);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const door = new THREE.Mesh(doorGeom, doorMat);
    door.position.set(8, 1, 0); // Left edge of shed, facing house
    door.castShadow = true;
    shedGroup.add(door);

    // Inverter box inside: 1×1.5×0.5
    const inverterGeom = new THREE.BoxGeometry(1, 1.5, 0.5);
    const inverterMat = new THREE.MeshStandardMaterial({
      color: 0x404040,
      metalness: 0.6,
      roughness: 0.4,
    });
    const inverter = new THREE.Mesh(inverterGeom, inverterMat);
    inverter.position.set(pos.x, 0.75, pos.z); // Ground-mounted inside
    inverter.castShadow = true;
    shedGroup.add(inverter);

    sceneRef.current.add(shedGroup);
    shedPositionRef.current = pos;

    return () => {
      sceneRef.current?.remove(shedGroup);
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
