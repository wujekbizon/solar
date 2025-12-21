import type { EnergySystemState } from '@/types/energy';
import { PHYSICS_CONSTANTS } from './physicsConstants';

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface ParticleRoute {
  source: Vector3D;
  destination: Vector3D;
  color: number;
  power: number; // kW
  type: 'solar' | 'battery' | 'grid';
}

// Convert hex color strings to numbers
const COLOR_SOLAR = 0xFFD700;
const COLOR_BATTERY = 0x00BFFF;
const COLOR_GRID = 0xFF6347;

/**
 * Calculate active particle routes based on current energy flow
 */
export function calculateParticleRoutes(
  energyState: EnergySystemState
): ParticleRoute[] {
  const routes: ParticleRoute[] = [];

  // Solar panel position (on roof)
  const solarPosition: Vector3D = { x: 0, y: 4.8, z: 0 };

  // Battery position
  const batteryPosition: Vector3D = { x: -5, y: 0.75, z: -4 };

  // Grid connection point (at scene edge)
  const gridPosition: Vector3D = { x: 10, y: 0, z: 0 };

  // House center (for appliances aggregate)
  const houseCenter: Vector3D = { x: 0, y: 2, z: 0 };

  const { solar, battery, grid, consumption } = energyState;

  // Route 1: Solar → Battery (when battery is charging)
  if (battery.charging && solar.currentPower > 0) {
    routes.push({
      source: solarPosition,
      destination: batteryPosition,
      color: COLOR_SOLAR,
      power: battery.chargingRate,
      type: 'solar',
    });
  }

  // Route 2: Solar → House (when solar covers consumption)
  if (solar.currentPower > 0 && consumption.totalPower > 0) {
    const solarToHouse = Math.min(
      solar.currentPower - (battery.charging ? battery.chargingRate : 0),
      consumption.totalPower
    );
    if (solarToHouse > 0) {
      routes.push({
        source: solarPosition,
        destination: houseCenter,
        color: COLOR_SOLAR,
        power: solarToHouse,
        type: 'solar',
      });
    }
  }

  // Route 3: Solar → Grid (when exporting)
  if (grid.exporting && solar.currentPower > 0) {
    routes.push({
      source: solarPosition,
      destination: gridPosition,
      color: COLOR_SOLAR,
      power: grid.currentFlow,
      type: 'solar',
    });
  }

  // Route 4: Battery → House (when battery is discharging)
  if (!battery.charging && battery.chargingRate > 0 && consumption.totalPower > 0) {
    routes.push({
      source: batteryPosition,
      destination: houseCenter,
      color: COLOR_BATTERY,
      power: battery.chargingRate,
      type: 'battery',
    });
  }

  // Route 5: Grid → House (when importing)
  if (grid.importing && consumption.totalPower > 0) {
    routes.push({
      source: gridPosition,
      destination: houseCenter,
      color: COLOR_GRID,
      power: Math.abs(grid.currentFlow),
      type: 'grid',
    });
  }

  return routes;
}

/**
 * Interpolate position between source and destination
 */
export function interpolatePosition(
  source: Vector3D,
  destination: Vector3D,
  progress: number
): Vector3D {
  return {
    x: source.x + (destination.x - source.x) * progress,
    y: source.y + (destination.y - source.y) * progress,
    z: source.z + (destination.z - source.z) * progress,
  };
}

/**
 * Get emission rate (particles per second) based on power
 * Higher power = more particles
 */
export function getEmissionRate(power: number): number {
  // 1 particle per 0.1kW per second
  return Math.max(1, power * 10);
}

/**
 * Get particle speed (units per second) based on power intensity
 * Higher power = faster particles
 */
export function getParticleSpeed(power: number): number {
  // Base speed 1 unit/s, up to 3 units/s for high power
  const baseSpeed = 1.0;
  const maxSpeed = 3.0;
  const speedFactor = Math.min(power / 5.0, 1.0); // Normalize to 0-1 for 0-5kW
  return baseSpeed + (maxSpeed - baseSpeed) * speedFactor;
}

/**
 * Calculate distance between two 3D points
 */
export function calculateDistance(p1: Vector3D, p2: Vector3D): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dz = p2.z - p1.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
