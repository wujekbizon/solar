'use client';

import { Sun, Battery, Zap, Plug, ArrowUpRight, ArrowDownLeft, Pause, DollarSign } from 'lucide-react';
import type { EnergySystemState } from '@/types/energy';

interface DashboardProps {
  state: EnergySystemState;
}

export default function Dashboard({ state }: DashboardProps) {
  const { solar, battery, consumption, grid, statistics, losses, currentTime, weather } = state;

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const formatPower = (kw: number) => `${(kw ?? 0).toFixed(2)} kW`;
  const formatEnergy = (kwh: number) => {
    const val = kwh ?? 0;
    if (val < 0.1) return `${val.toFixed(3)} kWh`;
    return `${val.toFixed(2)} kWh`;
  };
  const formatPercent = (percent: number) => `${(percent ?? 0).toFixed(1)}%`;
  const formatCurrency = (amount: number) => {
    const val = amount ?? 0;
    if (val < 0.1) return `$${val.toFixed(3)}`;
    return `$${val.toFixed(2)}`;
  };
  const formatCO2 = (kg: number) => {
    const val = kg ?? 0;
    if (val < 0.1) return `${val.toFixed(2)} kg`;
    return `${val.toFixed(1)} kg`;
  };

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
      {/* Header */}
      <div className="border-b border-[#2d3748] pb-4 relative z-10">
        <h2 className="text-2xl font-bold text-[#e2e8f0] uppercase tracking-wider">Panel Energetyczny</h2>
        <div className="flex items-center gap-4 mt-2 text-sm">
          <span className="font-semibold text-[#00ff88] tabular-nums">Czas: {formatTime(currentTime)}</span>
          <span className="uppercase px-3 py-1 border border-[#2d3748] bg-[#0a0e14] text-[#e2e8f0]">
            {weather}
          </span>
        </div>
      </div>

      {/* Solar Generation */}
      <div className="space-y-2 relative z-10">
        <h3 className="text-sm font-bold text-[#e2e8f0] uppercase tracking-wider flex items-center gap-2">
          <Sun className="w-4 h-4 text-[#00ff88]" />
          Generowanie Słoneczne
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-[#2d3748] bg-[#0a0e14] p-3">
            <p className="text-xs text-[#718096] uppercase tracking-wider">Aktualna Moc</p>
            <p className="text-2xl font-bold text-[#00ff88] tabular-nums">{formatPower(solar.currentPower)}</p>
          </div>
          <div className="border border-[#2d3748] bg-[#0a0e14] p-3">
            <p className="text-xs text-[#718096] uppercase tracking-wider">Całkowicie Wygenerowane</p>
            <p className="text-2xl font-bold text-[#00ff88] tabular-nums">{formatEnergy(solar.totalGenerated)}</p>
          </div>
        </div>
      </div>

      {/* Battery Storage */}
      <div className="space-y-2 relative z-10">
        <h3 className="text-sm font-bold text-[#e2e8f0] uppercase tracking-wider flex items-center gap-2">
          <Battery className="w-4 h-4 text-[#00ff88]" />
          Magazyn Baterii
        </h3>
        <div className="border border-[#2d3748] bg-[#0a0e14] p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#718096] uppercase tracking-wider">Stan Naładowania</span>
            <span className="text-2xl font-bold text-[#00ff88] tabular-nums">
              {formatPercent(battery.stateOfCharge)}
            </span>
          </div>
          <div className="w-full bg-[#2d3748] h-4 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                battery.stateOfCharge > 50
                  ? 'bg-[#00ff88]'
                  : battery.stateOfCharge > 20
                  ? 'bg-[#ff6b35]'
                  : 'bg-red-500'
              }`}
              style={{ width: `${battery.stateOfCharge}%` }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-xs text-[#718096] uppercase tracking-wider">Status</p>
              <p className="font-semibold text-[#e2e8f0] flex items-center gap-1">
                {battery.charging ? (
                  <><Zap className="w-4 h-4" /> Ładowanie</>
                ) : battery.chargingRate > 0 ? (
                  <><Zap className="w-4 h-4" /> Rozładowanie</>
                ) : (
                  <><Pause className="w-4 h-4" /> Bezczynny</>
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#718096] uppercase tracking-wider">Moc</p>
              <p className="font-semibold text-[#e2e8f0] tabular-nums">{formatPower(battery.chargingRate)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Consumption */}
      <div className="space-y-2 relative z-10">
        <h3 className="text-sm font-bold text-[#e2e8f0] uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#00ff88]" />
          Zużycie
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-[#2d3748] bg-[#0a0e14] p-3">
            <p className="text-xs text-[#718096] uppercase tracking-wider">Aktualna Moc</p>
            <p className="text-2xl font-bold text-[#00ff88] tabular-nums">{formatPower(consumption.totalPower)}</p>
          </div>
          <div className="border border-[#2d3748] bg-[#0a0e14] p-3">
            <p className="text-xs text-[#718096] uppercase tracking-wider">Całkowicie Zużyte</p>
            <p className="text-2xl font-bold text-[#00ff88] tabular-nums">{formatEnergy(consumption.totalConsumed)}</p>
          </div>
        </div>
        <div className="text-xs text-[#718096] uppercase tracking-wider">
          Aktywne: <span className="text-[#00ff88]">{consumption.appliances.filter(a => a.isOn).length}</span> / {consumption.appliances.length} urządzenia
        </div>
      </div>

      {/* Grid Connection */}
      <div className="space-y-2 relative z-10">
        <h3 className="text-sm font-bold text-[#e2e8f0] uppercase tracking-wider flex items-center gap-2">
          <Plug className="w-4 h-4 text-[#00ff88]" />
          Połączenie z Siecią
        </h3>
        <div className="border border-[#2d3748] bg-[#0a0e14] p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#718096] uppercase tracking-wider">Status</span>
            <span className={`font-semibold flex items-center gap-1 ${
              grid.exporting ? 'text-[#00ff88]' : grid.importing ? 'text-[#ff6b35]' : 'text-[#718096]'
            }`}>
              {grid.exporting ? (
                <><ArrowUpRight className="w-4 h-4" /> Eksport</>
              ) : grid.importing ? (
                <><ArrowDownLeft className="w-4 h-4" /> Import</>
              ) : (
                <><Pause className="w-4 h-4" /> Brak Przepływu</>
              )}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-xs text-[#718096] uppercase tracking-wider">Zaimportowane</p>
              <p className="font-semibold text-[#e2e8f0] tabular-nums">{formatEnergy(grid.totalImported)}</p>
            </div>
            <div>
              <p className="text-xs text-[#718096] uppercase tracking-wider">Wyeksportowane</p>
              <p className="font-semibold text-[#e2e8f0] tabular-nums">{formatEnergy(grid.totalExported)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="space-y-2 border-t border-[#2d3748] pt-4 relative z-10">
        <h3 className="text-sm font-bold text-[#e2e8f0] uppercase tracking-wider flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-[#00ff88]" />
          Oszczędności i Wpływ
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-[#2d3748] bg-[#0a0e14] p-3">
            <p className="text-xs text-[#718096] uppercase tracking-wider">Oszczędności Kosztów</p>
            <p className="text-2xl font-bold text-[#00ff88] tabular-nums">{formatCurrency(statistics.costSavings)}</p>
          </div>
          <div className="border border-[#2d3748] bg-[#0a0e14] p-3">
            <p className="text-xs text-[#718096] uppercase tracking-wider">Zaoszczędzone CO₂</p>
            <p className="text-2xl font-bold text-[#00ff88] tabular-nums">{formatCO2(statistics.co2Saved)}</p>
          </div>
        </div>
      </div>

{/* Energy Losses */}
      {losses && (
        <div className="space-y-2 border-t border-[#2d3748] pt-4 relative z-10">
          <h3 className="text-sm font-bold text-[#e2e8f0] uppercase tracking-wider">Straty Energii</h3>
          <div className="border border-[#2d3748] bg-[#0a0e14] p-3 space-y-1 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-[#718096]">Przewody:</span>
              <span className="text-[#e2e8f0] tabular-nums">
                {formatPower(losses.wireLosses.total)}
                <span className="text-[#718096] ml-1">
                  ({solar.currentPower > 0 ? ((losses.wireLosses.total / solar.currentPower) * 100).toFixed(1) : '0.0'}%)
                </span>
              </span>
            </div>
            <div className="flex justify-between pl-3 text-[10px]">
              <span className="text-[#718096]">Solar→Bateria:</span>
              <span className="text-[#718096] tabular-nums">{formatPower(losses.wireLosses.solarToBattery)}</span>
            </div>
            <div className="flex justify-between pl-3 text-[10px]">
              <span className="text-[#718096]">Bateria→Dom:</span>
              <span className="text-[#718096] tabular-nums">{formatPower(losses.wireLosses.batteryToHouse)}</span>
            </div>
            <div className="flex justify-between pl-3 text-[10px]">
              <span className="text-[#718096]">Sieć→Dom:</span>
              <span className="text-[#718096] tabular-nums">{formatPower(losses.wireLosses.gridToHouse)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#718096]">Inwerter:</span>
              <span className="text-[#e2e8f0] tabular-nums">
                {formatPower(losses.inverterLoss)}
                <span className="text-[#718096] ml-1">
                  ({consumption.totalPower > 0 ? ((losses.inverterLoss / consumption.totalPower) * 100).toFixed(1) : '0.0'}%)
                </span>
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#718096]">Bateria:</span>
              <span className="text-[#e2e8f0] tabular-nums">
                {formatPower(losses.batteryLosses.charging + losses.batteryLosses.discharging)}
                <span className="text-[#718096] ml-1">
                  ({Math.abs(battery.chargingRate) > 0 ? (((losses.batteryLosses.charging + losses.batteryLosses.discharging) / Math.abs(battery.chargingRate)) * 100).toFixed(1) : '0.0'}%)
                </span>
              </span>
            </div>
            <div className="flex justify-between pl-3 text-[10px]">
              <span className="text-[#718096]">Ładowanie:</span>
              <span className="text-[#718096] tabular-nums">{formatPower(losses.batteryLosses.charging)}</span>
            </div>
            <div className="flex justify-between pl-3 text-[10px]">
              <span className="text-[#718096]">Rozładowanie:</span>
              <span className="text-[#718096] tabular-nums">{formatPower(losses.batteryLosses.discharging)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#718096]">Temperatura:</span>
              <span className="text-[#e2e8f0] tabular-nums">
                {formatPower(losses.temperatureLosses.solar)}
                <span className="text-[#718096] ml-1">
                  ({solar.currentPower > 0 ? ((losses.temperatureLosses.solar / solar.currentPower) * 100).toFixed(1) : '0.0'}%)
                </span>
              </span>
            </div>
            <div className="flex justify-between border-t border-[#2d3748] pt-1 mt-1">
              <span className="text-[#e2e8f0] font-bold">Całkowite:</span>
              <span className="text-[#ff6347] tabular-nums font-bold">
                {formatPower(losses.totalLosses)}
                <span className="text-[#718096] ml-1">
                  ({solar.currentPower > 0 ? ((losses.totalLosses / solar.currentPower) * 100).toFixed(1) : '0.0'}%)
                </span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Energy Balance */}
      <div className="border-2 border-[#2d3748] bg-[#0a0e14] p-4 relative z-10">
        <div className="text-center">
          <p className="text-xs text-[#718096] uppercase tracking-wider mb-1">Przepływ Energii Netto</p>
          <p className={`text-3xl font-bold tabular-nums ${
            statistics.netEnergy > 0 ? 'text-[#00ff88]' : statistics.netEnergy < 0 ? 'text-[#ff6b35]' : 'text-[#718096]'
          }`}>
            {statistics.netEnergy > 0 ? '+' : ''}{formatPower(statistics.netEnergy)}
          </p>
          <p className="text-xs text-[#718096] uppercase tracking-wider mt-1">
            {statistics.netEnergy > 0 ? 'Nadwyżka' : statistics.netEnergy < 0 ? 'Deficyt' : 'Zrównoważony'}
          </p>
        </div>
      </div>
    </div>
  );
}
