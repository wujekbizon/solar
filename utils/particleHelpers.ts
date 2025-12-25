import type { EnergySystemState } from '@/types/energy';
import { PHYSICS_CONSTANTS } from './physicsConstants';
import { POSITIONS } from '@/components/Scene/constants';

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

// Inverter position on garage wall (routing hub)
const SHED_POSITION: Vector3D = POSITIONS.inverter;

/**
 * Calculate active particle routes based on current energy flow
 * All routes now go through the shed as central hub
 */
export function calculateParticleRoutes(
  energyState: EnergySystemState
): ParticleRoute[] {
  const routes: ParticleRoute[] = [];

  // Solar panel position (at ridge of gabled roof)
  // Ridge height = houseHeight (12) + ridgeHeight (16/2 * tan(30°) = 4.6)
  const solarPosition: Vector3D = { x: 0, y: 16.6, z: 0 };

  // Battery position
  const batteryPosition: Vector3D = POSITIONS.battery;

  // Grid connection point
  const gridPosition: Vector3D = POSITIONS.grid;

  const { solar, battery, grid, consumption } = energyState;

  // Route 1: Solar → Shed (always when generating)
  if (solar.currentPower > 0) {
    routes.push({
      source: solarPosition,
      destination: SHED_POSITION,
      color: COLOR_SOLAR,
      power: solar.currentPower,
      type: 'solar',
    });
  }

  // Route 2: Shed → Battery (when charging)
  if (battery.charging && solar.currentPower > 0) {
    routes.push({
      source: SHED_POSITION,
      destination: batteryPosition,
      color: COLOR_SOLAR,
      power: battery.chargingRate,
      type: 'solar',
    });
  }

  // Route 3: Battery → Shed (when discharging)
  if (!battery.charging && battery.chargingRate > 0) {
    routes.push({
      source: batteryPosition,
      destination: SHED_POSITION,
      color: COLOR_BATTERY,
      power: battery.chargingRate,
      type: 'battery',
    });
  }

  // Route 4: Grid → Shed (when importing)
  if (grid.importing) {
    routes.push({
      source: gridPosition,
      destination: SHED_POSITION,
      color: COLOR_GRID,
      power: Math.abs(grid.currentFlow),
      type: 'grid',
    });
  }

  // Route 5: Shed → Grid (when exporting)
  if (grid.exporting) {
    routes.push({
      source: SHED_POSITION,
      destination: gridPosition,
      color: COLOR_SOLAR,
      power: Math.abs(grid.currentFlow),
      type: 'solar',
    });
  }

  // Routes 6+: Shed → Each active appliance
  consumption.appliances.forEach((appliance) => {
    if (appliance.isOn && appliance.powerRating > 0) {
      const power = appliance.powerRating;

      // Determine color: solar (yellow) if available, battery (blue) if discharging, grid (red) if importing
      let color = COLOR_GRID; // Default to grid
      let type: 'solar' | 'battery' | 'grid' = 'grid';

      if (solar.currentPower > 0) {
        color = COLOR_SOLAR;
        type = 'solar';
      } else if (!battery.charging && battery.chargingRate > 0) {
        color = COLOR_BATTERY;
        type = 'battery';
      }

      routes.push({
        source: SHED_POSITION,
        destination: appliance.position,
        color,
        power,
        type,
      });
    }
  });

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
