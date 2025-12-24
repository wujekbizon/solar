'use client';

import { X } from 'lucide-react';
import type { ApplianceState } from '@/types/energy';

interface ApplianceDetailsPanelProps {
  appliance: ApplianceState;
  systemVoltage: number;
  currentTime: number;
  onClose: () => void;
}

/**
 * Details panel showing physics formulas and energy metrics for clicked appliance
 */
export default function ApplianceDetailsPanel({
  appliance,
  systemVoltage,
  currentTime,
  onClose,
}: ApplianceDetailsPanelProps) {
  // Calculate current metrics
  const powerKW = appliance.isOn ? appliance.powerRating : 0;
  const powerW = powerKW * 1000;
  const current = powerW / systemVoltage;
  const resistance = systemVoltage / current;

  // Estimate energy used today (simplified - assumes constant usage)
  const hoursOn = appliance.alwaysOn ? currentTime : (appliance.isOn ? currentTime * 0.5 : 0);
  const energyToday = powerKW * hoursOn;

  return (
    <div className="w-96 max-h-full overflow-y-auto bg-[#141920] border-2 border-[#2d3748] rounded shadow-2xl font-mono">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#2d3748]">
        <div>
          <h3 className="text-[#00ff88] font-bold text-sm uppercase tracking-wider">
            {appliance.name}
          </h3>
          <p className="text-[#718096] text-[10px] uppercase">{appliance.type}</p>
        </div>
        <button
          onClick={onClose}
          className="text-[#718096] hover:text-[#00ff88] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Status */}
      <div className="p-3 border-b border-[#2d3748]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-[#718096] uppercase">Status</span>
          <span
            className={`text-xs font-bold uppercase px-2 py-1 border-2 ${
              appliance.isOn
                ? 'text-[#00ff88] border-[#00ff88]'
                : 'text-[#718096] border-[#2d3748]'
            }`}
          >
            {appliance.isOn ? 'ON' : 'OFF'}
          </span>
        </div>
        {appliance.alwaysOn && (
          <div className="text-[10px] text-[#00ff88] bg-[#0a0e14] border border-[#2d3748] p-2 rounded">
            ⚠️ Zawsze włączone (nie można wyłączyć)
          </div>
        )}
      </div>

      {/* Current Measurements */}
      <div className="p-3 border-b border-[#2d3748]">
        <h4 className="text-[#00ff88] text-[10px] font-bold uppercase mb-2">
          Aktualne Pomiary
        </h4>
        <div className="space-y-2">
          <div className="bg-[#0a0e14] border border-[#2d3748] p-2 rounded">
            <div className="text-[10px] text-[#718096] mb-1">Moc (P)</div>
            <div className="text-sm text-[#00ff88] font-bold tabular-nums">
              {powerKW.toFixed(3)} kW = {powerW.toFixed(0)} W
            </div>
          </div>
          <div className="bg-[#0a0e14] border border-[#2d3748] p-2 rounded">
            <div className="text-[10px] text-[#718096] mb-1">Prąd (I)</div>
            <div className="text-sm text-[#00ff88] font-bold tabular-nums">
              {current.toFixed(2)} A
            </div>
          </div>
          <div className="bg-[#0a0e14] border border-[#2d3748] p-2 rounded">
            <div className="text-[10px] text-[#718096] mb-1">Napięcie (V)</div>
            <div className="text-sm text-[#00ff88] font-bold tabular-nums">
              {systemVoltage} V
            </div>
          </div>
        </div>
      </div>

      {/* Physics Formulas */}
      <div className="p-3 border-b border-[#2d3748]">
        <h4 className="text-[#00ff88] text-[10px] font-bold uppercase mb-2">
          Wzory Fizyczne
        </h4>
        <div className="space-y-2 text-[10px]">
          {/* Ohm's Law */}
          <div className="bg-[#0a0e14] border border-[#2d3748] p-2 rounded">
            <div className="text-[#718096] mb-1">Prawo Ohma:</div>
            <div className="text-[#e2e8f0] font-mono">V = I × R</div>
            <div className="text-[#00ff88] font-mono mt-1">
              {systemVoltage}V = {current.toFixed(2)}A × {resistance.toFixed(2)}Ω
            </div>
          </div>

          {/* Power Formula */}
          <div className="bg-[#0a0e14] border border-[#2d3748] p-2 rounded">
            <div className="text-[#718096] mb-1">Moc:</div>
            <div className="text-[#e2e8f0] font-mono">P = V × I</div>
            <div className="text-[#00ff88] font-mono mt-1">
              {powerW.toFixed(0)}W = {systemVoltage}V × {current.toFixed(2)}A
            </div>
          </div>

          {/* Energy Formula */}
          <div className="bg-[#0a0e14] border border-[#2d3748] p-2 rounded">
            <div className="text-[#718096] mb-1">Energia:</div>
            <div className="text-[#e2e8f0] font-mono">E = P × t</div>
            <div className="text-[#00ff88] font-mono mt-1">
              E = {powerKW.toFixed(3)}kW × {hoursOn.toFixed(1)}h = {energyToday.toFixed(3)}kWh
            </div>
          </div>

          {/* Resistance */}
          <div className="bg-[#0a0e14] border border-[#2d3748] p-2 rounded">
            <div className="text-[#718096] mb-1">Opór:</div>
            <div className="text-[#e2e8f0] font-mono">R = V / I</div>
            <div className="text-[#00ff88] font-mono mt-1">
              {resistance.toFixed(2)}Ω = {systemVoltage}V / {current.toFixed(2)}A
            </div>
          </div>
        </div>
      </div>

      {/* Energy Usage Stats */}
      <div className="p-3">
        <h4 className="text-[#00ff88] text-[10px] font-bold uppercase mb-2">
          Zużycie Energii
        </h4>
        <div className="space-y-2">
          <div className="bg-[#0a0e14] border border-[#2d3748] p-2 rounded">
            <div className="text-[10px] text-[#718096]">Dziś ({currentTime.toFixed(1)}h)</div>
            <div className="text-lg text-[#00ff88] font-bold tabular-nums">
              {energyToday.toFixed(3)} kWh
            </div>
          </div>
          <div className="bg-[#0a0e14] border border-[#2d3748] p-2 rounded">
            <div className="text-[10px] text-[#718096]">Moc znamionowa</div>
            <div className="text-lg text-[#00ff88] font-bold tabular-nums">
              {appliance.powerRating.toFixed(3)} kW
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
