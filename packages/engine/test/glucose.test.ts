import { describe, expect, it } from 'vitest';
import { computeGir, dextroseConcentrationPct, glucoseGramsPerDay } from '../src/internal/glucose.js';
import { syntheticProfile } from './fixtures/synthetic.profile.js';

describe('glucose', () => {
  it('advances GIR by day and caps at girMax', () => {
    expect(computeGir(syntheticProfile, 1)).toBe(4);
    expect(computeGir(syntheticProfile, 5)).toBe(8);
    expect(computeGir(syntheticProfile, 10)).toBe(12); // capped
  });

  it('converts GIR to grams of glucose per day', () => {
    // 4 mg/kg/min × 2 kg × 1440 min ÷ 1000 = 11.52 g
    expect(glucoseGramsPerDay(4, 2)).toBeCloseTo(11.52, 5);
  });

  it('computes the dextrose concentration from grams and water volume', () => {
    expect(dextroseConcentrationPct(10, 100)).toBe(10); // 10 g / 100 ml
    expect(dextroseConcentrationPct(11.52, 152.2)).toBeCloseTo(7.569, 3);
  });
});
