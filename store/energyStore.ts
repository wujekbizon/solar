import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EnergySystemState, ApplianceState, WeatherCondition } from '@/types/energy';
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
} from '@/utils/energyCalculations';

const INITIAL_APPLIANCES: ApplianceState[] = [
  {
    id: 'light-1',
    name: 'Światło w salonie',
    type: 'light',
    powerRating: PHYSICS_CONSTANTS.APPLIANCE_POWER.light,
    isOn: false,
    position: { x: 2, y: 1, z: 2 },
    alwaysOn: false,
  },
  {
    id: 'light-2',
    name: 'Światło w kuchni',
    type: 'light',
    powerRating: PHYSICS_CONSTANTS.APPLIANCE_POWER.light,
    isOn: false,
    position: { x: -2, y: 1, z: 2 },
    alwaysOn: false,
  },
  {
    id: 'refrigerator',
    name: 'Lodówka',
    type: 'refrigerator',
    powerRating: PHYSICS_CONSTANTS.APPLIANCE_POWER.refrigerator,
    isOn: true,
    position: { x: -3, y: 0.5, z: 1 },
    alwaysOn: true,
  },
  {
    id: 'ac',
    name: 'Klimatyzacja',
    type: 'ac',
    powerRating: PHYSICS_CONSTANTS.APPLIANCE_POWER.ac,
    isOn: false,
    position: { x: 0, y: 2, z: -3 },
    alwaysOn: false,
  },
  {
    id: 'tv',
    name: 'Telewizor',
    type: 'tv',
    powerRating: PHYSICS_CONSTANTS.APPLIANCE_POWER.tv,
    isOn: false,
    position: { x: 3, y: 1, z: -1 },
    alwaysOn: false,
  },
  {
    id: 'computer',
    name: 'Komputer',
    type: 'computer',
    powerRating: PHYSICS_CONSTANTS.APPLIANCE_POWER.computer,
    isOn: false,
    position: { x: -2, y: 0.8, z: -2 },
    alwaysOn: false,
  },
];

const INITIAL_STATE: EnergySystemState = {
  currentTime: 12, // Start at noon
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
    powerPerPanel: 250,
  },

  battery: {
    capacity: PHYSICS_CONSTANTS.BATTERY_CAPACITY,
    currentCharge: PHYSICS_CONSTANTS.BATTERY_CAPACITY * 0.5, // Start at 50%
    stateOfCharge: 50,
    charging: false,
    chargingRate: 0,
    efficiency: PHYSICS_CONSTANTS.BATTERY_EFFICIENCY,
    chargeEfficiency: PHYSICS_CONSTANTS.BATTERY_CHARGE_EFFICIENCY,
    dischargeEfficiency: PHYSICS_CONSTANTS.BATTERY_DISCHARGE_EFFICIENCY,
    maxChargeRate: PHYSICS_CONSTANTS.BATTERY_MAX_CHARGE_RATE,
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
    batteryLosses: { charging: 0, discharging: 0 },
    temperatureLosses: { solar: 0, battery: 0 },
    totalLosses: 0,
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

        // Convert to hours (scaled by simulation speed)
        const visualDeltaTimeHours = (deltaTimeMs / 1000 / 3600) * prevState.timeSpeed;

        // 100x speedup for energy accumulation (demo purposes)
        const ACCUMULATION_MULTIPLIER = 100;
        const accumulationDeltaTimeHours = visualDeltaTimeHours * ACCUMULATION_MULTIPLIER;

        // Update time (use visual delta for day/night cycle)
        let newTime = prevState.currentTime + visualDeltaTimeHours;
        if (newTime >= 24) newTime -= 24;

        // Only auto-calculate weather if not manually controlled by user
        const weather = prevState.isManualWeatherControl
          ? prevState.weather
          : getWeatherFromTime(newTime);

        // Calculate solar power
        const solarPower = calculateSolarPower(newTime, weather, prevState.solar.efficiency, prevState.solar.maxPower);

        // Calculate total consumption
        const totalConsumption = calculateTotalConsumption(prevState.consumption.appliances);

        // Calculate battery power needed
        const batteryPowerFlow = calculateBatteryPower(
          solarPower,
          totalConsumption,
          prevState.battery.stateOfCharge
        );

        // Calculate current temperature
        const currentTemp = calculateTemperature(newTime);

        // Update battery state of charge (use accumulation delta for faster changes)
        const newSoC = calculateBatterySoC(
          prevState.battery.stateOfCharge,
          -batteryPowerFlow, // Negative because positive batteryPowerFlow means discharging
          accumulationDeltaTimeHours,
          prevState.battery.capacity,
          prevState.battery.chargeEfficiency,
          prevState.battery.dischargeEfficiency,
          currentTemp
        );

        // Calculate grid power
        const gridPower = calculateGridPower(solarPower, batteryPowerFlow, totalConsumption);

        // Calculate energy losses
        // Wire losses
        const wireLossSolar = solarPower > 0 && batteryPowerFlow < 0
          ? calculateWireLoss(Math.abs(batteryPowerFlow), PHYSICS_CONSTANTS.WIRE_RESISTANCE.solarToBattery)
          : 0;
        const wireLossBattery = batteryPowerFlow > 0
          ? calculateWireLoss(batteryPowerFlow, PHYSICS_CONSTANTS.WIRE_RESISTANCE.batteryToHouse)
          : 0;
        const wireLossGrid = gridPower > 0
          ? calculateWireLoss(gridPower, PHYSICS_CONSTANTS.WIRE_RESISTANCE.gridToHouse)
          : 0;
        const totalWireLoss = wireLossSolar + wireLossBattery + wireLossGrid;

        // Inverter loss (DC→AC for house consumption)
        const inverterLoss = totalConsumption * (1 - PHYSICS_CONSTANTS.INVERTER_EFFICIENCY);

        // Solar temperature loss
        const solarTempLoss = calculateSolarTempLoss(solarPower, currentTemp);

        // Battery losses (from charge/discharge inefficiency)
        const batteryChargeLoss = batteryPowerFlow < 0
          ? Math.abs(batteryPowerFlow) * (1 - PHYSICS_CONSTANTS.BATTERY_CHARGE_EFFICIENCY)
          : 0;
        const batteryDischargeLoss = batteryPowerFlow > 0
          ? batteryPowerFlow * (1 - PHYSICS_CONSTANTS.BATTERY_DISCHARGE_EFFICIENCY)
          : 0;

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
          },
          temperatureLosses: {
            solar: solarTempLoss,
            battery: 0, // Included in battery efficiency adjustment
          },
          totalLosses: totalWireLoss + inverterLoss + batteryChargeLoss + batteryDischargeLoss + solarTempLoss,
        };

        // Update totals (use accumulation delta for faster visible changes)
        const solarGenerated = solarPower * accumulationDeltaTimeHours;
        const consumedEnergy = totalConsumption * accumulationDeltaTimeHours;
        const gridImported = gridPower > 0 ? gridPower * accumulationDeltaTimeHours : 0;
        const gridExported = gridPower < 0 ? -gridPower * accumulationDeltaTimeHours : 0;

        // Calculate statistics
        const totalSolarUsed = prevState.solar.totalGenerated;
        const costSavings = calculateCostSavings(
          totalSolarUsed,
          prevState.grid.totalExported,
          prevState.grid.totalImported
        );
        const co2Saved = calculateCO2Saved(totalSolarUsed);

        set({
          state: {
            ...prevState,
            currentTime: newTime,
            weather,

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
              efficiency: totalSolarUsed > 0 ? (totalSolarUsed / prevState.solar.totalGenerated) * 100 : 0,
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
          state: { ...prev.state, currentTime: time },
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
        set((prev) => ({
          state: { ...prev.state, weather, isManualWeatherControl: true },
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
    }),
    {
      name: 'energy-simulation-storage',
      partialize: (state) => ({
        state: state.state,
        // Don't persist lastUpdate - it should reset on page load
      }),
    }
  )
);
