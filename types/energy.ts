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
  panelCount: number;          // Number of solar panels
  powerPerPanel: number;       // Watts per panel
  irradianceOverride: number | null; // W/m² - Manual sun intensity override (null = auto)
  area: number;                // m² - Total panel area
}

export type BatterySize = 'small' | 'medium' | 'large';

export interface BatteryConfig {
  size: BatterySize;
  capacity: number;            // kWh - Total capacity
  internalResistance: number;  // Ω - Battery internal resistance
  maxCRate: number;            // Maximum C-rate (discharge rate relative to capacity)
}

export interface IndividualBattery {
  id: string;                  // Unique battery identifier
  size: BatterySize;           // Battery size (small/medium/large)
  capacity: number;            // kWh - Total capacity
  currentCharge: number;       // kWh - Current charge level
  stateOfCharge: number;       // 0-100% - Percentage charged
  internalResistance: number;  // Ω - Battery internal resistance
  maxCRate: number;            // Maximum C-rate
}

export interface BatterySystem {
  capacity: number;            // kWh - Total capacity
  currentCharge: number;       // kWh - Current charge level
  stateOfCharge: number;       // 0-100% - Percentage charged
  charging: boolean;           // Is battery charging
  chargingRate: number;        // kW - Current charge/discharge rate
  efficiency: number;          // 0-1 - Charge/discharge efficiency (legacy)
  chargeEfficiency: number;    // 0-1 - Charging efficiency
  dischargeEfficiency: number; // 0-1 - Discharging efficiency
  maxChargeRate: number;       // kW - Maximum theoretical charge rate
  availableDischargeRate?: number; // kW - Currently available discharge power (excludes blocked batteries)
  availableChargeRate?: number;    // kW - Currently available charge power (excludes full batteries)
  internalResistance: number;  // Ω - Battery internal resistance
  depthOfDischarge: number;    // % - Current DoD (0-100%)
  cRate: number;               // Current C-rate (power/capacity)
  minSoC: number;              // % - Minimum state of charge limit
  maxSoC: number;              // % - Maximum state of charge limit
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

export interface EnergyLosses {
  wireLosses: {
    solarToBattery: number;    // kW - Wire loss solar to battery
    batteryToHouse: number;    // kW - Wire loss battery to house
    gridToHouse: number;       // kW - Wire loss grid to house
    total: number;             // kW - Total wire losses
  };
  inverterLoss: number;        // kW - DC to AC conversion loss
  batteryLosses: {
    charging: number;          // kW - Loss during charging
    discharging: number;       // kW - Loss during discharging
    resistive: number;         // kW - I²R loss from internal resistance
  };
  temperatureLosses: {
    solar: number;             // kW - Solar panel temp derating
    battery: number;           // kW - Battery temp effect
  };
  totalLosses: number;         // kW - Total system losses
}

export interface EnergyStatistics {
  netEnergy: number;           // kW - Net energy flow
  costSavings: number;         // $ - Money saved
  co2Saved: number;            // kg - Net CO2 impact (solar savings - grid emissions)
  efficiency: number;          // % - Overall system efficiency
}

export interface SystemState {
  voltage: number;             // V - System voltage (120/240/480)
  wireGauge: string;           // Wire gauge (10AWG/8AWG/6AWG)
  totalEfficiency: number;     // % - Total system efficiency
  energyBalance: number;       // kW - Energy balance error (Ein - Eout - Estored)
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
  isManualWeatherControl: boolean; // User manually set weather

  solar: SolarSystem;
  batteries: IndividualBattery[]; // Array of individual batteries
  battery: BatterySystem;         // Aggregate battery state (computed from batteries array)
  consumption: PowerConsumption;
  grid: GridConnection;
  statistics: EnergyStatistics;
  losses: EnergyLosses;        // System energy losses
  system: SystemState;         // System-level parameters
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
  | 'dishwasher'
  | 'electric_car';

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
