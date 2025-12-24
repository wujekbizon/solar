'use client';

import { useEffect } from 'react';
import * as THREE from 'three';

interface GroundProps {
  sceneRef: React.RefObject<THREE.Scene | null>;
}

/**
 * Ground plane for the 3D scene
 * Creates a 40x40 grass-colored ground that receives shadows
 */
export function Ground({ sceneRef }: GroundProps) {
  useEffect(() => {
    if (!sceneRef.current) return;

    const groundGeometry = new THREE.PlaneGeometry(40, 40);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x7CFC00,
      roughness: 0.8,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;

    sceneRef.current.add(ground);

    return () => {
      sceneRef.current?.remove(ground);
      groundGeometry.dispose();
      groundMaterial.dispose();
    };
  }, []);

  return null;
}
