'use client';

import type { ApplianceState, WeatherCondition } from '@/types/energy';

interface ControlsProps {
  currentTime: number;
  timeSpeed: number;
  isPaused: boolean;
  weather: WeatherCondition;
  appliances: ApplianceState[];
  onTimeChange: (time: number) => void;
  onTimeSpeedChange: (speed: number) => void;
  onTogglePause: () => void;
  onWeatherChange: (weather: WeatherCondition) => void;
  onToggleAppliance: (applianceId: string) => void;
  onReset: () => void;
}

export default function Controls({
  currentTime,
  timeSpeed,
  isPaused,
  weather,
  appliances,
  onTimeChange,
  onTimeSpeedChange,
  onTogglePause,
  onWeatherChange,
  onToggleAppliance,
  onReset,
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
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 space-y-6">
      {/* Time Controls */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-700">⏰ Time Controls</h3>

        {/* Time Display and Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-blue-600">{formatTime(currentTime)}</span>
            <button
              onClick={onTogglePause}
              className={`px-4 py-2 rounded font-semibold ${
                isPaused
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-yellow-500 hover:bg-yellow-600 text-white'
              }`}
            >
              {isPaused ? '▶️ Play' : '⏸️ Pause'}
            </button>
          </div>

          <input
            type="range"
            min="0"
            max="24"
            step="0.1"
            value={currentTime}
            onChange={(e) => onTimeChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>24:00</span>
          </div>
        </div>

        {/* Speed Controls */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">Simulation Speed</label>
          <div className="grid grid-cols-4 gap-2">
            {speedOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onTimeSpeedChange(option.value)}
                className={`py-2 px-3 rounded font-semibold transition-colors ${
                  timeSpeed === option.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Weather Controls */}
      <div className="space-y-3 border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-700">🌤️ Weather</h3>
        <div className="grid grid-cols-3 gap-2">
          {(['sunny', 'cloudy', 'night'] as WeatherCondition[]).map((w) => (
            <button
              key={w}
              onClick={() => onWeatherChange(w)}
              className={`py-2 px-3 rounded font-semibold capitalize transition-colors ${
                weather === w
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {w === 'sunny' ? '☀️' : w === 'cloudy' ? '☁️' : '🌙'} {w}
            </button>
          ))}
        </div>
      </div>

      {/* Appliance Controls */}
      <div className="space-y-3 border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-700">🏠 Appliances</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {appliances.map((appliance) => (
            <div
              key={appliance.id}
              className={`flex items-center justify-between p-3 rounded transition-colors ${
                appliance.isOn ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
              }`}
            >
              <div className="flex-1">
                <p className="font-medium text-gray-800">{appliance.name}</p>
                <p className="text-sm text-gray-500">
                  {appliance.powerRating.toFixed(2)} kW
                  {appliance.alwaysOn && <span className="ml-2 text-xs text-blue-600">(Always On)</span>}
                </p>
              </div>
              <button
                onClick={() => onToggleAppliance(appliance.id)}
                disabled={appliance.alwaysOn}
                className={`px-4 py-2 rounded font-semibold transition-colors ${
                  appliance.alwaysOn
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : appliance.isOn
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {appliance.isOn ? 'Turn Off' : 'Turn On'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <div className="border-t pt-4">
        <button
          onClick={onReset}
          className="w-full py-3 bg-gray-700 hover:bg-gray-800 text-white font-semibold rounded transition-colors"
        >
          🔄 Reset Simulation
        </button>
      </div>
    </div>
  );
}
