/**
 * Scene Position Constants
 * Centralized 3D coordinates for all major objects in the scene
 */

import type { Vector3D } from '@/types/energy';

export const POSITIONS = {
  battery: { x: -5, y: 0.75, z: -4 } as Vector3D,
  grid: { x: 15, y: 0, z: 0 } as Vector3D,
  shed: { x: 10, y: 1.5, z: 0 } as Vector3D,
} as const;
