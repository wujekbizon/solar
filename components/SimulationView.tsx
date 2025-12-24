'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useEnergyStore } from '@/store/energyStore';
import Dashboard from '@/components/UI/Dashboard';
import ControlsContainer from './ControlsContainer';

const Scene = dynamic(() => import('@/components/Scene/Scene'), {
  ssr: false,
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
      <div className="overflow-y-auto overflow-x-hidden bg-[#141920]">
        <ControlsContainer state={state}  />
      </div>

      <div className="bg-black h-full overflow-hidden">
        <Scene 
          energyState={state} 
          onApplianceClick={toggleAppliance} 
          key={state.solar.panelCount} 
        />
      </div>
      <div className="overflow-y-auto overflow-x-hidden bg-[#141920]">
        <Dashboard state={state} />
      </div>
    </div>
  );
}