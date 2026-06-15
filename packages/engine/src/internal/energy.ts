import type { EnergyConfig, EnergyResult } from '../types.js';

export interface MacronutrientGrams {
  carbohydrate: number;
  protein: number;
  fat: number;
}

/**
 * Energy total and macronutrient distribution. Each macronutrient's kcal is
 * `grams × profile.energy.kcalPerGram`; the distribution is each one's share of
 * the total. Energy-density factors come from the profile, not the engine.
 */
export function computeEnergy(cfg: EnergyConfig, grams: MacronutrientGrams, weightKg: number): EnergyResult {
  const carbKcal = grams.carbohydrate * cfg.kcalPerGram.carbohydrate;
  const proteinKcal = grams.protein * cfg.kcalPerGram.protein;
  const fatKcal = grams.fat * cfg.kcalPerGram.fat;
  const totalKcal = carbKcal + proteinKcal + fatKcal;

  const share = (part: number): number => (totalKcal > 0 ? (part / totalKcal) * 100 : 0);

  return {
    totalKcal,
    kcalPerKg: totalKcal / weightKg,
    distribution: {
      carbsPct: share(carbKcal),
      proteinPct: share(proteinKcal),
      fatPct: share(fatKcal),
    },
  };
}
