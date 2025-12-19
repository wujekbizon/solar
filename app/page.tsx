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
        <p className="text-gray-600 font-medium">Loading 3D Scene...</p>
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
  } = useSimulation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <h1 className="text-4xl font-bold mb-2">Smart Home Energy Flow Simulation</h1>
          <p className="text-blue-100">
            Interactive 3D visualization of solar energy generation, battery storage, and home consumption
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 3D Scene - Takes up 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-4">
                <h2 className="text-2xl font-semibold">3D Visualization</h2>
                <p className="text-sm text-blue-100 mt-1">
                  Orbit: Left Click + Drag | Zoom: Scroll | Pan: Right Click + Drag
                </p>
              </div>
              <div className="relative" style={{ height: '600px' }}>
                <Scene energyState={state} onApplianceClick={toggleAppliance} />
              </div>
            </div>

            {/* Physics Explanation */}
            <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">📚 Physics Principles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-blue-50 p-4 rounded">
                  <h4 className="font-semibold text-blue-900 mb-2">Energy Conservation Law</h4>
                  <p className="text-gray-700">
                    Total energy in the system remains constant. Energy can be transformed but not created or destroyed:
                  </p>
                  <code className="block mt-2 bg-white p-2 rounded text-xs">
                    E_in = E_out + E_stored
                  </code>
                </div>
                <div className="bg-yellow-50 p-4 rounded">
                  <h4 className="font-semibold text-yellow-900 mb-2">Power Equations</h4>
                  <p className="text-gray-700">
                    Solar power generation based on time and weather:
                  </p>
                  <code className="block mt-2 bg-white p-2 rounded text-xs">
                    P = P_max × η × I × cos(θ)
                  </code>
                </div>
                <div className="bg-green-50 p-4 rounded">
                  <h4 className="font-semibold text-green-900 mb-2">Battery Physics</h4>
                  <p className="text-gray-700">
                    State of charge calculation with efficiency losses:
                  </p>
                  <code className="block mt-2 bg-white p-2 rounded text-xs">
                    SoC(t) = SoC(t-1) + (ΔE/C) × η × 100%
                  </code>
                </div>
                <div className="bg-purple-50 p-4 rounded">
                  <h4 className="font-semibold text-purple-900 mb-2">Energy Efficiency</h4>
                  <p className="text-gray-700">
                    System efficiency with conversion losses:
                  </p>
                  <code className="block mt-2 bg-white p-2 rounded text-xs">
                    η = (E_useful / E_total) × 100%
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Dashboard and Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Dashboard */}
            <Dashboard state={state} />

            {/* Controls */}
            <Controls
              currentTime={state.currentTime}
              timeSpeed={state.timeSpeed}
              isPaused={state.isPaused}
              weather={state.weather}
              appliances={state.consumption.appliances}
              onTimeChange={setTime}
              onTimeSpeedChange={setTimeSpeed}
              onTogglePause={togglePause}
              onWeatherChange={setWeather}
              onToggleAppliance={toggleAppliance}
              onReset={resetSimulation}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-12">
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3">About This Project</h3>
              <p className="text-gray-300 text-sm">
                An interactive physics simulation demonstrating energy conservation, power equations,
                and battery storage in a smart home environment with solar panels.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Technology Stack</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Next.js - React Framework</li>
                <li>• Three.js - 3D Graphics</li>
                <li>• TypeScript - Type Safety</li>
                <li>• Tailwind CSS - Styling</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Features</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Real-time energy flow simulation</li>
                <li>• Interactive 3D visualization</li>
                <li>• Physics-based calculations</li>
                <li>• Cost & environmental impact tracking</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400 text-sm">
            <p>Smart Home Energy Flow Simulation © 2024 | Built with Next.js & Three.js</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
