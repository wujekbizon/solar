/**
 * Physics Constants
 * Real-world constants for energy calculations
 */

export const PHYSICS_CONSTANTS = {
  // Solar Panel Parameters
  SOLAR_PANEL_EFFICIENCY: 0.18,      // 18% typical efficiency
  SOLAR_MAX_POWER: 5.0,               // kW - 5kW system (typical residential)
  SOLAR_PANEL_COUNT: 56,              // Number of panels (4x7 grid per slope, 2 slopes)

  // Battery Parameters
  BATTERY_CAPACITY: 13.5,             // kWh - Tesla Powerwall capacity
  BATTERY_EFFICIENCY: 0.90,           // 90% round-trip efficiency (legacy)
  BATTERY_CHARGE_EFFICIENCY: 0.96,    // 96% charging efficiency
  BATTERY_DISCHARGE_EFFICIENCY: 0.97, // 97% discharging efficiency
  BATTERY_MAX_CHARGE_RATE: 5.0,       // kW - Maximum charge/discharge rate
  BATTERY_MIN_SOC: 10,                // % - Minimum state of charge
  BATTERY_MAX_SOC: 100,               // % - Maximum state of charge

  // Wire Resistance (Ohms)
  WIRE_RESISTANCE: {
    solarToBattery: 0.02,             // 10m DC wiring
    batteryToHouse: 0.03,             // 5m DC wiring
    gridToHouse: 0.05,                // 20m AC wiring
  },
  SYSTEM_VOLTAGE: 240,                // Volts

  // Inverter
  INVERTER_EFFICIENCY: 0.97,          // 97% DC→AC conversion

  // Temperature Effects
  TEMPERATURE: {
    solarTempCoefficient: -0.004,     // -0.4% per °C above 25°C
    batteryTempCoefficient: -0.005,   // -0.5% per 10°C from 20°C
    solarBaseTemp: 25,                // °C for solar
    batteryOptimalTemp: 20,           // °C for battery
  },

  // Grid Parameters
  GRID_IMPORT_RATE: 0.13,             // $/kWh - Typical electricity cost
  GRID_EXPORT_RATE: 0.08,             // $/kWh - Typical feed-in tariff

  // Environmental Parameters
  CO2_PER_KWH: 0.5,                   // kg CO2 per kWh from grid

  // Time Parameters
  SECONDS_PER_HOUR: 3600,
  HOURS_PER_DAY: 24,

  // Sun Parameters
  SUNRISE_HOUR: 6,                    // 6 AM
  SUNSET_HOUR: 18,                    // 6 PM
  PEAK_SUN_HOUR: 12,                  // Noon

  // Appliance Power Ratings (kW)
  APPLIANCE_POWER: {
    light: 0.06,                      // 60W LED bulb
    refrigerator: 0.15,               // 150W average
    ac: 3.5,                          // 3.5kW central AC
    tv: 0.15,                         // 150W modern TV
    computer: 0.3,                    // 300W desktop + monitor
    washer: 1.2,                      // 1200W washing machine
    heater: 2.0,                      // 2kW space heater
    dishwasher: 1.8,                  // 1800W dishwasher
  },

  // Particle System
  PARTICLE_SPEED: 2.0,                // Units per second
  PARTICLE_SIZE: 0.1,                 // Size of energy particles
  PARTICLES_PER_KW: 5,                // Particle emission rate

  // Color scheme
  COLORS: {
    SOLAR: '#FFD700',                 // Gold
    BATTERY: '#00BFFF',               // Deep Sky Blue
    GRID: '#FF6347',                  // Tomato Red
    HOUSE: '#F5F5F5',                 // White Smoke
    ACTIVE: '#00FF00',                // Lime Green
    INACTIVE: '#808080',              // Gray
    SKY_DAY: '#87CEEB',              // Sky Blue
    SKY_NIGHT: '#191970',            // Midnight Blue
  },
} as const;
