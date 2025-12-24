'use client';

import { useEffect } from 'react';
import * as THREE from 'three';
import { POSITIONS } from '../constants';

interface BatteryProps {
  sceneRef: React.RefObject<THREE.Scene | null>;
  batteryRef: React.RefObject<THREE.Mesh | null>;
}

/**
 * Battery storage unit
 * Creates a dark gray box positioned at POSITIONS.battery
 */
export function Battery({ sceneRef, batteryRef }: BatteryProps) {
  useEffect(() => {
    if (!sceneRef.current) return;

    const batteryGeometry = new THREE.BoxGeometry(1, 1.5, 0.5);
    const batteryMaterial = new THREE.MeshStandardMaterial({
      color: 0x404040,
      metalness: 0.6,
      roughness: 0.4,
    });
    const battery = new THREE.Mesh(batteryGeometry, batteryMaterial);
    battery.position.set(POSITIONS.battery.x, POSITIONS.battery.y, POSITIONS.battery.z);
    battery.castShadow = true;
    battery.receiveShadow = true;

    sceneRef.current.add(battery);
    batteryRef.current = battery;

    return () => {
      sceneRef.current?.remove(battery);
      batteryGeometry.dispose();
      batteryMaterial.dispose();
    };
  }, []);

  return null;
}
