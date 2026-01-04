/**
 * Physics Constants
 * Real-world constants for energy calculations
 */

export const PHYSICS_CONSTANTS = {
  // Solar Panel Parameters
  SOLAR_PANEL_EFFICIENCY: 1.0,       // 100% - P_max already includes 18% panel efficiency at STC
  SOLAR_MAX_POWER: 5.0,               // kW - 5kW system (typical residential)
  SOLAR_PANEL_COUNT: 90,              // Number of panels (5x9 grid per slope, 2 slopes)

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

  // Advanced Solar Parameters
  SOLAR_ANGLE_MIN: 0,                 // degrees - minimum tilt
  SOLAR_ANGLE_MAX: 90,                // degrees - maximum tilt
  PANEL_AREA_M2: 1.7,                 // m² - standard panel size (400W panel ~1.7m²)

  // System Voltage Options
  SYSTEM_VOLTAGE_OPTIONS: [120, 240, 480] as const, // Volts - Available voltage options

  // Wire Gauge Resistance (Ohms) - per AWG size
  WIRE_GAUGE_RESISTANCE: {
    '10AWG': 0.01,                    // Ω - 10 gauge wire
    '8AWG': 0.006,                    // Ω - 8 gauge wire
    '6AWG': 0.004,                    // Ω - 6 gauge wire
  },

  // Advanced Battery Parameters
  BATTERY_C_RATE_MAX: 1.0,            // 1C = discharge full capacity in 1 hour
  BATTERY_DOD_MAX: 0.8,               // 80% max depth of discharge for longevity

  // Battery Configuration Presets
  BATTERY_CONFIGS: {
    small: {
      size: 'small' as const,
      capacity: 13.5,                 // kWh - Tesla Powerwall
      internalResistance: 0.05,       // Ω - Higher resistance, more losses
      maxCRate: 1.0,                  // 1C - Can discharge full capacity in 1 hour
    },
    medium: {
      size: 'medium' as const,
      capacity: 40,                   // kWh - 3× Powerwall equivalent
      internalResistance: 0.02,       // Ω - Lower resistance, better efficiency
      maxCRate: 0.8,                  // 0.8C - Slightly conservative discharge
    },
    large: {
      size: 'large' as const,
      capacity: 100,                  // kWh - Commercial/large residential
      internalResistance: 0.01,       // Ω - Best efficiency, lowest losses
      maxCRate: 0.5,                  // 0.5C - Conservative discharge for longevity
    },
  },

  // Grid Parameters
  GRID_IMPORT_RATE: 1.11,             // zł/kWh - Polish electricity cost (2025, total with distribution)
  GRID_EXPORT_RATE: 0.67,             // zł/kWh - Polish feed-in tariff (2025)

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
    electric_car: 7.0,                // 7kW Level 2 home charger
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
