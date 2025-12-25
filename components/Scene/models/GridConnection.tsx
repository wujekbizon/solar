'use client';

import { useEffect } from 'react';
import * as THREE from 'three';
import { POSITIONS } from '../constants';

interface GridConnectionProps {
  sceneRef: React.RefObject<THREE.Scene | null>;
}

/**
 * Grid Connection - Utility pole with transformer
 * Visual representation of external power grid connection point
 */
export function GridConnection({ sceneRef }: GridConnectionProps) {
  useEffect(() => {
    if (!sceneRef.current) return;

    const gridGroup = new THREE.Group();
    const pos = POSITIONS.grid;

    // Utility pole: 0.3×6×0.3 (tall wooden pole)
    const poleGeom = new THREE.BoxGeometry(0.3, 6, 0.3);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown wood
    const pole = new THREE.Mesh(poleGeom, poleMat);
    pole.position.set(pos.x, 3, pos.z); // Center at Y=3 (half of 6)
    pole.castShadow = true;
    pole.receiveShadow = true;
    gridGroup.add(pole);

    // Transformer box: 1×1.2×0.6 mounted on pole
    const transformerGeom = new THREE.BoxGeometry(1, 1.2, 0.6);
    const transformerMat = new THREE.MeshStandardMaterial({
      color: 0x505050,
      metalness: 0.7,
      roughness: 0.3,
    });
    const transformer = new THREE.Mesh(transformerGeom, transformerMat);
    transformer.position.set(pos.x, 5, pos.z); // Near top of pole
    transformer.castShadow = true;
    gridGroup.add(transformer);

    sceneRef.current.add(gridGroup);

    return () => {
      sceneRef.current?.remove(gridGroup);
      poleGeom.dispose();
      poleMat.dispose();
      transformerGeom.dispose();
      transformerMat.dispose();
    };
  }, []);

  return null;
}
