/**
 * Physics Constants
 * Real-world constants for energy calculations
 */

export const PHYSICS_CONSTANTS = {
  // Solar Panel Parameters
  SOLAR_PANEL_EFFICIENCY: 0.18,      // 18% typical efficiency
  SOLAR_MAX_POWER: 5.0,               // kW - 5kW system (typical residential)
  SOLAR_PANEL_COUNT: 16,              // Number of panels

  // Battery Parameters
  BATTERY_CAPACITY: 13.5,             // kWh - Tesla Powerwall capacity
  BATTERY_EFFICIENCY: 0.90,           // 90% round-trip efficiency
  BATTERY_MAX_CHARGE_RATE: 5.0,       // kW - Maximum charge/discharge rate
  BATTERY_MIN_SOC: 10,                // % - Minimum state of charge
  BATTERY_MAX_SOC: 100,               // % - Maximum state of charge

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
