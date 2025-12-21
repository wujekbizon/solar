'use client';

import { Clock, Play, Pause, CloudSun, Sun, Cloud, Moon, Home, RotateCcw, Zap } from 'lucide-react';
import type { ApplianceState, WeatherCondition } from '@/types/energy';
import ThemeToggle from './ThemeToggle';

interface ControlsProps {
  currentTime: number;
  timeSpeed: number;
  isPaused: boolean;
  weather: WeatherCondition;
  appliances: ApplianceState[];
  solarPanelCount: number;
  solarPowerPerPanel: number;
  onTimeChange: (time: number) => void;
  onTimeSpeedChange: (speed: number) => void;
  onTogglePause: () => void;
  onWeatherChange: (weather: WeatherCondition) => void;
  onToggleAppliance: (applianceId: string) => void;
  onReset: () => void;
  onSolarPanelCountChange: (count: number) => void;
  onSolarPanelPowerChange: (watts: number) => void;
}

export default function Controls({
  currentTime,
  timeSpeed,
  isPaused,
  weather,
  appliances,
  solarPanelCount,
  solarPowerPerPanel,
  onTimeChange,
  onTimeSpeedChange,
  onTogglePause,
  onWeatherChange,
  onToggleAppliance,
  onReset,
  onSolarPanelCountChange,
  onSolarPanelPowerChange,
}: ControlsProps) {
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
    <div className="bg-[#141920] border-2 border-[#2d3748] rounded-none shadow-lg p-6 space-y-6 font-mono relative overflow-hidden">
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

      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Time Controls */}
      <div className="space-y-3 relative z-10">
        <h3 className="text-sm font-bold text-[#e2e8f0] uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#00ff88]" />
          Sterowanie Czasem
        </h3>

        {/* Time Display and Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-[#00ff88] tabular-nums">{formatTime(currentTime)}</span>
            <button
              onClick={onTogglePause}
              className={`px-4 py-2 border-2 font-semibold flex items-center gap-2 transition-all uppercase tracking-wider ${
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
                className={`py-2 px-3 border-2 font-semibold transition-all uppercase tracking-wider ${
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
      <div className="space-y-3 border-t border-[#2d3748] pt-4 relative z-10">
        <h3 className="text-sm font-bold text-[#e2e8f0] uppercase tracking-wider flex items-center gap-2">
          <CloudSun className="w-4 h-4 text-[#00ff88]" />
          Pogoda
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {(['sunny', 'cloudy', 'night'] as WeatherCondition[]).map((w) => (
            <button
              key={w}
              onClick={() => onWeatherChange(w)}
              className={`py-2 px-3 border-2 font-semibold uppercase transition-all flex items-center justify-center gap-1 ${
                weather === w
                  ? 'border-[#00ff88] bg-[#00ff88] text-[#0a0e14]'
                  : 'border-[#2d3748] bg-[#0a0e14] text-[#e2e8f0] hover:border-[#00ff88]'
              }`}
            >
              {w === 'sunny' ? (
                <><Sun className="w-4 h-4" /> słonecznie</>
              ) : w === 'cloudy' ? (
                <><Cloud className="w-4 h-4" /> pochmurnie</>
              ) : (
                <><Moon className="w-4 h-4" /> noc</>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Solar Panel Configuration */}
      <div className="bg-[#141920] border-2 border-[#2d3748] rounded-lg p-4">
        <h3 className="text-[#00ff88] font-mono uppercase tracking-wider mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Panele Słoneczne
        </h3>

        {/* Panel Count Slider */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-[#e2e8f0] font-mono text-sm">Liczba paneli</label>
            <span className="text-[#00ff88] font-mono font-bold">{solarPanelCount ?? 56}</span>
          </div>
          <input
            type="range"
            min="0"
            max="56"
            step="1"
            value={solarPanelCount ?? 56}
            onChange={(e) => onSolarPanelCountChange(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Power Per Panel Dropdown */}
        <div className="mb-4">
          <label className="text-[#e2e8f0] font-mono text-sm mb-2 block">Moc na panel</label>
          <div className="grid grid-cols-5 gap-2">
            {[100, 200, 300, 400, 500].map((watts) => (
              <button
                key={watts}
                onClick={() => onSolarPanelPowerChange(watts)}
                className={`px-2 py-1 rounded font-mono text-xs transition-all ${
                  (solarPowerPerPanel ?? 250) === watts
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
        <div className="bg-[#0a0e14] border border-[#2d3748] rounded p-3">
          <div className="text-[#718096] font-mono text-xs mb-1">Całkowita moc systemu</div>
          <div className="text-[#00ff88] font-mono text-2xl font-bold">
            {(((solarPanelCount ?? 56) * (solarPowerPerPanel ?? 250)) / 1000).toFixed(1)} kW
          </div>
        </div>
      </div>

      {/* Appliance Controls */}
      <div className="space-y-3 border-t border-[#2d3748] pt-4 relative z-10">
        <h3 className="text-sm font-bold text-[#e2e8f0] uppercase tracking-wider flex items-center gap-2">
          <Home className="w-4 h-4 text-[#00ff88]" />
          Urządzenia
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {appliances.map((appliance) => (
            <div
              key={appliance.id}
              className={`flex items-center justify-between p-3 border-2 transition-all ${
                appliance.isOn ? 'border-[#00ff88] bg-[#0a0e14]' : 'border-[#2d3748] bg-[#0a0e14]'
              }`}
            >
              <div className="flex-1">
                <p className="font-medium text-[#e2e8f0] uppercase text-xs tracking-wider">{appliance.name}</p>
                <p className="text-xs text-[#718096] tabular-nums">
                  {appliance.powerRating.toFixed(2)} kW
                  {appliance.alwaysOn && <span className="ml-2 text-[#00ff88]">(Zawsze Włączone)</span>}
                </p>
              </div>
              <button
                onClick={() => onToggleAppliance(appliance.id)}
                disabled={appliance.alwaysOn}
                className={`px-4 py-2 border-2 font-semibold transition-all uppercase tracking-wider ${
                  appliance.alwaysOn
                    ? 'border-[#2d3748] bg-[#0a0e14] text-[#718096] cursor-not-allowed'
                    : appliance.isOn
                    ? 'border-[#ff6b35] bg-[#0a0e14] text-[#ff6b35] hover:bg-[#ff6b35] hover:text-[#0a0e14]'
                    : 'border-[#00ff88] bg-[#0a0e14] text-[#00ff88] hover:bg-[#00ff88] hover:text-[#0a0e14]'
                }`}
              >
                {appliance.isOn ? 'Wyłącz' : 'Włącz'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <div className="border-t border-[#2d3748] pt-4 relative z-10">
        <button
          onClick={onReset}
          className="w-full py-3 border-2 border-[#2d3748] bg-[#0a0e14] text-[#e2e8f0] hover:border-[#ff6b35] hover:bg-[#ff6b35] hover:text-[#0a0e14] font-semibold transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
        >
          <RotateCcw className="w-5 h-5" />
          Resetuj Symulację
        </button>
      </div>
    </div>
  );
}
