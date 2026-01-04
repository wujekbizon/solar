'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useEnergyStore } from '@/store/energyStore';
import Dashboard from '@/components/UI/Dashboard';
import ControlsContainer from './ControlsContainer';

const Scene = dynamic(() => import('./Scene/Scene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-blue-900/20 to-blue-950/20">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4" />
        <p className="text-blue-300 font-medium">Loading 3D Scene...</p>
      </div>
    </div>
  ),
});

export default function SimulationView() {
  const updateSimulation = useEnergyStore((store) => store.updateSimulation);
  const toggleAppliance = useEnergyStore((store) => store.toggleAppliance);
  const state = useEnergyStore((store) => store.state);

  useEffect(() => {
    const interval = setInterval(updateSimulation, 1000 / 30);
    return () => clearInterval(interval);
  }, [updateSimulation]);

  return (
    <div className="grid grid-cols-[400px_1fr_400px] h-screen gap-0 bg-black overflow-hidden">
      <div className="overflow-y-auto overflow-x-hidden bg-[#141920] scrollbar-webkit">
        <ControlsContainer state={state} />
      </div>

      <div className="bg-black h-full overflow-hidden">
        <Scene
          energyState={state}
          onApplianceClick={toggleAppliance}
        />
      </div>
      
      <div className="overflow-y-auto overflow-x-hidden bg-[#141920] scrollbar-webkit">
        <Dashboard state={state} />
      </div>
    </div>
  );
}