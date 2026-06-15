import type { AdditiveEntry, AdditivesConfig, ComponentResult } from '../types.js';

export type AdditiveKey = keyof AdditivesConfig;

export interface AdditiveComputation {
  key: AdditiveKey;
  volumeMl: number;
  result: ComponentResult;
}

const LABELS: Record<AdditiveKey, string> = {
  traceElements: 'Trace elements',
  vitamins: 'Vitamins',
  heparin: 'Heparin',
};

/**
 * Phase 1 models an additive dose (`dosePerKg`) as ml/kg/day — a direct volume
 * contribution — because the schema carries no stock concentration for
 * additives. A disabled additive contributes nothing. See docs/PROFILE.md.
 */
function computeOne(key: AdditiveKey, entry: AdditiveEntry, weightKg: number): AdditiveComputation {
  const volumeMl = entry.enabled ? entry.dosePerKg * weightKg : 0;
  return {
    key,
    volumeMl,
    result: {
      label: LABELS[key],
      volumeMl,
      detail: { enabled: entry.enabled ? 'yes' : 'no', dosePerKg: entry.dosePerKg },
    },
  };
}

export function computeAdditives(cfg: AdditivesConfig, weightKg: number): AdditiveComputation[] {
  return (Object.keys(LABELS) as AdditiveKey[]).map((key) => computeOne(key, cfg[key], weightKg));
}
