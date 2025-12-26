import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EnergySystemState, ApplianceState, WeatherCondition, IndividualBattery, BatterySize } from '@/types/energy';
import { PHYSICS_CONSTANTS } from '@/utils/physicsConstants';
import {
  calculateSolarPower,
  calculateBatterySoC,
  calculateBatteryPower,
  calculateGridPower,
  calculateTotalConsumption,
  calculateCostSavings,
  calculateCO2Saved,
  getWeatherFromTime,
  calculateWireLoss,
  calculateTemperature,
  calculateSolarTempLoss,
  calculateBatteryResistiveLoss,
} from '@/utils/energyCalculations';

const INITIAL_APPLIANCES: ApplianceState[] = [
  {
    id: 'light-1',
    name: 'Światło w salonie',
    type: 'light',
    powerRating: PHYSICS_CONSTANTS.APPLIANCE_POWER.light,
    isOn: false,
    position: { x: 0, y: 2.8, z: 3 },
    alwaysOn: false,
  },
  {
    id: 'light-2',
    name: 'Światło w kuchni',
    type: 'light',
    powerRating: PHYSICS_CONSTANTS.APPLIANCE_POWER.light,
    isOn: false,
    position: { x: -5, y: 2.8, z: 5 },
    alwaysOn: false,
  },
  {
    id: 'refrigerator',
    name: 'Lodówka',
    type: 'refrigerator',
    powerRating: PHYSICS_CONSTANTS.APPLIANCE_POWER.refrigerator,
    isOn: true,
    position: { x: -6, y: 1.2, z: 5 },
    alwaysOn: true,
  },
  {
    id: 'ac',
    name: 'Klimatyzacja',
    type: 'ac',
    powerRating: PHYSICS_CONSTANTS.APPLIANCE_POWER.ac,
    isOn: false,
    position: { x: 6, y: 2.5, z: -5 },
    alwaysOn: false,
  },
  {
    id: 'tv',
    name: 'Telewizor',
    type: 'tv',
    powerRating: PHYSICS_CONSTANTS.APPLIANCE_POWER.tv,
    isOn: false,
    position: { x: 0, y: 1.5, z: 6 },
    alwaysOn: false,
  },
  {
    id: 'computer',
    name: 'Komputer',
    type: 'computer',
    powerRating: PHYSICS_CONSTANTS.APPLIANCE_POWER.computer,
    isOn: false,
    position: { x: 5, y: 0.8, z: 5 },
    alwaysOn: false,
  },
  {
    id: 'electric-car',
    name: 'Samochód Elektryczny',
    type: 'electric_car',
    powerRating: PHYSICS_CONSTANTS.APPLIANCE_POWER.electric_car,
    isOn: false,
    position: { x: 12, y: 0, z: 8 },
    alwaysOn: false,
  },
];

const INITIAL_STATE: EnergySystemState = {
  currentTime: 6,
  timeSpeed: 1,
  weather: 'sunny',
  isPaused: false,
  isManualWeatherControl: false,

  solar: {
    maxPower: PHYSICS_CONSTANTS.SOLAR_MAX_POWER,
    currentPower: 0,
    efficiency: PHYSICS_CONSTANTS.SOLAR_PANEL_EFFICIENCY,
    totalGenerated: 0,
    panelAngle: 30,
    panelCount: 56,
    powerPerPanel: 300,
    irradianceOverride: null,
    area: 56 * PHYSICS_CONSTANTS.PANEL_AREA_M2,
  },

  batteries: [
    {
      id: 'battery-1',
      size: 'small',
      capacity: PHYSICS_CONSTANTS.BATTERY_CONFIGS.small.capacity,
      currentCharge: PHYSICS_CONSTANTS.BATTERY_CONFIGS.small.capacity * 0.5,
      stateOfCharge: 50,
      internalResistance: PHYSICS_CONSTANTS.BATTERY_CONFIGS.small.internalResistance,
      maxCRate: PHYSICS_CONSTANTS.BATTERY_CONFIGS.small.maxCRate,
    },
  ],

  battery: {
    capacity: PHYSICS_CONSTANTS.BATTERY_CAPACITY,
    currentCharge: PHYSICS_CONSTANTS.BATTERY_CAPACITY * 0.5,
    stateOfCharge: 50,
    charging: false,
    chargingRate: 0,
    efficiency: PHYSICS_CONSTANTS.BATTERY_EFFICIENCY,
    chargeEfficiency: PHYSICS_CONSTANTS.BATTERY_CHARGE_EFFICIENCY,
    dischargeEfficiency: PHYSICS_CONSTANTS.BATTERY_DISCHARGE_EFFICIENCY,
    maxChargeRate: PHYSICS_CONSTANTS.BATTERY_MAX_CHARGE_RATE,
    internalResistance: 0.05,
    depthOfDischarge: 50,
    cRate: 0,
    minSoC: 20,
    maxSoC: 95,
  },

  consumption: {
    totalPower: 0,
    totalConsumed: 0,
    appliances: INITIAL_APPLIANCES,
  },

  grid: {
    importing: false,
    exporting: false,
    currentFlow: 0,
    totalImported: 0,
    totalExported: 0,
    importRate: PHYSICS_CONSTANTS.GRID_IMPORT_RATE,
    exportRate: PHYSICS_CONSTANTS.GRID_EXPORT_RATE,
  },

  statistics: {
    netEnergy: 0,
    costSavings: 0,
    co2Saved: 0,
    efficiency: 0,
  },

  losses: {
    wireLosses: { solarToBattery: 0, batteryToHouse: 0, gridToHouse: 0, total: 0 },
    inverterLoss: 0,
    batteryLosses: { charging: 0, discharging: 0, resistive: 0 },
    temperatureLosses: { solar: 0, battery: 0 },
    totalLosses: 0,
  },

  system: {
    voltage: PHYSICS_CONSTANTS.SYSTEM_VOLTAGE,
    wireGauge: '8AWG',
    totalEfficiency: 0,
    energyBalance: 0,
  },
};

interface EnergyStore {
  state: EnergySystemState;
  lastUpdate: number;

  // Actions
  updateSimulation: () => void;
  toggleAppliance: (applianceId: string) => void;
  setTimeSpeed: (speed: number) => void;
  setTime: (time: number) => void;
  togglePause: () => void;
  setWeather: (weather: WeatherCondition) => void;
  resetSimulation: () => void;
  setSolarPanelCount: (count: number) => void;
  setSolarPanelPower: (watts: number) => void;
  setSolarPanelAngle: (angle: number) => void;
  setSolarEfficiency: (efficiency: number) => void;
  setIrradianceOverride: (irradiance: number | null) => void;
  setBatteryInternalResistance: (resistance: number) => void;
  setBatteryConfig: (size: 'small' | 'medium' | 'large') => void;
  addBattery: (size: BatterySize) => void;
  removeBattery: (id: string) => void;
  changeBatterySize: (id: string, size: BatterySize) => void;
  setSystemVoltage: (voltage: number) => void;
  setWireGauge: (gauge: string) => void;
  setMinMaxSoC: (min: number, max: number) => void;
}

export const useEnergyStore = create<EnergyStore>()(
  persist(
    (set, get) => ({
      state: INITIAL_STATE,
      lastUpdate: Date.now(),

      updateSimulation: () => {
        const { state: prevState, lastUpdate } = get();

        if (prevState.isPaused) return;

        const now = Date.now();
        const deltaTimeMs = now - lastUpdate;

        const visualDeltaTimeHours = (deltaTimeMs / 1000 / 3600) * prevState.timeSpeed;

        const ACCUMULATION_MULTIPLIER = 100;
        const accumulationDeltaTimeHours = visualDeltaTimeHours * ACCUMULATION_MULTIPLIER;

        let newTime = prevState.currentTime + visualDeltaTimeHours;
        if (newTime >= 24) newTime -= 24;

        // ✅ FIX: Only auto-calculate weather if not manually controlled
        // This was the bug - it was recalculating every frame!
        const weather = prevState.isManualWeatherControl
          ? prevState.weather
          : getWeatherFromTime(newTime);

        const solarPower = calculateSolarPower(
          newTime,
          weather,
          prevState.solar.efficiency,
          prevState.solar.maxPower,
          prevState.solar.panelAngle ?? 30,
          prevState.solar.irradianceOverride
        );

        const totalConsumption = calculateTotalConsumption(prevState.consumption.appliances);

        const batteryPowerFlow = calculateBatteryPower(
          solarPower,
          totalConsumption,
          prevState.battery.stateOfCharge,
          prevState.battery.minSoC ?? 10,
          prevState.battery.maxSoC ?? 100
        );

        const currentTemp = calculateTemperature(newTime);

        const newSoC = calculateBatterySoC(
          prevState.battery.stateOfCharge,
          -batteryPowerFlow,
          accumulationDeltaTimeHours,
          prevState.battery.capacity,
          prevState.battery.chargeEfficiency,
          prevState.battery.dischargeEfficiency,
          currentTemp,
          prevState.battery.minSoC ?? 10,
          prevState.battery.maxSoC ?? 100
        );

        const gridPower = calculateGridPower(solarPower, batteryPowerFlow, totalConsumption);

        // Wire gauge-based resistance calculations
        const baseResistance = PHYSICS_CONSTANTS.WIRE_GAUGE_RESISTANCE[prevState.system.wireGauge as keyof typeof PHYSICS_CONSTANTS.WIRE_GAUGE_RESISTANCE] ?? 0.006;
        const systemVoltage = prevState.system.voltage ?? 240;

        const wireLossSolar = solarPower > 0 && batteryPowerFlow < 0
          ? calculateWireLoss(Math.abs(batteryPowerFlow), baseResistance * 3.3, systemVoltage)
          : 0;
        const wireLossBattery = batteryPowerFlow > 0
          ? calculateWireLoss(batteryPowerFlow, baseResistance * 5, systemVoltage)
          : 0;
        const wireLossGrid = gridPower > 0
          ? calculateWireLoss(gridPower, baseResistance * 8.3, systemVoltage)
          : 0;
        const totalWireLoss = wireLossSolar + wireLossBattery + wireLossGrid;

        const inverterLoss = totalConsumption * (1 - PHYSICS_CONSTANTS.INVERTER_EFFICIENCY);

        const solarTempLoss = calculateSolarTempLoss(solarPower, currentTemp);

        const batteryChargeLoss = batteryPowerFlow < 0
          ? Math.abs(batteryPowerFlow) * (1 - PHYSICS_CONSTANTS.BATTERY_CHARGE_EFFICIENCY)
          : 0;
        const batteryDischargeLoss = batteryPowerFlow > 0
          ? batteryPowerFlow * (1 - PHYSICS_CONSTANTS.BATTERY_DISCHARGE_EFFICIENCY)
          : 0;

        // Battery internal resistance loss (I²R)
        const batteryCurrent = Math.abs(batteryPowerFlow * 1000) / systemVoltage; // Convert kW to W, then I = P/V
        const batteryResistiveLoss = calculateBatteryResistiveLoss(
          batteryCurrent,
          prevState.battery.internalResistance ?? 0.05
        );

        const losses = {
          wireLosses: {
            solarToBattery: wireLossSolar,
            batteryToHouse: wireLossBattery,
            gridToHouse: wireLossGrid,
            total: totalWireLoss,
          },
          inverterLoss,
          batteryLosses: {
            charging: batteryChargeLoss,
            discharging: batteryDischargeLoss,
            resistive: batteryResistiveLoss,
          },
          temperatureLosses: {
            solar: solarTempLoss,
            battery: 0,
          },
          totalLosses: totalWireLoss + inverterLoss + batteryChargeLoss + batteryDischargeLoss + batteryResistiveLoss + solarTempLoss,
        };

        const solarGenerated = solarPower * accumulationDeltaTimeHours;
        const consumedEnergy = totalConsumption * accumulationDeltaTimeHours;
        const gridImported = gridPower > 0 ? gridPower * accumulationDeltaTimeHours : 0;
        const gridExported = gridPower < 0 ? -gridPower * accumulationDeltaTimeHours : 0;

        const solarToConsumption = Math.min(solarPower, totalConsumption);
        const totalSolarUsed = prevState.solar.totalGenerated;
        const costSavings = calculateCostSavings(
          solarToConsumption * accumulationDeltaTimeHours,
          prevState.grid.totalExported,
          prevState.grid.totalImported
        );
        const co2Saved = calculateCO2Saved(totalSolarUsed);

        set({
          state: {
            ...prevState,
            currentTime: newTime,
            weather, // ✅ This now respects isManualWeatherControl

            solar: {
              ...prevState.solar,
              currentPower: solarPower,
              totalGenerated: prevState.solar.totalGenerated + solarGenerated,
            },

            battery: {
              ...prevState.battery,
              currentCharge: (newSoC / 100) * prevState.battery.capacity,
              stateOfCharge: newSoC,
              charging: batteryPowerFlow < 0,
              chargingRate: Math.abs(batteryPowerFlow),
            },

            consumption: {
              ...prevState.consumption,
              totalPower: totalConsumption,
              totalConsumed: prevState.consumption.totalConsumed + consumedEnergy,
            },

            grid: {
              ...prevState.grid,
              importing: gridPower > 0,
              exporting: gridPower < 0,
              currentFlow: gridPower,
              totalImported: prevState.grid.totalImported + gridImported,
              totalExported: prevState.grid.totalExported + gridExported,
            },

            statistics: {
              netEnergy: solarPower - totalConsumption,
              costSavings,
              co2Saved,
              efficiency: solarPower > 0
                ? ((solarPower - losses.totalLosses) / solarPower) * 100
                : prevState.statistics.efficiency,
            },

            losses,
          },
          lastUpdate: now,
        });
      },

      toggleAppliance: (applianceId: string) => {
        set((prev) => ({
          state: {
            ...prev.state,
            consumption: {
              ...prev.state.consumption,
              appliances: prev.state.consumption.appliances.map((app) =>
                app.id === applianceId && !app.alwaysOn
                  ? { ...app, isOn: !app.isOn }
                  : app
              ),
            },
          },
        }));
      },

      setTimeSpeed: (speed: number) => {
        set((prev) => ({
          state: { ...prev.state, timeSpeed: speed },
        }));
      },

      setTime: (time: number) => {
        set((prev) => ({
          state: { 
            ...prev.state, 
            currentTime: time,
            // ✅ FIX: Reset manual weather control when time is changed manually
            // This allows auto weather to work again after manual time change
            isManualWeatherControl: false,
          },
          lastUpdate: Date.now(),
        }));
      },

      togglePause: () => {
        set((prev) => ({
          state: { ...prev.state, isPaused: !prev.state.isPaused },
          lastUpdate: Date.now(),
        }));
      },

      setWeather: (weather: WeatherCondition) => {
        console.log('🌤️ Setting weather to:', weather); // Debug log

        // Auto-adjust time based on weather
        let newTime = get().state.currentTime;
        if (weather === 'sunny') {
          newTime = 12; // Noon for sunny
        } else if (weather === 'night') {
          newTime = 0; // Midnight for night
        } else if (weather === 'cloudy') {
          newTime = 14; // Afternoon for cloudy
        }

        set((prev) => ({
          state: {
            ...prev.state,
            currentTime: newTime,
            weather,
            isManualWeatherControl: true // ✅ This flag prevents auto-override
          },
        }));
      },

      resetSimulation: () => {
        set({
          state: INITIAL_STATE,
          lastUpdate: Date.now(),
        });
      },

      setSolarPanelCount: (count: number) => {
        set((prev) => ({
          state: {
            ...prev.state,
            solar: {
              ...prev.state.solar,
              panelCount: count,
              maxPower: (count * prev.state.solar.powerPerPanel) / 1000,
            },
          },
        }));
      },

      setSolarPanelPower: (watts: number) => {
        set((prev) => ({
          state: {
            ...prev.state,
            solar: {
              ...prev.state.solar,
              powerPerPanel: watts,
              maxPower: (prev.state.solar.panelCount * watts) / 1000,
            },
          },
        }));
      },

      setSolarPanelAngle: (angle: number) => {
        set((prev) => ({
          state: {
            ...prev.state,
            solar: {
              ...prev.state.solar,
              panelAngle: angle,
            },
          },
        }));
      },

      setSolarEfficiency: (efficiency: number) => {
        set((prev) => ({
          state: {
            ...prev.state,
            solar: {
              ...prev.state.solar,
              efficiency,
            },
          },
        }));
      },

      setIrradianceOverride: (irradiance: number | null) => {
        set((prev) => ({
          state: {
            ...prev.state,
            solar: {
              ...prev.state.solar,
              irradianceOverride: irradiance,
            },
          },
        }));
      },

      setBatteryInternalResistance: (resistance: number) => {
        set((prev) => ({
          state: {
            ...prev.state,
            battery: {
              ...prev.state.battery,
              internalResistance: resistance,
            },
          },
        }));
      },

      setBatteryConfig: (size: 'small' | 'medium' | 'large') => {
        const config = PHYSICS_CONSTANTS.BATTERY_CONFIGS[size];
        set((prev) => {
          const currentSoC = prev.state.battery.stateOfCharge;
          return {
            state: {
              ...prev.state,
              battery: {
                ...prev.state.battery,
                capacity: config.capacity,
                currentCharge: (currentSoC / 100) * config.capacity,
                internalResistance: config.internalResistance,
                maxChargeRate: config.capacity * config.maxCRate,
              },
            },
          };
        });
      },

      addBattery: (size: BatterySize) => {
        set((prev) => {
          // Max 12 batteries
          if (!prev.state.batteries || prev.state.batteries.length >= 12) return prev;

          const config = PHYSICS_CONSTANTS.BATTERY_CONFIGS[size];
          const newBattery: IndividualBattery = {
            id: `battery-${prev.state.batteries.length + 1}`,
            size,
            capacity: config.capacity,
            currentCharge: config.capacity * 0.5, // Start at 50%
            stateOfCharge: 50,
            internalResistance: config.internalResistance,
            maxCRate: config.maxCRate,
          };

          const newBatteries = [...prev.state.batteries, newBattery];

          // Compute aggregate state
          const totalCapacity = newBatteries.reduce((sum, b) => sum + b.capacity, 0);
          const totalCharge = newBatteries.reduce((sum, b) => sum + b.currentCharge, 0);
          const equivalentResistance = 1 / newBatteries.reduce((sum, b) => sum + (1 / b.internalResistance), 0);

          return {
            state: {
              ...prev.state,
              batteries: newBatteries,
              battery: {
                ...prev.state.battery,
                capacity: totalCapacity,
                currentCharge: totalCharge,
                stateOfCharge: (totalCharge / totalCapacity) * 100,
                internalResistance: equivalentResistance,
              },
            },
          };
        });
      },

      removeBattery: (id: string) => {
        set((prev) => {
          // Must have at least 1 battery
          if (!prev.state.batteries || prev.state.batteries.length <= 1) return prev;

          const newBatteries = prev.state.batteries.filter((b) => b.id !== id);

          // Compute aggregate state
          const totalCapacity = newBatteries.reduce((sum, b) => sum + b.capacity, 0);
          const totalCharge = newBatteries.reduce((sum, b) => sum + b.currentCharge, 0);
          const equivalentResistance = 1 / newBatteries.reduce((sum, b) => sum + (1 / b.internalResistance), 0);

          return {
            state: {
              ...prev.state,
              batteries: newBatteries,
              battery: {
                ...prev.state.battery,
                capacity: totalCapacity,
                currentCharge: totalCharge,
                stateOfCharge: (totalCharge / totalCapacity) * 100,
                internalResistance: equivalentResistance,
              },
            },
          };
        });
      },

      changeBatterySize: (id: string, size: BatterySize) => {
        set((prev) => {
          if (!prev.state.batteries) return prev;
          const config = PHYSICS_CONSTANTS.BATTERY_CONFIGS[size];
          const newBatteries = prev.state.batteries.map((b) => {
            if (b.id !== id) return b;

            // Preserve state of charge percentage when changing size
            return {
              ...b,
              size,
              capacity: config.capacity,
              currentCharge: (b.stateOfCharge / 100) * config.capacity,
              internalResistance: config.internalResistance,
              maxCRate: config.maxCRate,
            };
          });

          // Compute aggregate state
          const totalCapacity = newBatteries.reduce((sum, b) => sum + b.capacity, 0);
          const totalCharge = newBatteries.reduce((sum, b) => sum + b.currentCharge, 0);
          const equivalentResistance = 1 / newBatteries.reduce((sum, b) => sum + (1 / b.internalResistance), 0);

          return {
            state: {
              ...prev.state,
              batteries: newBatteries,
              battery: {
                ...prev.state.battery,
                capacity: totalCapacity,
                currentCharge: totalCharge,
                stateOfCharge: (totalCharge / totalCapacity) * 100,
                internalResistance: equivalentResistance,
              },
            },
          };
        });
      },

      setSystemVoltage: (voltage: number) => {
        set((prev) => ({
          state: {
            ...prev.state,
            system: {
              ...prev.state.system,
              voltage,
            },
          },
        }));
      },

      setWireGauge: (gauge: string) => {
        set((prev) => ({
          state: {
            ...prev.state,
            system: {
              ...prev.state.system,
              wireGauge: gauge,
            },
          },
        }));
      },

      setMinMaxSoC: (min: number, max: number) => {
        set((prev) => ({
          state: {
            ...prev.state,
            battery: {
              ...prev.state.battery,
              minSoC: min,
              maxSoC: max,
            },
          },
        }));
      },
    }),
    {
      name: 'energy-simulation-storage',
      partialize: (state) => ({
        state: state.state,
      }),
    }
  )
);