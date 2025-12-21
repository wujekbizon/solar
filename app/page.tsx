'use client';

import dynamic from 'next/dynamic';
import { useSimulation } from '@/hooks/useSimulation';
import Dashboard from '@/components/UI/Dashboard';
import Controls from '@/components/UI/Controls';

// Dynamically import Scene to avoid SSR issues with Three.js
const Scene = dynamic(() => import('@/components/Scene/Scene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-blue-100 to-blue-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Ładowanie sceny 3D...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  const {
    state,
    toggleAppliance,
    setTimeSpeed,
    setTime,
    togglePause,
    setWeather,
    resetSimulation,
    setSolarPanelCount,
    setSolarPanelPower,
  } = useSimulation();

  return (
    <div className="grid grid-cols-[400px_1fr_400px] h-screen gap-0 bg-black overflow-hidden">
      {/* Left: Controls */}
      <div className="overflow-y-auto overflow-x-hidden bg-[#141920]">
        <Controls
          currentTime={state.currentTime}
          timeSpeed={state.timeSpeed}
          isPaused={state.isPaused}
          weather={state.weather}
          appliances={state.consumption.appliances}
          solarPanelCount={state.solar.panelCount}
          solarPowerPerPanel={state.solar.powerPerPanel}
          onTimeChange={setTime}
          onTimeSpeedChange={setTimeSpeed}
          onTogglePause={togglePause}
          onWeatherChange={setWeather}
          onToggleAppliance={toggleAppliance}
          onReset={resetSimulation}
          onSolarPanelCountChange={setSolarPanelCount}
          onSolarPanelPowerChange={setSolarPanelPower}
        />
      </div>

      {/* Center: 3D Scene */}
      <div className="bg-black h-full overflow-hidden">
        <Scene energyState={state} onApplianceClick={toggleAppliance} key={state.solar.panelCount} />
      </div>

      {/* Right: Dashboard */}
      <div className="overflow-y-auto overflow-x-hidden bg-[#141920]">
        <Dashboard state={state} />
      </div>
    </div>
  );
}
