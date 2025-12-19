/**
 * Energy System Types
 * Defines all types for the smart home energy flow simulation
 */

export type WeatherCondition = 'sunny' | 'cloudy' | 'night';

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface SolarSystem {
  maxPower: number;           // kW - Maximum panel rating
  currentPower: number;        // kW - Current generation
  efficiency: number;          // 0-1 - Panel efficiency
  totalGenerated: number;      // kWh - Total energy generated
  panelAngle: number;          // degrees - Panel tilt angle
}

export interface BatterySystem {
  capacity: number;            // kWh - Total capacity
  currentCharge: number;       // kWh - Current charge level
  stateOfCharge: number;       // 0-100% - Percentage charged
  charging: boolean;           // Is battery charging
  chargingRate: number;        // kW - Current charge/discharge rate
  efficiency: number;          // 0-1 - Charge/discharge efficiency
  maxChargeRate: number;       // kW - Maximum charge rate (C-rate)
}

export interface GridConnection {
  importing: boolean;          // Importing power from grid
  exporting: boolean;          // Exporting power to grid
  currentFlow: number;         // kW - Positive = import, Negative = export
  totalImported: number;       // kWh - Total imported energy
  totalExported: number;       // kWh - Total exported energy
  importRate: number;          // $/kWh - Cost of imported energy
  exportRate: number;          // $/kWh - Revenue from exported energy
}

export interface EnergyStatistics {
  netEnergy: number;           // kW - Net energy flow
  costSavings: number;         // $ - Money saved
  co2Saved: number;            // kg - CO2 emissions avoided
  efficiency: number;          // % - Overall system efficiency
}

export interface PowerConsumption {
  totalPower: number;          // kW - Current total consumption
  totalConsumed: number;       // kWh - Total energy consumed
  appliances: ApplianceState[];
}

export interface EnergySystemState {
  currentTime: number;         // 0-24 hours
  timeSpeed: number;           // Simulation speed multiplier
  weather: WeatherCondition;
  isPaused: boolean;

  solar: SolarSystem;
  battery: BatterySystem;
  consumption: PowerConsumption;
  grid: GridConnection;
  statistics: EnergyStatistics;
}

export interface ApplianceState {
  id: string;
  name: string;
  type: ApplianceType;
  powerRating: number;         // kW - Power consumption when on
  isOn: boolean;
  position: Vector3D;
  alwaysOn: boolean;           // Cannot be turned off (e.g., fridge)
  usagePattern?: UsagePattern;
}

export type ApplianceType =
  | 'light'
  | 'refrigerator'
  | 'ac'
  | 'tv'
  | 'computer'
  | 'washer'
  | 'heater'
  | 'dishwasher';

export interface UsagePattern {
  startHour: number;           // Hour when typically turned on
  endHour: number;             // Hour when typically turned off
  probability: number;         // 0-1 - Likelihood of being on
}

export interface EnergyParticle {
  id: string;
  type: 'solar' | 'battery' | 'grid';
  position: Vector3D;
  velocity: Vector3D;
  source: Vector3D;
  destination: Vector3D;
  progress: number;            // 0-1 - Journey progress
  color: string;
}

export interface Scenario {
  name: string;
  description: string;
  time: number;                // Hour of day
  weather: WeatherCondition;
  appliances: {
    [key: string]: boolean;    // appliance id -> on/off state
  };
}
