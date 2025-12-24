'use client';

import { useEffect } from 'react';
import * as THREE from 'three';
import type { ApplianceState, Vector3D } from '@/types/energy';

interface PowerLinesProps {
  sceneRef: React.RefObject<THREE.Scene | null>;
  powerLinesRef: React.RefObject<THREE.Group | null>;
  appliances: ApplianceState[];
  batteryPosition: Vector3D;
  gridPosition: Vector3D;
  shedPosition: Vector3D;
  importing: boolean;
  batteryChargingRate: number;
  solarPower: number;
}

/**
 * PowerLines component visualizing energy flow connections
 * - Yellow lines: Solar power flow
 * - Blue lines: Battery discharge flow
 * - Red lines: Grid import flow
 * - Tube geometry for 3D wire representation
 */
export function PowerLines({
  sceneRef,
  powerLinesRef,
  appliances,
  batteryPosition,
  gridPosition,
  shedPosition,
  importing,
  batteryChargingRate,
  solarPower,
}: PowerLinesProps) {
  // Create power lines group on mount
  useEffect(() => {
    if (!sceneRef.current) return;

    const linesGroup = new THREE.Group();
    linesGroup.name = 'powerLines';
    sceneRef.current.add(linesGroup);
    powerLinesRef.current = linesGroup;

    return () => {
      sceneRef.current?.remove(linesGroup);
      // Dispose all line geometries and materials
      linesGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (child.material instanceof THREE.Material) {
            child.material.dispose();
          }
        }
      });
    };
  }, []);

  // Update power lines when energy flow changes
  useEffect(() => {
    if (!powerLinesRef.current) return;

    updatePowerLines(
      powerLinesRef.current,
      appliances,
      batteryPosition,
      gridPosition,
      shedPosition,
      importing,
      batteryChargingRate,
      solarPower
    );
  }, [appliances, importing, batteryChargingRate, solarPower]);

  return null;
}

/**
 * Internal helper to update power line visualization
 */
function updatePowerLines(
  linesGroup: THREE.Group,
  appliances: ApplianceState[],
  battery: Vector3D,
  grid: Vector3D,
  shed: Vector3D,
  importing: boolean,
  batteryChargingRate: number,
  solarPower: number
) {
  // Clear existing lines
  linesGroup.clear();

  const batteryCharging = batteryChargingRate > 0 && solarPower > 0;
  const batteryDischarging = batteryChargingRate > 0 && solarPower === 0;

  // Helper to create power line tube
  const createLine = (from: THREE.Vector3, to: THREE.Vector3, color: number) => {
    const points = [from, to];
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(curve, 20, 0.06, 8, false); // Thinner wires
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.8,
    });
    const line = new THREE.Mesh(geometry, material);
    line.renderOrder = 999;
    linesGroup.add(line);
  };

  // Line 1: Shed ↔ Battery
  if (batteryCharging) {
    // Shed → Battery (charging, yellow)
    createLine(
      new THREE.Vector3(shed.x, shed.y, shed.z),
      new THREE.Vector3(battery.x, battery.y, battery.z),
      0xFFD700
    );
  } else if (batteryDischarging) {
    // Battery → Shed (discharging, blue)
    createLine(
      new THREE.Vector3(battery.x, battery.y, battery.z),
      new THREE.Vector3(shed.x, shed.y, shed.z),
      0x00BFFF
    );
  }

  // Line 2: Grid → Shed (when importing, red)
  if (importing) {
    createLine(
      new THREE.Vector3(grid.x, grid.y, grid.z),
      new THREE.Vector3(shed.x, shed.y, shed.z),
      0xFF6347
    );
  }

  // Lines 3+: Shed → Each ON appliance
  appliances.forEach((appliance) => {
    if (!appliance.isOn) return;

    // Determine color based on energy source priority
    let color = 0xFF6347; // Default to grid (red)
    if (solarPower > 0) {
      color = 0xFFD700; // Solar (yellow)
    } else if (batteryDischarging) {
      color = 0x00BFFF; // Battery (blue)
    }

    createLine(
      new THREE.Vector3(shed.x, shed.y, shed.z),
      new THREE.Vector3(appliance.position.x, appliance.position.y, appliance.position.z),
      color
    );
  });
}
