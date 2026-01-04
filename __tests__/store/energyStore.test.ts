import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useEnergyStore } from '@/store/energyStore';
import {
  setupTestTime,
  advanceTime,
  setBatterySoC,
  setAppliances,
  assertSoCNear,
} from '../fixtures/testHelpers';

describe('Energy Store Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear(); // Clear persisted state
  });

  describe('Scenario 1: Sunny Day Charging (12:00, 1h)', () => {
    it('should charge battery 50% -> ~82.0% over 1 hour at noon with fridge only', () => {
      // Setup time mocking FIRST
      const mockNow = 1000000;
      setupTestTime(mockNow);

      useEnergyStore.getState().resetSimulation(); // Reset AFTER mocking time

      // Configure solar: 56 panels × 100W = 5.6 kW max → ~4.85 kW at noon
      useEnergyStore.getState().setSolarPanelPower(100);

      // Set initial state
      useEnergyStore.getState().setTime(12); // noon
      useEnergyStore.getState().setWeather('sunny'); // enables manual weather control
      setBatterySoC(50);

      // Advance 1 hour
      advanceTime(3600000); // 1 hour in ms
      useEnergyStore.getState().updateSimulation();

      const finalState = useEnergyStore.getState();
   
      // Get final state
      const state = finalState.state;

      // Assert expected values (±0.5% tolerance)
      assertSoCNear(state.battery.stateOfCharge, 82.0, 0.5);

      // Solar power should be ~4.85 kW at noon (56 panels × 100W)
      expect(state.solar.currentPower).toBeCloseTo(4.85, 0);

      // Consumption should be 0.15 kW (fridge only)
      expect(state.consumption.totalPower).toBeCloseTo(0.15, 1);

      // Battery should be charging
      expect(state.battery.charging).toBe(true);

      // Grid should not be importing
      expect(state.grid.importing).toBe(false);

      // Battery power should be ~-4.0 kW (negative = charging)
      const batteryPower = state.battery.charging 
        ? -state.battery.chargingRate 
        : state.battery.chargingRate;
      expect(Math.abs(batteryPower)).toBeGreaterThan(3.5);
    });
  });

  describe('Scenario 2: Night Discharge (22:00, 2h)', () => {
    it('should discharge battery 85% -> ~29.0% over 2 hours at night with AC+fridge', () => {
      // Setup time mocking FIRST
      const mockNow = 2000000;
      setupTestTime(mockNow);

      const store = useEnergyStore.getState();
      store.resetSimulation(); 
      // Set initial state
      store.setTime(22); // 10 PM
      store.setWeather('night'); // enables manual weather control
      setBatterySoC(85);

      // Turn on AC (fridge already on)
      setAppliances({ ac: true });

      // Advance 2 hours
      advanceTime(2 * 3600000); // 2 hours in ms
      store.updateSimulation();

      // Get final state
      const state = store.state;

      // Assert expected values (±0.5% tolerance)
      assertSoCNear(state.battery.stateOfCharge, 29.0, 0.5);

      // Solar power should be 0 kW (night)
      expect(state.solar.currentPower).toBe(0);

      // Consumption should be 3.65 kW (AC 3.5 + fridge 0.15)
      expect(state.consumption.totalPower).toBeCloseTo(3.65, 1);

      // Battery should be discharging (not charging)
      expect(state.battery.charging).toBe(false);

      // Battery power should be ~+3.65 kW (positive = discharging)
      const batteryPower = state.battery.charging 
        ? -state.battery.chargingRate 
        : state.battery.chargingRate;
      expect(batteryPower).toBeGreaterThan(3.0);
    });
  });

  describe('Scenario 3: Grid Import (evening, EV charging)', () => {
    it('should import 7.15 kW from grid when battery at minSoC (20%)', () => {
      // Setup time mocking FIRST
      const mockNow = 1000000;
      setupTestTime(mockNow);

      const store = useEnergyStore.getState();
      store.resetSimulation(); // Reset AFTER mocking time

      // Set initial state
      store.setTime(20); // 8 PM (evening)
      store.setWeather('night'); // enables manual weather control
      setBatterySoC(20); // At minimum threshold

      // Turn on EV charger (turn off AC if it's on, keep fridge on)
      setAppliances({
        'electric-car': true,
        ac: false,
      });

      // Advance small time to update state
      advanceTime(60000); // 1 minute
      store.updateSimulation();

      // Get final state
      const state = store.state;

      // Solar power should be 0 kW (evening/night)
      expect(state.solar.currentPower).toBe(0);

      // Consumption should be 7.15 kW (EV 7.0 + fridge 0.15)
      expect(state.consumption.totalPower).toBeCloseTo(7.15, 1);

      // Battery should be blocked at minSoC (20%)
      // SoC should stay at or near 20%
      expect(state.battery.stateOfCharge).toBeLessThanOrEqual(21);
      expect(state.battery.stateOfCharge).toBeGreaterThanOrEqual(19);

      // Battery power should be ~0 kW (blocked)
      const batteryPower = Math.abs(
        state.battery.charging 
          ? -state.battery.chargingRate 
          : state.battery.chargingRate
      );
      expect(batteryPower).toBeLessThan(0.5);

      // Grid should be importing
      expect(state.grid.importing).toBe(true);

      // Grid power should be ~7.15 kW (importing to cover consumption)
      expect(state.grid.currentFlow).toBeGreaterThan(7.0);
    });
  });
});
