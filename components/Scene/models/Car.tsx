'use client';

import { useEffect } from 'react';
import * as THREE from 'three';

interface CarProps {
  sceneRef: React.RefObject<THREE.Scene | null>;
  position: { x: number; y: number; z: number };
}

/**
 * Electric Car - Realistic car model in driveway
 * Represents Level 2 EV charger load (7kW)
 */
export function Car({ sceneRef, position }: CarProps) {
  useEffect(() => {
    if (!sceneRef.current) return;

    const carGroup = new THREE.Group();
    const carColor = 0x2E86AB; // Blue EV

    // Lower body: 4×0.8×2 (W×H×D) - main chassis
    const lowerBodyGeom = new THREE.BoxGeometry(4, 0.8, 2);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: carColor,
      metalness: 0.9,
      roughness: 0.1,
    });
    const lowerBody = new THREE.Mesh(lowerBodyGeom, bodyMat);
    lowerBody.position.set(position.x, position.y + 0.6, position.z);
    lowerBody.castShadow = true;
    lowerBody.receiveShadow = true;
    carGroup.add(lowerBody);

    // Cabin: 2.8×1.2×1.8 (W×H×D) - passenger compartment
    const cabinGeom = new THREE.BoxGeometry(2.8, 1.2, 1.8);
    const cabin = new THREE.Mesh(cabinGeom, bodyMat);
    cabin.position.set(position.x - 0.3, position.y + 1.6, position.z);
    cabin.castShadow = true;
    carGroup.add(cabin);

    // Windshield (transparent): 2×1×0.1
    const windshieldGeom = new THREE.BoxGeometry(2, 1, 0.1);
    const windshieldMat = new THREE.MeshStandardMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.4,
      metalness: 0.9,
      roughness: 0.05,
    });
    const windshield = new THREE.Mesh(windshieldGeom, windshieldMat);
    windshield.position.set(position.x + 0.5, position.y + 1.6, position.z + 0.95);
    carGroup.add(windshield);

    // Hood/front: 1.5×0.6×1.9
    const hoodGeom = new THREE.BoxGeometry(1.5, 0.6, 1.9);
    const hood = new THREE.Mesh(hoodGeom, bodyMat);
    hood.position.set(position.x + 1.7, position.y + 0.9, position.z);
    hood.castShadow = true;
    carGroup.add(hood);

    // Headlights: 2 white boxes
    const headlightGeom = new THREE.BoxGeometry(0.3, 0.2, 0.15);
    const headlightMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.5,
    });
    const headlightLeft = new THREE.Mesh(headlightGeom, headlightMat);
    headlightLeft.position.set(position.x + 2.4, position.y + 0.8, position.z + 0.7);
    carGroup.add(headlightLeft);
    const headlightRight = new THREE.Mesh(headlightGeom, headlightMat.clone());
    headlightRight.position.set(position.x + 2.4, position.y + 0.8, position.z - 0.7);
    carGroup.add(headlightRight);

    // Wheels: 4 realistic wheels
    const wheelGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 20);
    const wheelMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.3,
      roughness: 0.7,
    });

    const wheelPositions = [
      { x: position.x + 1.3, y: position.y + 0.35, z: position.z + 0.95 },
      { x: position.x + 1.3, y: position.y + 0.35, z: position.z - 0.95 },
      { x: position.x - 1.1, y: position.y + 0.35, z: position.z + 0.95 },
      { x: position.x - 1.1, y: position.y + 0.35, z: position.z - 0.95 },
    ];

    wheelPositions.forEach((pos) => {
      const wheel = new THREE.Mesh(wheelGeom, wheelMat);
      wheel.position.set(pos.x, pos.y, pos.z);
      wheel.rotation.x = Math.PI / 2;
      wheel.castShadow = true;
      carGroup.add(wheel);
    });

    // Rotate car 90° to face garage (horizontal orientation)
    carGroup.rotation.y = Math.PI / 2;

    sceneRef.current.add(carGroup);

    return () => {
      sceneRef.current?.remove(carGroup);
      lowerBodyGeom.dispose();
      bodyMat.dispose();
      cabinGeom.dispose();
      windshieldGeom.dispose();
      windshieldMat.dispose();
      hoodGeom.dispose();
      headlightGeom.dispose();
      headlightMat.dispose();
      wheelGeom.dispose();
      wheelMat.dispose();
    };
  }, [position]);

  return null;
}
