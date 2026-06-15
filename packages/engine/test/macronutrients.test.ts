import { describe, expect, it } from 'vitest';
import { computeMacronutrient } from '../src/internal/macronutrients.js';
import { syntheticProfile } from './fixtures/synthetic.profile.js';

describe('computeMacronutrient', () => {
  it('converts a day-1 amino-acid dose to grams and volume', () => {
    const aa = computeMacronutrient(syntheticProfile.aminoAcid, 2, 1, 'Amino acid');
    expect(aa.gPerKg).toBe(1);
    expect(aa.grams).toBe(2);
    expect(aa.volumeMl).toBe(20); // 2 g / (10% = 0.1)
  });

  it('converts a day-1 lipid dose using its concentration', () => {
    const lipid = computeMacronutrient(syntheticProfile.lipid, 2, 1, 'Lipid');
    expect(lipid.volumeMl).toBe(10); // 2 g / 0.2
  });

  it('caps the dose at doseMax on later days', () => {
    const aa = computeMacronutrient(syntheticProfile.aminoAcid, 2, 10, 'Amino acid');
    expect(aa.gPerKg).toBe(3.5); // capped
    expect(aa.grams).toBe(7);
    expect(aa.volumeMl).toBe(70);
  });
});
