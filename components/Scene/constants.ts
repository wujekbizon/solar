/**
 * Scene Position Constants
 * Centralized 3D coordinates for all major objects in the scene
 */

import type { Vector3D } from '@/types/energy';

export const POSITIONS = {
  battery: { x: 14, y: 0.75, z: -3 } as Vector3D,
  grid: { x: 20, y: 0, z: -10 } as Vector3D,
  shed: { x: 12.1, y: 2, z: 0 } as Vector3D,
  car: { x: -8, y: 0, z: 12 } as Vector3D,
  inverter: { x: 15.2, y: 1.5, z: 2 } as Vector3D, // On garage exterior wall (shed.x + 3.1, 1.5, shed.z + 2)
} as const;
