'use client';

import type { EnergySystemState } from '@/types/energy';

interface DashboardProps {
  state: EnergySystemState;
}

export default function Dashboard({ state }: DashboardProps) {
  const { solar, battery, consumption, grid, statistics, currentTime, weather } = state;

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const formatPower = (kw: number) => `${kw.toFixed(2)} kW`;
  const formatEnergy = (kwh: number) => `${kwh.toFixed(2)} kWh`;
  const formatPercent = (percent: number) => `${percent.toFixed(1)}%`;
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatCO2 = (kg: number) => `${kg.toFixed(1)} kg`;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Energy Dashboard</h2>
        <div className="flex items-center gap-4 mt-2 text-sm">
          <span className="font-semibold">Time: {formatTime(currentTime)}</span>
          <span className="capitalize px-3 py-1 rounded-full bg-blue-100 text-blue-800">
            {weather}
          </span>
        </div>
      </div>

      {/* Solar Generation */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <span className="text-yellow-500">☀️</span>
          Solar Generation
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-yellow-50 p-3 rounded">
            <p className="text-sm text-gray-600">Current Power</p>
            <p className="text-xl font-bold text-yellow-600">{formatPower(solar.currentPower)}</p>
          </div>
          <div className="bg-yellow-50 p-3 rounded">
            <p className="text-sm text-gray-600">Total Generated</p>
            <p className="text-xl font-bold text-yellow-600">{formatEnergy(solar.totalGenerated)}</p>
          </div>
        </div>
      </div>

      {/* Battery Storage */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <span className="text-blue-500">🔋</span>
          Battery Storage
        </h3>
        <div className="bg-blue-50 p-3 rounded space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">State of Charge</span>
            <span className="text-xl font-bold text-blue-600">
              {formatPercent(battery.stateOfCharge)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                battery.stateOfCharge > 50
                  ? 'bg-green-500'
                  : battery.stateOfCharge > 20
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${battery.stateOfCharge}%` }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-gray-600">Status</p>
              <p className="font-semibold">
                {battery.charging ? '⚡ Charging' : battery.chargingRate > 0 ? '⚡ Discharging' : '⏸️ Idle'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Power</p>
              <p className="font-semibold">{formatPower(battery.chargingRate)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Consumption */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <span className="text-green-500">⚡</span>
          Consumption
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 p-3 rounded">
            <p className="text-sm text-gray-600">Current Power</p>
            <p className="text-xl font-bold text-green-600">{formatPower(consumption.totalPower)}</p>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <p className="text-sm text-gray-600">Total Used</p>
            <p className="text-xl font-bold text-green-600">{formatEnergy(consumption.totalConsumed)}</p>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          Active: {consumption.appliances.filter(a => a.isOn).length} / {consumption.appliances.length} appliances
        </div>
      </div>

      {/* Grid Connection */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <span className="text-red-500">🔌</span>
          Grid Connection
        </h3>
        <div className="bg-gray-50 p-3 rounded">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Status</span>
            <span className={`font-semibold ${
              grid.exporting ? 'text-green-600' : grid.importing ? 'text-red-600' : 'text-gray-600'
            }`}>
              {grid.exporting ? '📤 Exporting' : grid.importing ? '📥 Importing' : '⏸️ No Flow'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-gray-600">Imported</p>
              <p className="font-semibold">{formatEnergy(grid.totalImported)}</p>
            </div>
            <div>
              <p className="text-gray-600">Exported</p>
              <p className="font-semibold">{formatEnergy(grid.totalExported)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="space-y-2 border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-700">💰 Savings & Impact</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-purple-50 p-3 rounded">
            <p className="text-sm text-gray-600">Cost Savings</p>
            <p className="text-xl font-bold text-purple-600">{formatCurrency(statistics.costSavings)}</p>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <p className="text-sm text-gray-600">CO₂ Saved</p>
            <p className="text-xl font-bold text-green-600">{formatCO2(statistics.co2Saved)}</p>
          </div>
        </div>
      </div>

      {/* Energy Balance */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Net Energy Flow</p>
          <p className={`text-3xl font-bold ${
            statistics.netEnergy > 0 ? 'text-green-600' : statistics.netEnergy < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {statistics.netEnergy > 0 ? '+' : ''}{formatPower(statistics.netEnergy)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {statistics.netEnergy > 0 ? 'Surplus' : statistics.netEnergy < 0 ? 'Deficit' : 'Balanced'}
          </p>
        </div>
      </div>
    </div>
  );
}
