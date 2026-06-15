import type { ComponentResult, ElectrolyteConfig, ElectrolyteEntry } from '../types.js';

export type ElectrolyteKey = keyof ElectrolyteConfig;

export interface ElectrolyteComputation {
  key: ElectrolyteKey;
  /** Total daily dose in `profile.units.electrolyte` units */
  totalDose: number;
  volumeMl: number;
  result: ComponentResult;
}

const LABELS: Record<ElectrolyteKey, string> = {
  sodium: 'Sodium',
  potassium: 'Potassium',
  calcium: 'Calcium',
  magnesium: 'Magnesium',
  phosphate: 'Phosphate',
  chloride: 'Chloride',
};

function computeOne(key: ElectrolyteKey, entry: ElectrolyteEntry, weightKg: number): ElectrolyteComputation {
  const totalDose = entry.dosePerKg * weightKg;
  // dose / (units per ml) = ml; a zero dose contributes no volume.
  const volumeMl = totalDose === 0 ? 0 : totalDose / entry.stockConcentration;
  return {
    key,
    totalDose,
    volumeMl,
    result: {
      label: LABELS[key],
      volumeMl,
      detail: { dosePerKg: entry.dosePerKg, totalDose },
    },
  };
}

export function computeElectrolytes(cfg: ElectrolyteConfig, weightKg: number): ElectrolyteComputation[] {
  return (Object.keys(LABELS) as ElectrolyteKey[]).map((key) => computeOne(key, cfg[key], weightKg));
}
