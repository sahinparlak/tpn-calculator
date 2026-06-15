import type { ComponentResult, MacronutrientConfig } from '../types.js';
import { advanceValue } from './advancement.js';

export interface MacronutrientComputation {
  gPerKg: number;
  grams: number;
  volumeMl: number;
  result: ComponentResult & { gPerKg: number };
}

/**
 * Amino-acid / lipid volume from a daily dose.
 *
 * The dose (g/kg/day) follows the advancement schedule; grams = dose × weight;
 * volume = grams ÷ (concentration as a fraction), since a product at `c`%
 * carries `c` grams per 100 ml.
 */
export function computeMacronutrient(
  cfg: MacronutrientConfig,
  weightKg: number,
  ageDays: number,
  label: string,
): MacronutrientComputation {
  const gPerKg = advanceValue(cfg.doseStart, cfg.doseAdvance, cfg.doseMax, ageDays);
  const grams = gPerKg * weightKg;
  const volumeMl = grams / (cfg.product.concentrationPct / 100);

  return {
    gPerKg,
    grams,
    volumeMl,
    result: {
      label,
      gPerKg,
      volumeMl,
      detail: {
        product: cfg.product.name,
        concentrationPct: cfg.product.concentrationPct,
        gPerKg,
        totalGrams: grams,
      },
    },
  };
}
