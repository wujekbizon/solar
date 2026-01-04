import { useEnergyStore } from '@/store/energyStore';
import { vi } from 'vitest';

export function setupTestTime(initialMs: number) {
  vi.spyOn(Date, 'now').mockReturnValue(initialMs);
}

export function advanceTime(ms: number) {
  const current = Date.now();
  vi.spyOn(Date, 'now').mockReturnValue(current + ms);
}

export function setBatterySoC(soc: number) {
  const store = useEnergyStore.getState();
  const capacity = store.state.battery.capacity;
  const currentCharge = (soc / 100) * capacity;

  useEnergyStore.setState((prev) => ({
    state: {
      ...prev.state,
      battery: {
        ...prev.state.battery,
        stateOfCharge: soc,
        currentCharge: currentCharge,
      },
      batteries: prev.state.batteries.map((bat, idx) =>
        idx === 0
          ? {
              ...bat,
              stateOfCharge: soc,
              currentCharge: currentCharge,
            }
          : bat
      ),
    },
  }));
}

export function setAppliances(applianceStates: Record<string, boolean>) {
  const store = useEnergyStore.getState();

  Object.entries(applianceStates).forEach(([id, shouldBeOn]) => {
    const currentState = store.state.consumption.appliances.find(
      (a) => a.id === id
    )?.isOn;

    if (currentState !== shouldBeOn) {
      store.toggleAppliance(id);
    }
  });
}

export function assertSoCNear(
  actual: number,
  expected: number,
  tolerance: number = 0.5
) {
  const diff = Math.abs(actual - expected);
  if (diff > tolerance) {
    throw new Error(
      `Expected SoC ${actual}% to be within ±${tolerance}% of ${expected}% (actual difference: ${diff.toFixed(2)}%)`
    );
  }
}
