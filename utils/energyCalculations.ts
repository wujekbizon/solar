/**
 * Energy Calculation Functions
 * Physics-based calculations for the energy system
 */

import { PHYSICS_CONSTANTS } from './physicsConstants';

/**
 * Calculate solar power generation based on time of day
 * P_solar = P_max × Efficiency × Sun_Intensity × Angle_Effect
 *
 * @param time - Current time in hours (0-24)
 * @param weather - Weather condition
 * @param efficiency - Panel efficiency (0-1)
 * @param maxPower - Maximum solar system power (kW)
 * @param panelAngle - Panel angle in degrees from horizontal (0-90)
 * @param irradianceOverride - Manual irradiance override in W/m² (null = auto)
 * @returns Power generated in kW
 */
export function calculateSolarPower(
  time: number,
  weather: 'sunny' | 'cloudy' | 'night',
  efficiency: number,
  maxPower: number,
  panelAngle: number = 30,
  irradianceOverride: number | null = null
): number {
  if (weather === 'night' && !irradianceOverride) return 0;

  const sunIntensity = calculateSunIntensity(time, weather, irradianceOverride);
  const angleEffect = calculatePanelAngleEffect(panelAngle);

  const power =
    maxPower *
    efficiency *
    sunIntensity *
    angleEffect;

  return Math.max(0, power);
}

/**
 * Calculate sun intensity based on time of day
 * Uses sinusoidal function: Intensity(t) = max(0, sin(π × (t - 6) / 12))
 * Can be overridden with manual irradiance value
 *
 * @param time - Current time in hours (0-24)
 * @param weather - Weather condition
 * @param irradianceOverride - Manual irradiance override in W/m² (null = auto)
 * @returns Sun intensity (0-1)
 */
export function calculateSunIntensity(
  time: number,
  weather: 'sunny' | 'cloudy' | 'night' = 'sunny',
  irradianceOverride: number | null = null
): number {
  // Manual override - convert W/m² to 0-1 intensity (1000 W/m² = max)
  if (irradianceOverride !== null) {
    return Math.max(0, Math.min(1, irradianceOverride / 1000));
  }

  const { SUNRISE_HOUR, SUNSET_HOUR } = PHYSICS_CONSTANTS;

  if (time < SUNRISE_HOUR || time > SUNSET_HOUR) {
    return 0;
  }

  // Sinusoidal curve peaking at noon
  const dayProgress = (time - SUNRISE_HOUR) / (SUNSET_HOUR - SUNRISE_HOUR);
  let intensity = Math.sin(Math.PI * dayProgress);

  // Apply weather modifier
  if (weather === 'cloudy') {
    intensity *= 0.3;
  }

  return Math.max(0, Math.min(1, intensity));
}

/**
 * Calculate battery state of charge change
 * SoC(t) = SoC(t-1) + (ΔE / Capacity) × 100%
 *
 * @param currentSoC - Current state of charge (%)
 * @param powerFlow - Power in/out of battery (kW, positive = charging)
 * @param deltaTime - Time elapsed (hours)
 * @param capacity - Battery capacity (kWh)
 * @param chargeEfficiency - Charging efficiency (0-1)
 * @param dischargeEfficiency - Discharging efficiency (0-1)
 * @param temperature - Current temperature (°C)
 * @param minSoC - Minimum state of charge (%)
 * @param maxSoC - Maximum state of charge (%)
 * @returns New state of charge (%)
 */
export function calculateBatterySoC(
  currentSoC: number,
  powerFlow: number,
  deltaTime: number,
  capacity: number = PHYSICS_CONSTANTS.BATTERY_CAPACITY,
  chargeEfficiency: number = PHYSICS_CONSTANTS.BATTERY_CHARGE_EFFICIENCY,
  dischargeEfficiency: number = PHYSICS_CONSTANTS.BATTERY_DISCHARGE_EFFICIENCY,
  temperature: number = 20,
  minSoC: number = 10,
  maxSoC: number = 100
): number {
  // Apply temperature effects
  const tempEffCharge = calculateBatteryTempEfficiency(chargeEfficiency, temperature);
  const tempEffDischarge = calculateBatteryTempEfficiency(dischargeEfficiency, temperature);

  // Charging (positive) or discharging (negative)
  const effectiveEfficiency = powerFlow > 0 ? tempEffCharge : tempEffDischarge;

  // Energy change
  const energyChange = powerFlow > 0
    ? powerFlow * deltaTime * effectiveEfficiency      // Charging: loses energy
    : (powerFlow * deltaTime) / effectiveEfficiency;     // Discharging: needs more from battery

  const socChange = (energyChange / capacity) * 100;
  const newSoC = currentSoC + socChange;

  return Math.max(minSoC, Math.min(maxSoC, newSoC));
}

/**
 * Calculate net energy flow in the system
 * P_net = P_solar + P_battery_discharge - P_consumption
 *
 * @param solarPower - Solar generation (kW)
 * @param batteryPower - Battery discharge (kW, negative if charging)
 * @param consumption - Total consumption (kW)
 * @returns Net power flow (kW)
 */
export function calculateNetEnergyFlow(
  solarPower: number,
  batteryPower: number,
  consumption: number
): number {
  return solarPower + batteryPower - consumption;
}

/**
 * Calculate required battery power to balance the system
 *
 * @param solarPower - Solar generation (kW)
 * @param consumption - Total consumption (kW)
 * @param currentSoC - Current battery state of charge (%)
 * @param minSoC - Minimum state of charge (%)
 * @param maxSoC - Maximum state of charge (%)
 * @param maxChargeRate - Maximum charge/discharge rate (kW)
 * @returns Battery power (kW, positive = discharging, negative = charging)
 */
export function calculateBatteryPower(
  solarPower: number,
  consumption: number,
  currentSoC: number,
  minSoC: number = 10,
  maxSoC: number = 100,
  maxChargeRate: number = PHYSICS_CONSTANTS.BATTERY_MAX_CHARGE_RATE
): number {
  const deficit = consumption - solarPower;

  // If we need more power than solar provides
  if (deficit > 0) {
    // Discharge battery if it has charge
    if (currentSoC > minSoC) {
      return Math.min(deficit, maxChargeRate);
    }
    return 0; // Battery empty, will need grid
  }

  // If we have excess solar power
  if (deficit < 0) {
    // Charge battery if not full
    if (currentSoC < maxSoC) {
      return Math.max(deficit, -maxChargeRate);
    }
    return 0; // Battery full, will export to grid
  }

  return 0; // Perfectly balanced
}

/**
 * Calculate grid power (import/export)
 *
 * @param solarPower - Solar generation (kW)
 * @param batteryPower - Battery discharge (kW)
 * @param consumption - Total consumption (kW)
 * @returns Grid power (kW, positive = importing, negative = exporting)
 */
export function calculateGridPower(
  solarPower: number,
  batteryPower: number,
  consumption: number
): number {
  const netFlow = calculateNetEnergyFlow(solarPower, batteryPower, consumption);
  return -netFlow; // Negative net flow means importing from grid
}

/**
 * Calculate energy cost savings
 *
 * @param solarUsed - Solar energy used (kWh)
 * @param exported - Energy exported to grid (kWh)
 * @param imported - Energy imported from grid (kWh)
 * @returns Cost savings ($)
 */
export function calculateCostSavings(
  solarUsed: number,
  exported: number,
  imported: number
): number {
  const savingsFromSolar = solarUsed * PHYSICS_CONSTANTS.GRID_IMPORT_RATE;
  const revenueFromExport = exported * PHYSICS_CONSTANTS.GRID_EXPORT_RATE;
  const costOfImport = imported * PHYSICS_CONSTANTS.GRID_IMPORT_RATE;

  return savingsFromSolar + revenueFromExport - costOfImport;
}

/**
 * Calculate CO2 emissions saved
 *
 * @param solarUsed - Solar energy used (kWh)
 * @returns CO2 saved (kg)
 */
export function calculateCO2Saved(solarUsed: number): number {
  return solarUsed * PHYSICS_CONSTANTS.CO2_PER_KWH;
}

/**
 * Calculate total power consumption from appliances
 *
 * @param appliances - Array of appliance states
 * @returns Total power consumption (kW)
 */
export function calculateTotalConsumption(
  appliances: Array<{ isOn: boolean; powerRating: number }>
): number {
  return appliances.reduce(
    (total, appliance) => total + (appliance.isOn ? appliance.powerRating : 0),
    0
  );
}

/**
 * Determine weather condition based on time
 *
 * @param time - Current time in hours (0-24)
 * @returns Weather condition
 */
export function getWeatherFromTime(time: number): 'sunny' | 'cloudy' | 'night' {
  const { SUNRISE_HOUR, SUNSET_HOUR } = PHYSICS_CONSTANTS;

  if (time < SUNRISE_HOUR || time > SUNSET_HOUR) {
    return 'night';
  }

  return 'sunny';
}

/**
 * Calculate system efficiency
 * η = (Useful Energy Out / Total Energy In) × 100%
 *
 * @param energyOut - Useful energy output (kWh)
 * @param energyIn - Total energy input (kWh)
 * @returns Efficiency percentage
 */
export function calculateSystemEfficiency(
  energyOut: number,
  energyIn: number
): number {
  if (energyIn === 0) return 0;
  return (energyOut / energyIn) * 100;
}

/**
 * Calculate wire resistance loss
 * P_loss = I² × R = (P / V)² × R
 *
 * @param power - Power flowing through wire (kW)
 * @param resistance - Wire resistance (Ohms)
 * @param voltage - System voltage (V)
 * @returns Power loss (kW)
 */
export function calculateWireLoss(
  power: number,
  resistance: number,
  voltage: number = PHYSICS_CONSTANTS.SYSTEM_VOLTAGE
): number {
  if (power <= 0) return 0;
  const current = (power * 1000) / voltage; // Convert kW to W, then I = P/V
  return (current * current * resistance) / 1000; // kW
}

/**
 * Calculate temperature from time of day (simplified model)
 *
 * @param time - Current time in hours (0-24)
 * @returns Temperature in °C
 */
export function calculateTemperature(time: number): number {
  if (time >= 6 && time < 9) {
    return 15 + ((time - 6) / 3) * 10; // 15°C → 25°C
  } else if (time >= 9 && time < 12) {
    return 25 + ((time - 9) / 3) * 10; // 25°C → 35°C
  } else if (time >= 12 && time < 15) {
    return 35; // Peak heat
  } else if (time >= 15 && time < 18) {
    return 35 - ((time - 15) / 3) * 15; // 35°C → 20°C
  } else {
    return 15; // Night
  }
}

/**
 * Calculate solar panel temperature loss
 *
 * @param basePower - Base solar power (kW)
 * @param temp - Current temperature (°C)
 * @returns Power loss due to temperature (kW)
 */
export function calculateSolarTempLoss(basePower: number, temp: number): number {
  const tempDiff = temp - PHYSICS_CONSTANTS.TEMPERATURE.solarBaseTemp;
  if (tempDiff <= 0) return 0;
  return Math.abs(basePower * PHYSICS_CONSTANTS.TEMPERATURE.solarTempCoefficient * tempDiff);
}

/**
 * Calculate battery temperature efficiency adjustment
 *
 * @param baseEfficiency - Base efficiency (0-1)
 * @param temp - Current temperature (°C)
 * @returns Adjusted efficiency (0-1)
 */
export function calculateBatteryTempEfficiency(
  baseEfficiency: number,
  temp: number
): number {
  const tempDiff = Math.abs(temp - PHYSICS_CONSTANTS.TEMPERATURE.batteryOptimalTemp);
  const derating = (tempDiff / 10) * PHYSICS_CONSTANTS.TEMPERATURE.batteryTempCoefficient;
  return Math.max(0.7, baseEfficiency * (1 + derating)); // Min 70% efficiency
}

/**
 * Calculate panel angle effect on power output
 * Effect = cos(θ) where θ is angle from horizontal
 *
 * @param angle - Panel angle in degrees from horizontal (0-90)
 * @returns Cosine factor (0-1)
 */
export function calculatePanelAngleEffect(angle: number): number {
  return Math.cos((angle * Math.PI) / 180);
}

/**
 * Calculate electrical current from power and voltage
 * I = P / V
 *
 * @param power - Power in kW
 * @param voltage - Voltage in V
 * @returns Current in amperes
 */
export function calculateCurrent(power: number, voltage: number): number {
  if (voltage === 0) return 0;
  return (power * 1000) / voltage; // Convert kW to W, then I = P/V
}

/**
 * Calculate battery C-rate (charge/discharge rate relative to capacity)
 * C-rate = Power / Capacity
 *
 * @param power - Current power flow (kW)
 * @param capacity - Battery capacity (kWh)
 * @returns C-rate (1C = discharge full capacity in 1 hour)
 */
export function calculateCRate(power: number, capacity: number): number {
  if (capacity === 0) return 0;
  return Math.abs(power) / capacity;
}

/**
 * Calculate depth of discharge
 * DoD = ((Capacity - CurrentCharge) / Capacity) × 100%
 *
 * @param currentCharge - Current charge level (kWh)
 * @param capacity - Total battery capacity (kWh)
 * @returns Depth of discharge percentage (0-100%)
 */
export function calculateDoD(currentCharge: number, capacity: number): number {
  if (capacity === 0) return 0;
  return ((capacity - currentCharge) / capacity) * 100;
}

/**
 * Calculate Joule heating (I²R losses) in wires
 * P_loss = I² × R
 *
 * @param current - Current in amperes
 * @param resistance - Resistance in ohms
 * @returns Power loss in kW
 */
export function calculateJouleHeating(current: number, resistance: number): number {
  return (current * current * resistance) / 1000; // Convert W to kW
}

/**
 * Calculate battery internal resistance power loss
 * P_loss = I²R (Joule heating inside battery)
 *
 * @param current - Battery current in amperes
 * @param internalResistance - Battery internal resistance in ohms
 * @returns Power loss in kW
 */
export function calculateBatteryResistiveLoss(
  current: number,
  internalResistance: number
): number {
  return (current * current * internalResistance) / 1000; // Convert W to kW
}
