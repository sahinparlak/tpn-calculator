import type { TPNProfile } from '../types.js';
import { advanceValue } from './advancement.js';

/** Target glucose infusion rate (mg/kg/min) for the day, per the schedule. */
export function computeGir(profile: TPNProfile, ageDays: number): number {
  const { girStart, girAdvance, girMax } = profile.glucose;
  return advanceValue(girStart, girAdvance, girMax, ageDays);
}

/**
 * Daily glucose mass from GIR.
 *
 * GIR is mg/kg/min, so grams/day = GIR × weight × 1440 min/day ÷ 1000 mg/g.
 */
export function glucoseGramsPerDay(gir: number, weightKg: number): number {
  return (gir * weightKg * 1440) / 1000;
}

/**
 * Final dextrose concentration (% = g/100 ml): the glucose mass dissolved in the
 * water left for dextrose after the other aqueous components take their volume.
 */
export function dextroseConcentrationPct(glucoseGrams: number, dextroseWaterMl: number): number {
  return (glucoseGrams / dextroseWaterMl) * 100;
}
