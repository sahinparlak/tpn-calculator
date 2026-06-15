import { describe, expect, it } from 'vitest';
import { computeElectrolytes } from '../src/internal/electrolytes.js';
import { cloneProfile, syntheticProfile } from './fixtures/synthetic.profile.js';

describe('computeElectrolytes', () => {
  it('returns all six electrolytes in order', () => {
    const result = computeElectrolytes(syntheticProfile.electrolytes, 2);
    expect(result.map((e) => e.key)).toEqual([
      'sodium',
      'potassium',
      'calcium',
      'magnesium',
      'phosphate',
      'chloride',
    ]);
  });

  it('computes total dose and stock volume', () => {
    const result = computeElectrolytes(syntheticProfile.electrolytes, 2);
    const sodium = result.find((e) => e.key === 'sodium');
    const calcium = result.find((e) => e.key === 'calcium');
    expect(sodium?.totalDose).toBe(6); // 3 mmol/kg × 2 kg
    expect(sodium?.volumeMl).toBe(2); // 6 mmol / 3 mmol/ml
    expect(calcium?.totalDose).toBe(2);
    expect(calcium?.volumeMl).toBe(4); // 2 mmol / 0.5 mmol/ml
  });

  it('contributes no volume when the dose is zero', () => {
    const profile = cloneProfile();
    profile.electrolytes.potassium.dosePerKg = 0;
    const potassium = computeElectrolytes(profile.electrolytes, 2).find((e) => e.key === 'potassium');
    expect(potassium?.volumeMl).toBe(0);
  });
});
