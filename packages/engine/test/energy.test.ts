import { describe, expect, it } from 'vitest';
import { computeEnergy } from '../src/internal/energy.js';
import { syntheticProfile } from './fixtures/synthetic.profile.js';

describe('computeEnergy', () => {
  it('sums kcal and computes the macronutrient distribution', () => {
    // carbs 11.52×4=46.08, protein 2×4=8, fat 2×9=18 → total 72.08
    const energy = computeEnergy(syntheticProfile.energy, { carbohydrate: 11.52, protein: 2, fat: 2 }, 2);
    expect(energy.totalKcal).toBeCloseTo(72.08, 5);
    expect(energy.kcalPerKg).toBeCloseTo(36.04, 5);
    expect(energy.distribution.carbsPct).toBeCloseTo(63.929, 2);
    expect(energy.distribution.proteinPct).toBeCloseTo(11.099, 2);
    expect(energy.distribution.fatPct).toBeCloseTo(24.972, 2);
  });

  it('returns zero percentages (no NaN) when there is no energy', () => {
    const energy = computeEnergy(syntheticProfile.energy, { carbohydrate: 0, protein: 0, fat: 0 }, 2);
    expect(energy.totalKcal).toBe(0);
    expect(energy.distribution.carbsPct).toBe(0);
    expect(energy.distribution.fatPct).toBe(0);
  });
});
