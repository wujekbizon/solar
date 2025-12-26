'use client';

import { useState } from 'react';
import { useEnergyStore } from '@/store/energyStore';
import Controls from './UI/Controls';
import ApplianceDetailsPanel from './UI/ApplianceDetailsPanel';
import { EnergySystemState } from '@/types/energy';

/**
 * Container component that connects Controls to Zustand store
 * This avoids prop drilling through page.tsx
 */
export default function ControlsContainer({state} :{state: EnergySystemState}) {
  const [selectedApplianceId, setSelectedApplianceId] = useState<string | null>(null);

  const { currentTime, timeSpeed, isPaused, weather } = state;
  // Select all the state we need
//   const currentTime = useEnergyStore((store) => store.state.currentTime);
//   const timeSpeed = useEnergyStore((store) => store.state.timeSpeed);
//   const isPaused = useEnergyStore((store) => store.state.isPaused);
//   const weather = useEnergyStore((store) => store.state.weather);
const appliances = useEnergyStore((store) => store.state.consumption.appliances);
  
  // Solar state
  const solarPanelCount = useEnergyStore((store) => store.state.solar.panelCount);
  const solarPowerPerPanel = useEnergyStore((store) => store.state.solar.powerPerPanel);
  const solarPanelAngle = useEnergyStore((store) => store.state.solar.panelAngle ?? 30);
  const solarEfficiency = useEnergyStore((store) => store.state.solar.efficiency);
  const solarIrradianceOverride = useEnergyStore((store) => store.state.solar.irradianceOverride);
  
  // Battery state
  const batteries = useEnergyStore((store) => store.state.batteries);
  const batteryCapacity = useEnergyStore((store) => store.state.battery.capacity);
  const batteryInternalResistance = useEnergyStore((store) => store.state.battery.internalResistance ?? 0.05);
  const batteryMinSoC = useEnergyStore((store) => store.state.battery.minSoC ?? 20);
  const batteryMaxSoC = useEnergyStore((store) => store.state.battery.maxSoC ?? 95);
  const batteryCRate = useEnergyStore((store) => store.state.battery.cRate ?? 0);
  const batteryDoD = useEnergyStore((store) => store.state.battery.depthOfDischarge ?? 0);
  
  // System state
  const systemVoltage = useEnergyStore((store) => store.state.system?.voltage ?? 240);
  const wireGauge = useEnergyStore((store) => store.state.system?.wireGauge ?? '8AWG');
  const currentPower = useEnergyStore((store) => store.state.consumption.totalPower);
  const totalEfficiency = useEnergyStore((store) => store.state.system?.totalEfficiency ?? 0);
  
  // Actions
  const setTime = useEnergyStore((store) => store.setTime);
  const setTimeSpeed = useEnergyStore((store) => store.setTimeSpeed);
  const togglePause = useEnergyStore((store) => store.togglePause);
  const setWeather = useEnergyStore((store) => store.setWeather);
  const toggleAppliance = useEnergyStore((store) => store.toggleAppliance);
  const resetSimulation = useEnergyStore((store) => store.resetSimulation);
  const setSolarPanelCount = useEnergyStore((store) => store.setSolarPanelCount);
  const setSolarPanelPower = useEnergyStore((store) => store.setSolarPanelPower);
  const setSolarPanelAngle = useEnergyStore((store) => store.setSolarPanelAngle);
  const setSolarEfficiency = useEnergyStore((store) => store.setSolarEfficiency);
  const setIrradianceOverride = useEnergyStore((store) => store.setIrradianceOverride);
  const setBatteryInternalResistance = useEnergyStore((store) => store.setBatteryInternalResistance);
  const setMinMaxSoC = useEnergyStore((store) => store.setMinMaxSoC);
  const setSystemVoltage = useEnergyStore((store) => store.setSystemVoltage);
  const setWireGauge = useEnergyStore((store) => store.setWireGauge);
  const setBatteryConfig = useEnergyStore((store) => store.setBatteryConfig);
  const addBattery = useEnergyStore((store) => store.addBattery);
  const removeBattery = useEnergyStore((store) => store.removeBattery);
  const changeBatterySize = useEnergyStore((store) => store.changeBatterySize);

  return (
    <div className="relative">
      <Controls
        currentTime={currentTime}
        timeSpeed={timeSpeed}
        isPaused={isPaused}
        weather={weather}
        appliances={appliances}
        solarPanelCount={solarPanelCount}
        solarPowerPerPanel={solarPowerPerPanel}
        solarPanelAngle={solarPanelAngle}
        solarEfficiency={solarEfficiency}
        solarIrradianceOverride={solarIrradianceOverride}
        batteries={batteries}
        batteryCapacity={batteryCapacity}
        batteryInternalResistance={batteryInternalResistance}
        batteryMinSoC={batteryMinSoC}
        batteryMaxSoC={batteryMaxSoC}
        batteryCRate={batteryCRate}
        batteryDoD={batteryDoD}
        systemVoltage={systemVoltage}
        wireGauge={wireGauge}
        currentPower={currentPower}
        totalEfficiency={totalEfficiency}
        onTimeChange={setTime}
        onTimeSpeedChange={setTimeSpeed}
        onTogglePause={togglePause}
        onWeatherChange={setWeather}
        onToggleAppliance={toggleAppliance}
        onApplianceDetailsClick={(id) => setSelectedApplianceId(id)}
        onReset={resetSimulation}
        onSolarPanelCountChange={setSolarPanelCount}
        onSolarPanelPowerChange={setSolarPanelPower}
        onSolarPanelAngleChange={setSolarPanelAngle}
        onSolarEfficiencyChange={setSolarEfficiency}
        onIrradianceOverrideChange={setIrradianceOverride}
        onBatteryInternalResistanceChange={setBatteryInternalResistance}
        onMinMaxSoCChange={setMinMaxSoC}
        onSystemVoltageChange={setSystemVoltage}
        onWireGaugeChange={setWireGauge}
        onBatteryCapacityChange={setBatteryConfig}
        onAddBattery={addBattery}
        onRemoveBattery={removeBattery}
        onChangeBatterySize={changeBatterySize}
      />

      {selectedApplianceId && (() => {
        const appliance = state.consumption.appliances.find(a => a.id === selectedApplianceId);
        if (!appliance) return null;
        return (
          <div className="fixed left-[400px] top-0 bottom-0 z-50 flex items-start py-4 animate-in slide-in-from-left duration-200">
            <ApplianceDetailsPanel
              appliance={appliance}
              systemVoltage={state.system.voltage}
              currentTime={state.currentTime}
              onClose={() => setSelectedApplianceId(null)}
            />
          </div>
        );
      })()}
    </div>
  );
}