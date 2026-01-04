'use client';

import { Clock, Play, Pause, CloudSun, Sun, Cloud, Moon, Home, RotateCcw, Zap, Settings, Battery as BatteryIcon } from 'lucide-react';
import type { ApplianceState, WeatherCondition, IndividualBattery, BatterySize } from '@/types/energy';
import { useState } from 'react';

interface ControlsProps {
  currentTime: number;
  timeSpeed: number;
  isPaused: boolean;
  weather: WeatherCondition;
  appliances: ApplianceState[];
  solarPanelCount: number;
  solarPowerPerPanel: number;
  solarPanelAngle: number;
  solarEfficiency: number;
  solarIrradianceOverride: number | null;
  batteries: IndividualBattery[];
  batteryCapacity: number;
  batteryInternalResistance: number;
  batteryMinSoC: number;
  batteryMaxSoC: number;
  batteryCRate: number;
  batteryDoD: number;
  systemVoltage: number;
  wireGauge: string;
  currentPower: number;
  totalEfficiency: number;
  onTimeChange: (time: number) => void;
  onTimeSpeedChange: (speed: number) => void;
  onTogglePause: () => void;
  onWeatherChange: (weather: WeatherCondition) => void;
  onToggleAppliance: (applianceId: string) => void;
  onApplianceDetailsClick: (applianceId: string) => void;
  onReset: () => void;
  onSolarPanelCountChange: (count: number) => void;
  onSolarPanelPowerChange: (watts: number) => void;
  onSolarPanelAngleChange: (angle: number) => void;
  onSolarEfficiencyChange: (eff: number) => void;
  onIrradianceOverrideChange: (irr: number | null) => void;
  onBatteryInternalResistanceChange: (r: number) => void;
  onBatteryCapacityChange: (size: 'small' | 'medium' | 'large') => void;
  onAddBattery: (size: BatterySize) => void;
  onRemoveBattery: (id: string) => void;
  onChangeBatterySize: (id: string, size: BatterySize) => void;
  onMinMaxSoCChange: (min: number, max: number) => void;
  onSystemVoltageChange: (v: number) => void;
  onWireGaugeChange: (gauge: string) => void;
}

export default function Controls({
  currentTime,
  timeSpeed,
  isPaused,
  weather,
  appliances,
  solarPanelCount,
  solarPowerPerPanel,
  solarPanelAngle,
  solarEfficiency,
  solarIrradianceOverride,
  batteries,
  batteryCapacity,
  batteryInternalResistance,
  batteryMinSoC,
  batteryMaxSoC,
  batteryCRate,
  batteryDoD,
  systemVoltage,
  wireGauge,
  currentPower,
  totalEfficiency,
  onTimeChange,
  onTimeSpeedChange,
  onTogglePause,
  onWeatherChange,
  onToggleAppliance,
  onApplianceDetailsClick,
  onReset,
  onSolarPanelCountChange,
  onSolarPanelPowerChange,
  onSolarPanelAngleChange,
  onSolarEfficiencyChange,
  onIrradianceOverrideChange,
  onBatteryInternalResistanceChange,
  onBatteryCapacityChange,
  onAddBattery,
  onRemoveBattery,
  onChangeBatterySize,
  onMinMaxSoCChange,
  onSystemVoltageChange,
  onWireGaugeChange,
}: ControlsProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [selectedBatterySize, setSelectedBatterySize] = useState<BatterySize>('medium');
  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const speedOptions = [
    { value: 1, label: '1x' },
    { value: 5, label: '5x' },
    { value: 10, label: '10x' },
    { value: 50, label: '50x' },
  ];

  return (
    <div className="bg-[#141920] border-2 border-[#2d3748] rounded-none shadow-lg p-4 space-y-4 font-mono relative overflow-hidden">
      {/* Grid background overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 24%, rgba(45, 55, 72, 0.3) 25%, rgba(45, 55, 72, 0.3) 26%, transparent 27%, transparent 74%, rgba(45, 55, 72, 0.3) 75%, rgba(45, 55, 72, 0.3) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(45, 55, 72, 0.3) 25%, rgba(45, 55, 72, 0.3) 26%, transparent 27%, transparent 74%, rgba(45, 55, 72, 0.3) 75%, rgba(45, 55, 72, 0.3) 76%, transparent 77%, transparent)
          `,
          backgroundSize: '20px 20px'
        }}
      />

      {/* Time Controls */}
      <div className="space-y-2 relative z-10">
        <h3 className="text-xs font-bold text-[#e2e8f0] uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#00ff88]" />
          Sterowanie Czasem
        </h3>

        {/* Time Display and Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold font-mono text-[#00ff88] tabular-nums">{formatTime(currentTime)}</span>
            <button
              onClick={onTogglePause}
              className={`px-3 py-1.5 border-2 font-semibold flex items-center gap-2 transition-all uppercase tracking-wider ${
                isPaused
                  ? 'border-[#00ff88] bg-[#0a0e14] text-[#00ff88] hover:bg-[#00ff88] hover:text-[#0a0e14]'
                  : 'border-[#ff6b35] bg-[#0a0e14] text-[#ff6b35] hover:bg-[#ff6b35] hover:text-[#0a0e14]'
              }`}
            >
              {isPaused ? (
                <><Play className="w-4 h-4" /> Odtwórz</>
              ) : (
                <><Pause className="w-4 h-4" /> Pauza</>
              )}
            </button>
          </div>

          <input
            type="range"
            min="0"
            max="24"
            step="0.1"
            value={currentTime}
            onChange={(e) => onTimeChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-[#2d3748] appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-[#718096] uppercase tracking-wider">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>24:00</span>
          </div>
        </div>

        {/* Speed Controls */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#718096] uppercase tracking-wider">Prędkość Symulacji</label>
          <div className="grid grid-cols-4 gap-2">
            {speedOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onTimeSpeedChange(option.value)}
                className={`py-1.5 px-3 border-2 font-semibold transition-all uppercase tracking-wider ${
                  timeSpeed === option.value
                    ? 'border-[#00ff88] bg-[#00ff88] text-[#0a0e14]'
                    : 'border-[#2d3748] bg-[#0a0e14] text-[#e2e8f0] hover:border-[#00ff88]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Weather Controls */}
      <div className="space-y-2 border-t border-[#2d3748] pt-4 relative z-10">
        <h3 className="text-xs font-bold text-[#e2e8f0] uppercase tracking-wider flex items-center gap-2">
          <CloudSun className="w-4 h-4 text-[#00ff88]" />
          Pogoda
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {(['sunny', 'cloudy', 'night'] as WeatherCondition[]).map((w) => (
            <button
              key={w}
              onClick={() => onWeatherChange(w)}
              className={`py-1.5 px-3 border-2 text-sm font-semibold transition-all flex items-center justify-center gap-1 ${
                weather === w
                  ? 'border-[#00ff88] bg-[#00ff88] text-[#0a0e14]'
                  : 'border-[#2d3748] bg-[#0a0e14] text-[#e2e8f0] hover:border-[#00ff88]'
              }`}
            >
              {w === 'sunny' ? (
                <><Sun className="w-4 h-4" /> Dzień </>
              ) : w === 'cloudy' ? (
                <><Cloud className="w-4 h-4" /> Chmury</>
              ) : (
                <><Moon className="w-4 h-4" /> Noc</>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Solar Panel Configuration */}
      <div className="bg-[#141920] border-2 border-[#2d3748] rounded-lg p-3">
        <h3 className="text-white text-sm font-mono uppercase tracking-wider mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Panele Słoneczne
        </h3>

        {/* Panel Count Slider */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-2">
            <label className="text-[#e2e8f0] font-mono text-xs">Liczba paneli</label>
            <span className="text-[#00ff88] font-mono font-bold">{solarPanelCount ?? 90}</span>
          </div>
          <input
            type="range"
            min="0"
            max="90"
            step="1"
            value={solarPanelCount ?? 90}
            onChange={(e) => onSolarPanelCountChange(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Power Per Panel Dropdown */}
        <div className="mb-3">
          <label className="text-[#e2e8f0] font-mono text-xs mb-2 block">Moc na panel</label>
          <div className="grid grid-cols-5 gap-2">
            {[100, 200, 300, 400, 500].map((watts) => (
              <button
                key={watts}
                onClick={() => onSolarPanelPowerChange(watts)}
                className={`px-2 py-1 rounded font-mono text-xs transition-all ${
                  (solarPowerPerPanel ?? 300) === watts
                    ? 'bg-[#00ff88] text-[#0a0e14] border-2 border-[#00ff88]'
                    : 'bg-[#0a0e14] text-[#718096] border-2 border-[#2d3748] hover:border-[#00ff88]'
                }`}
              >
                {watts}W
              </button>
            ))}
          </div>
        </div>

        {/* Total System Power Display */}
        <div className="bg-[#0a0e14] border border-[#2d3748] rounded p-2">
          <div className="text-[#718096] font-mono text-xs mb-1">Całkowita moc systemu</div>
          <div className="text-[#00ff88] font-mono text-lg font-bold">
            {(((solarPanelCount ?? 56) * (solarPowerPerPanel ?? 300)) / 1000).toFixed(1)} kW
          </div>
        </div>
      </div>

      {/* Battery Configuration */}
      <div className="bg-[#141920] border-2 border-[#2d3748] rounded-lg p-3 mt-4">
        <h3 className="text-white text-sm font-mono uppercase tracking-wider mb-3 flex items-center gap-2">
          <BatteryIcon className="w-4 h-4" />
          Baterie ({batteries?.length || 0}/12)
        </h3>

        {/* Battery List */}
        <div className="space-y-2 mb-3 max-h-48 overflow-y-auto scrollbar-webkit">
          {batteries?.map((battery, index) => {
            const sizeLabel = battery.size === 'small' ? 'Mała' : battery.size === 'medium' ? 'Średnia' : 'Duża';
            return (
              <div key={battery.id} className="bg-[#0a0e14] border border-[#2d3748] rounded p-2">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[#00ff88] font-mono text-xs font-bold">#{index + 1}</span>
                    <span className="text-[#e2e8f0] font-mono text-xs">{sizeLabel}</span>
                    <span className="text-[#718096] font-mono text-xs">({battery.capacity} kWh)</span>
                  </div>
                  <span className="text-[#00ff88] font-mono text-xs">{battery.stateOfCharge.toFixed(0)}%</span>
                </div>

                {/* Size Change Buttons */}
                <div className="grid grid-cols-3 gap-1">
                  {(['small', 'medium', 'large'] as BatterySize[]).map((size) => {
                    const label = size === 'small' ? 'M' : size === 'medium' ? 'Ś' : 'D';
                    return (
                      <button
                        key={size}
                        onClick={() => onChangeBatterySize(battery.id, size)}
                        className={`px-2 py-1 rounded font-mono text-xs transition-all ${
                          battery.size === size
                            ? 'bg-[#00ff88] text-[#0a0e14] border border-[#00ff88]'
                            : 'bg-[#1a202c] text-[#718096] border border-[#2d3748] hover:border-[#00ff88]'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Size Selector */}
        <div className="mb-2">
          <div className="text-[#718096] font-mono text-xs mb-1">Rozmiar nowej baterii:</div>
          <div className="grid grid-cols-3 gap-1">
            {(['small', 'medium', 'large'] as BatterySize[]).map((size) => {
              const label = size === 'small' ? 'M' : size === 'medium' ? 'Ś' : 'D';
              const capacityLabel = size === 'small' ? '13.5' : size === 'medium' ? '40' : '100';
              return (
                <button
                  key={size}
                  onClick={() => setSelectedBatterySize(size)}
                  className={`px-2 py-1 rounded font-mono text-xs transition-all ${
                    selectedBatterySize === size
                      ? 'bg-[#00ff88] text-[#0a0e14] border border-[#00ff88]'
                      : 'bg-[#1a202c] text-[#718096] border border-[#2d3748] hover:border-[#00ff88]'
                  }`}
                >
                  {label} ({capacityLabel} kWh)
                </button>
              );
            })}
          </div>
        </div>

        {/* Add/Remove Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onAddBattery(selectedBatterySize)}
            disabled={(batteries?.length || 0) >= 12}
            className={`px-3 py-2 rounded font-mono text-xs transition-all ${
              (batteries?.length || 0) >= 12
                ? 'bg-[#1a202c] text-[#4a5568] border border-[#2d3748] cursor-not-allowed'
                : 'bg-[#0a0e14] text-[#00ff88] border border-[#00ff88] hover:bg-[#00ff88] hover:text-[#0a0e14]'
            }`}
          >
            + Dodaj
          </button>
          <button
            onClick={() => batteries && batteries.length > 1 && onRemoveBattery(batteries[batteries.length - 1].id)}
            disabled={(batteries?.length || 0) <= 1}
            className={`px-3 py-2 rounded font-mono text-xs transition-all ${
              (batteries?.length || 0) <= 1
                ? 'bg-[#1a202c] text-[#4a5568] border border-[#2d3748] cursor-not-allowed'
                : 'bg-[#0a0e14] text-[#FF6347] border border-[#FF6347] hover:bg-[#FF6347] hover:text-[#0a0e14]'
            }`}
          >
            - Usuń
          </button>
        </div>

        {/* Total Capacity Display */}
        <div className="bg-[#0a0e14] border border-[#2d3748] rounded p-2 mt-3">
          <div className="text-[#718096] font-mono text-xs mb-1">Całkowita pojemność</div>
          <div className="text-[#00ff88] font-mono text-lg font-bold">
            {batteryCapacity.toFixed(1)} kWh
          </div>
        </div>
      </div>

      {/* Appliance Controls */}
      <div className="space-y-2 border-t border-[#2d3748] pt-4 relative z-10">
        <h3 className="text-xs font-bold text-[#e2e8f0] uppercase tracking-wider flex items-center gap-2">
          <Home className="w-4 h-4 text-[#00ff88]" />
          Urządzenia
        </h3>
        <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-webkit">
          {appliances.map((appliance) => (
            <div
              key={appliance.id}
              className={`flex items-center justify-between p-2 border-2 transition-all ${
                appliance.isOn ? 'border-[#00ff88] bg-[#0a0e14]' : 'border-[#2d3748] bg-[#0a0e14]'
              }`}
            >
              <div className="flex-1">
                <p className="font-medium text-[#e2e8f0] uppercase text-xs tracking-wider">{appliance.name}</p>
                <p className="text-xs text-[#718096] tabular-nums font-mono">
                  {appliance.powerRating.toFixed(2)} kW
                  {appliance.alwaysOn && <span className="ml-2 text-[#00ff88]">(Zawsze Włączone)</span>}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onToggleAppliance(appliance.id)}
                  disabled={appliance.alwaysOn}
                  className={`px-3 py-1.5 border-2 font-semibold transition-all uppercase tracking-wider text-xs ${
                    appliance.alwaysOn
                      ? 'border-[#2d3748] bg-[#0a0e14] text-[#718096] cursor-not-allowed'
                      : appliance.isOn
                      ? 'border-[#ff6b35] bg-[#0a0e14] text-[#ff6b35] hover:bg-[#ff6b35] hover:text-[#0a0e14]'
                      : 'border-[#00ff88] bg-[#0a0e14] text-[#00ff88] hover:bg-[#00ff88] hover:text-[#0a0e14]'
                  }`}
                >
                  {appliance.isOn ? 'Wyłącz' : 'Włącz'}
                </button>
                <button
                  onClick={() => onApplianceDetailsClick(appliance.id)}
                  className="px-2 py-1.5 border-2 border-[#2d3748] bg-[#0a0e14] text-[#00ff88] hover:border-[#00ff88] font-semibold transition-all text-xs"
                  title="Szczegóły"
                >
                  ℹ️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Physics Controls */}
      <div className="border-t border-[#2d3748] pt-4 relative z-10">
        <button
          onClick={() => setAdvancedOpen(!advancedOpen)}
          className="w-full flex items-center justify-between text-xs font-bold text-[#e2e8f0] uppercase tracking-wider mb-2"
        >
          <span className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#00ff88]" />
            Zaawansowana Fizyka
          </span>
          <span className="text-[#00ff88]">{advancedOpen ? '▼' : '▶'}</span>
        </button>

        {advancedOpen && (
          <div className="space-y-3 bg-[#0a0e14] border border-[#2d3748] rounded p-3">
            {/* Solar Physics */}
            <div className="space-y-2">
              <h4 className="text-[#00ff88] text-xs font-bold uppercase">Panel Słoneczny</h4>

              {/* Panel Angle */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs text-[#e2e8f0]">Kąt nachylenia (°)</label>
                  <span className="text-xs text-[#00ff88] font-mono">{solarPanelAngle}° | cos={Math.cos(solarPanelAngle * Math.PI / 180).toFixed(3)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="1"
                  value={solarPanelAngle}
                  onChange={(e) => onSolarPanelAngleChange(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Efficiency */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs text-[#e2e8f0]">Wydajność Paneli (%)</label>
                  <span className="text-xs text-[#00ff88] font-mono">{(solarEfficiency * 100).toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0.50"
                  max="1.00"
                  step="0.01"
                  value={solarEfficiency}
                  onChange={(e) => onSolarEfficiencyChange(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Irradiance Override */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs text-[#e2e8f0]">Natężenie (W/m²)</label>
                  <span className="text-xs text-[#00ff88] font-mono">{solarIrradianceOverride ?? 'Auto'}</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    value={solarIrradianceOverride ?? ''}
                    onChange={(e) => onIrradianceOverrideChange(e.target.value ? Number(e.target.value) : null)}
                    className="flex-1 bg-[#0a0e14] border border-[#2d3748] text-xs text-[#e2e8f0] px-2 py-1"
                    placeholder="Auto"
                  />
                  <button
                    onClick={() => onIrradianceOverrideChange(null)}
                    className="px-2 py-1 text-xs border border-[#2d3748] text-[#718096] hover:border-[#00ff88]"
                  >
                    Auto
                  </button>
                </div>
              </div>

              <div className="text-xs text-[#718096]">Wsp. temp: -0.4%/°C powyżej 25°C</div>
            </div>

            {/* Battery Physics */}
            <div className="space-y-2 border-t border-[#2d3748] pt-2">
              <h4 className="text-[#00ff88] text-xs font-bold uppercase">Bateria</h4>

              {/* Battery Capacity Selector */}
              <div>
                <label className="text-xs text-[#e2e8f0] mb-1 block">Pojemność baterii</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { size: 'small' as const, label: 'Mała', capacity: '13.5 kWh' },
                    { size: 'medium' as const, label: 'Średnia', capacity: '40 kWh' },
                    { size: 'large' as const, label: 'Duża', capacity: '100 kWh' },
                  ].map(({ size, label, capacity }) => (
                    <button
                      key={size}
                      onClick={() => onBatteryCapacityChange(size)}
                      className={`py-2 px-2 text-xs border-2 font-semibold transition-all ${
                        (batteryCapacity <= 13.5 && size === 'small') ||
                        (batteryCapacity > 13.5 && batteryCapacity <= 40 && size === 'medium') ||
                        (batteryCapacity > 40 && size === 'large')
                          ? 'border-[#00ff88] bg-[#00ff88] text-[#0a0e14]'
                          : 'border-[#2d3748] bg-[#0a0e14] text-[#e2e8f0] hover:border-[#00ff88]'
                      }`}
                    >
                      <div>{label}</div>
                      <div className="text-[10px] opacity-70">{capacity}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Internal Resistance */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs text-[#e2e8f0]">Opór wewn. (Ω)</label>
                  <span className="text-xs text-[#00ff88] font-mono">{batteryInternalResistance.toFixed(3)}</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.1"
                  step="0.01"
                  value={batteryInternalResistance}
                  onChange={(e) => onBatteryInternalResistanceChange(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* C-rate & DoD Display */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#141920] border border-[#2d3748] rounded p-2">
                  <div className="text-xs text-[#718096]">C-rate</div>
                  <div className="text-xs text-[#00ff88] font-bold font-mono">{batteryCRate.toFixed(2)}C</div>
                </div>
                <div className="bg-[#141920] border border-[#2d3748] rounded p-2">
                  <div className="text-xs text-[#718096]">DoD</div>
                  <div className="text-xs text-[#00ff88] font-bold font-mono">{batteryDoD.toFixed(1)}%</div>
                </div>
              </div>

              {/* Min/Max SoC */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs text-[#e2e8f0]">Min SoC (%)</label>
                  <span className="text-xs text-[#00ff88] font-mono">{batteryMinSoC}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="30"
                  step="1"
                  value={batteryMinSoC}
                  onChange={(e) => onMinMaxSoCChange(Number(e.target.value), batteryMaxSoC)}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs text-[#e2e8f0]">Max SoC (%)</label>
                  <span className="text-xs text-[#00ff88] font-mono">{batteryMaxSoC}%</span>
                </div>
                <input
                  type="range"
                  min="85"
                  max="100"
                  step="1"
                  value={batteryMaxSoC}
                  onChange={(e) => onMinMaxSoCChange(batteryMinSoC, Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* System Voltage & Current */}
            <div className="space-y-2 border-t border-[#2d3748] pt-2">
              <h4 className="text-[#00ff88] text-xs font-bold uppercase">System</h4>

              {/* Voltage Selector */}
              <div>
                <label className="text-xs text-[#e2e8f0] mb-1 block">Napięcie systemu</label>
                <div className="grid grid-cols-3 gap-2">
                  {[120, 240, 480].map((v) => (
                    <button
                      key={v}
                      onClick={() => onSystemVoltageChange(v)}
                      className={`py-1 px-2 text-xs border-2 font-semibold transition-all ${
                        systemVoltage === v
                          ? 'border-[#00ff88] bg-[#00ff88] text-[#0a0e14]'
                          : 'border-[#2d3748] bg-[#0a0e14] text-[#e2e8f0] hover:border-[#00ff88]'
                      }`}
                    >
                      {v}V
                    </button>
                  ))}
                </div>
              </div>

              {/* Wire Gauge */}
              <div>
                <label className="text-xs text-[#e2e8f0] mb-1 block">Grubość przewodu</label>
                <div className="grid grid-cols-3 gap-2">
                  {['10AWG', '8AWG', '6AWG'].map((g) => (
                    <button
                      key={g}
                      onClick={() => onWireGaugeChange(g)}
                      className={`py-1 px-2 text-xs border-2 font-semibold transition-all ${
                        wireGauge === g
                          ? 'border-[#00ff88] bg-[#00ff88] text-[#0a0e14]'
                          : 'border-[#2d3748] bg-[#0a0e14] text-[#e2e8f0] hover:border-[#00ff88]'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Current & Power Display */}
              <div className="bg-[#141920] border border-[#2d3748] rounded p-2">
                <div className="text-xs text-[#718096] mb-1">I = P / V</div>
                <div className="text-xs text-[#00ff88] font-mono">
                  I = {currentPower.toFixed(2)} kW / {systemVoltage} V = {(currentPower * 1000 / systemVoltage).toFixed(2)} A
                </div>
              </div>

              {/* System Efficiency */}
              <div className="bg-[#141920] border border-[#2d3748] rounded p-2">
                <div className="text-xs text-[#718096]">Całkowita sprawność systemu</div>
                <div className="text-xs text-[#00ff88] font-bold font-mono text-lg">{totalEfficiency.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reset Button */}
      <div className="border-t border-[#2d3748] pt-4 relative z-10">
        <button
          onClick={onReset}
          className="w-full py-1.5 border-2 border-[#2d3748] bg-[#0a0e14] text-[#e2e8f0] hover:border-[#ff6b35] hover:bg-[#ff6b35] hover:text-[#0a0e14] font-semibold transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
        >
          <RotateCcw className="w-5 h-5" />
          Resetuj Symulację
        </button>
      </div>
    </div>
  );
}
