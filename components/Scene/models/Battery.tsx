'use client';

import { useEffect } from 'react';
import * as THREE from 'three';
import { POSITIONS } from '../constants';
import type { IndividualBattery } from '@/types/energy';

interface BatteryProps {
  sceneRef: React.RefObject<THREE.Scene | null>;
  batteries: IndividualBattery[];
}

/**
 * Battery storage units
 * Creates dark gray boxes for each battery in array
 * Positions them in a line starting from POSITIONS.battery
 * Scale adjusts size based on capacity (small=1x, medium=1.5x, large=2x)
 */
export function Battery({ sceneRef, batteries }: BatteryProps) {
  useEffect(() => {
    if (!sceneRef.current || !batteries) return;

    const batteryMeshes: THREE.Mesh[] = [];
    const zSpacing = 0.6; // Space between columns (battery depth 0.5 + 0.1 gap)
    const xSpacing = 1.2; // Space between rows (battery width 1 + 0.2 gap)

    batteries.forEach((battery, index) => {
      // Color based on capacity: small=green, medium=blue, large=orange
      const color = battery.size === 'small' ? 0x4CAF50 :
                    battery.size === 'medium' ? 0x2196F3 :
                    0xFF9800;

      const batteryGeometry = new THREE.BoxGeometry(1, 1.5, 0.5);
      const batteryMaterial = new THREE.MeshStandardMaterial({
        color,
        metalness: 0.6,
        roughness: 0.4,
      });
      const mesh = new THREE.Mesh(batteryGeometry, batteryMaterial);

      // 3 columns (side by side in Z), rows going towards house (-X direction)
      const column = index % 3; // 0, 1, or 2
      const row = Math.floor(index / 3); // 0-3 (up to 4 rows for 12 batteries)

      mesh.position.set(
        POSITIONS.battery.x - (row * xSpacing), // Negative X = towards house
        POSITIONS.battery.y,
        POSITIONS.battery.z + (column * zSpacing)
      );
      mesh.scale.set(1, 1, 1); // All same size
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { batteryId: battery.id };

      sceneRef.current!.add(mesh);
      batteryMeshes.push(mesh);
    });

    return () => {
      batteryMeshes.forEach((mesh) => {
        sceneRef.current?.remove(mesh);
        mesh.geometry.dispose();
        if (mesh.material instanceof THREE.Material) {
          mesh.material.dispose();
        }
      });
    };
  }, [batteries]);

  return null;
}
