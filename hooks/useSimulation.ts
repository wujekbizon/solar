'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
} from '@/utils/energyCalculations';

const INITIAL_APPLIANCES: ApplianceState[] = [
  {
    id: 'light-1',
    name: 'Living Room Light',
    type: 'light',
    powerRating: PHYSICS_CONSTANTS.APPLIANCE_POWER.light,
    isOn: false,
    position: { x: 2, y: 1, z: 2 },
    alwaysOn: false,
  },
  {
    id: 'light-2',
    name: 'Kitchen Light',
    type: 'light',
    powerRating: PHYSICS_CONSTANTS.APPLIANCE_POWER.light,
    isOn: false,
    position: { x: -2, y: 1, z: 2 },
    alwaysOn: false,
  },
  {
    id: 'refrigerator',
    name: 'Refrigerator',
    type: 'refrigerator',
    powerRating: PHYSICS_CONSTANTS.APPLIANCE_POWER.refrigerator,
    isOn: true,
    position: { x: -3, y: 0.5, z: 1 },
    alwaysOn: true,
  },
  {
    id: 'ac',
    name: 'Air Conditioner',
    type: 'ac',
    powerRating: PHYSICS_CONSTANTS.APPLIANCE_POWER.ac,
    isOn: false,
    position: { x: 0, y: 2, z: -3 },
    alwaysOn: false,
  },
  {
    id: 'tv',
    name: 'Television',
    type: 'tv',
    powerRating: PHYSICS_CONSTANTS.APPLIANCE_POWER.tv,
    isOn: false,
    position: { x: 3, y: 1, z: -1 },
    alwaysOn: false,
  },
  {
    id: 'computer',
    name: 'Computer',
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

  solar: {
    maxPower: PHYSICS_CONSTANTS.SOLAR_MAX_POWER,
    currentPower: 0,
    efficiency: PHYSICS_CONSTANTS.SOLAR_PANEL_EFFICIENCY,
    totalGenerated: 0,
    panelAngle: 30,
  },

  battery: {
    capacity: PHYSICS_CONSTANTS.BATTERY_CAPACITY,
    currentCharge: PHYSICS_CONSTANTS.BATTERY_CAPACITY * 0.5, // Start at 50%
    stateOfCharge: 50,
    charging: false,
    chargingRate: 0,
    efficiency: PHYSICS_CONSTANTS.BATTERY_EFFICIENCY,
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
};

export function useSimulation() {
  const [state, setState] = useState<EnergySystemState>(INITIAL_STATE);
  const lastUpdateRef = useRef<number>(Date.now());

  // Update simulation
  const updateSimulation = useCallback(() => {
    setState((prevState) => {
      if (prevState.isPaused) return prevState;

      const now = Date.now();
      const deltaTimeMs = now - lastUpdateRef.current;
      lastUpdateRef.current = now;

      // Convert to hours (scaled by simulation speed)
      const deltaTimeHours = (deltaTimeMs / 1000 / 3600) * prevState.timeSpeed;

      // Update time
      let newTime = prevState.currentTime + deltaTimeHours;
      if (newTime >= 24) newTime -= 24;

      // Determine weather based on time
      const weather = getWeatherFromTime(newTime);

      // Calculate solar power
      const solarPower = calculateSolarPower(newTime, weather, prevState.solar.efficiency);

      // Calculate total consumption
      const totalConsumption = calculateTotalConsumption(prevState.consumption.appliances);

      // Calculate battery power needed
      const batteryPowerFlow = calculateBatteryPower(
        solarPower,
        totalConsumption,
        prevState.battery.stateOfCharge
      );

      // Update battery state of charge
      const newSoC = calculateBatterySoC(
        prevState.battery.stateOfCharge,
        -batteryPowerFlow, // Negative because positive batteryPowerFlow means discharging
        deltaTimeHours,
        prevState.battery.capacity,
        prevState.battery.efficiency
      );

      // Calculate grid power
      const gridPower = calculateGridPower(solarPower, batteryPowerFlow, totalConsumption);

      // Update totals
      const solarGenerated = solarPower * deltaTimeHours;
      const consumedEnergy = totalConsumption * deltaTimeHours;
      const gridImported = gridPower > 0 ? gridPower * deltaTimeHours : 0;
      const gridExported = gridPower < 0 ? -gridPower * deltaTimeHours : 0;

      // Calculate statistics
      const totalSolarUsed = prevState.solar.totalGenerated;
      const costSavings = calculateCostSavings(
        totalSolarUsed,
        prevState.grid.totalExported,
        prevState.grid.totalImported
      );
      const co2Saved = calculateCO2Saved(totalSolarUsed);

      return {
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
          netEnergy: solarPower + batteryPowerFlow - totalConsumption,
          costSavings,
          co2Saved,
          efficiency: totalSolarUsed > 0 ? (totalSolarUsed / prevState.solar.totalGenerated) * 100 : 0,
        },
      };
    });
  }, []);

  // Animation loop
  useEffect(() => {
    const interval = setInterval(updateSimulation, 1000 / 30); // 30 FPS for physics
    return () => clearInterval(interval);
  }, [updateSimulation]);

  // Control functions
  const toggleAppliance = useCallback((applianceId: string) => {
    setState((prev) => ({
      ...prev,
      consumption: {
        ...prev.consumption,
        appliances: prev.consumption.appliances.map((app) =>
          app.id === applianceId && !app.alwaysOn
            ? { ...app, isOn: !app.isOn }
            : app
        ),
      },
    }));
  }, []);

  const setTimeSpeed = useCallback((speed: number) => {
    setState((prev) => ({ ...prev, timeSpeed: speed }));
  }, []);

  const setTime = useCallback((time: number) => {
    setState((prev) => ({ ...prev, currentTime: time }));
    lastUpdateRef.current = Date.now();
  }, []);

  const togglePause = useCallback(() => {
    setState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
    lastUpdateRef.current = Date.now();
  }, []);

  const setWeather = useCallback((weather: WeatherCondition) => {
    setState((prev) => ({ ...prev, weather }));
  }, []);

  const resetSimulation = useCallback(() => {
    setState(INITIAL_STATE);
    lastUpdateRef.current = Date.now();
  }, []);

  return {
    state,
    toggleAppliance,
    setTimeSpeed,
    setTime,
    togglePause,
    setWeather,
    resetSimulation,
  };
}
