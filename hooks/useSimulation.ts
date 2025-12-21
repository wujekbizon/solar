'use client';

import { useEffect } from 'react';
import { useEnergyStore } from '@/store/energyStore';

/**
 * Hook that wraps the Zustand energy store and adds animation loop
 * Maintains same API as original useState-based implementation
 */
export function useSimulation() {
  const state = useEnergyStore((store) => store.state);
  const updateSimulation = useEnergyStore((store) => store.updateSimulation);
  const toggleAppliance = useEnergyStore((store) => store.toggleAppliance);
  const setTimeSpeed = useEnergyStore((store) => store.setTimeSpeed);
  const setTime = useEnergyStore((store) => store.setTime);
  const togglePause = useEnergyStore((store) => store.togglePause);
  const setWeather = useEnergyStore((store) => store.setWeather);
  const resetSimulation = useEnergyStore((store) => store.resetSimulation);
  const setSolarPanelCount = useEnergyStore((store) => store.setSolarPanelCount);
  const setSolarPanelPower = useEnergyStore((store) => store.setSolarPanelPower);

  // Animation loop - 30 FPS for physics updates
  useEffect(() => {
    const interval = setInterval(updateSimulation, 1000 / 30);
    return () => clearInterval(interval);
  }, [updateSimulation]);

  return {
    state,
    toggleAppliance,
    setTimeSpeed,
    setTime,
    togglePause,
    setWeather,
    resetSimulation,
    setSolarPanelCount,
    setSolarPanelPower,
  };
}
