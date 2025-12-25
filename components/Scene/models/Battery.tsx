'use client';

import { useEffect } from 'react';
import * as THREE from 'three';
import { POSITIONS } from '../constants';

interface BatteryProps {
  sceneRef: React.RefObject<THREE.Scene | null>;
  batteryRef: React.RefObject<THREE.Mesh | null>;
  scale?: number; // Scale multiplier: 1 (small), 1.5 (medium), 2 (large)
}

/**
 * Battery storage unit
 * Creates a dark gray box positioned at POSITIONS.battery
 * Scale adjusts size based on capacity (small=1x, medium=1.5x, large=2x)
 */
export function Battery({ sceneRef, batteryRef, scale = 1 }: BatteryProps) {
  useEffect(() => {
    if (!sceneRef.current) return;

    const batteryGeometry = new THREE.BoxGeometry(1, 1.5, 0.5);
    const batteryMaterial = new THREE.MeshStandardMaterial({
      color: 0x404040,
      metalness: 0.6,
      roughness: 0.4,
    });
    const battery = new THREE.Mesh(batteryGeometry, batteryMaterial);
    battery.position.set(POSITIONS.battery.x, POSITIONS.battery.y * scale, POSITIONS.battery.z);
    battery.scale.set(scale, scale, scale);
    battery.castShadow = true;
    battery.receiveShadow = true;

    sceneRef.current.add(battery);
    batteryRef.current = battery;

    return () => {
      sceneRef.current?.remove(battery);
      batteryGeometry.dispose();
      batteryMaterial.dispose();
    };
  }, [scale]);

  return null;
}
