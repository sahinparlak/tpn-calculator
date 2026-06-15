import { describe, expect, it } from 'vitest';
import { calculateTPN, TPNInputError, TPNProfileError } from '../src/index.js';
import type { PatientInput } from '../src/index.js';
import { cloneProfile, syntheticProfile } from './fixtures/synthetic.profile.js';

const ids = (warnings: { ruleId: string }[]): string[] => warnings.map((w) => w.ruleId);

describe('calculateTPN — reference case (2 kg, day 1, central line)', () => {
  const patient: PatientInput = { weightKg: 2, ageDays: 1, line: 'central' };
  const result = calculateTPN(patient, syntheticProfile);

  it('computes the total fluid volume', () => {
    expect(result.totalVolumeMl).toBe(200);
    expect(result.derived.prescribedMlPerKg).toBe(100);
  });

  it('computes macronutrient volumes', () => {
    expect(result.aminoAcid.gPerKg).toBe(1);
    expect(result.aminoAcid.volumeMl).toBe(20);
    expect(result.lipid.volumeMl).toBe(10);
  });

  it('balances volumes and derives the dextrose concentration', () => {
    expect(result.derived.lipidVolumeMl).toBe(10);
    expect(result.derived.aqueousVolumeMl).toBe(190);
    expect(result.derived.dextroseWaterMl).toBeCloseTo(152.2, 5); // 190 − 20 − 14.8 − 3
    expect(result.glucose.gir).toBe(4);
    expect(result.glucose.finalConcentrationPct).toBeCloseTo(7.569, 3);
  });

  it('computes energy and its distribution', () => {
    expect(result.energy.totalKcal).toBeCloseTo(72.08, 5);
    expect(result.energy.kcalPerKg).toBeCloseTo(36.04, 5);
    expect(result.energy.distribution.carbsPct).toBeCloseTo(63.929, 2);
  });

  it('estimates osmolarity and the Ca×P product', () => {
    expect(result.osmolarityMOsmPerL).toBeCloseTo(547.368, 2);
    expect(result.derived.caPhosphateProduct).toBeCloseTo(110.803, 2);
  });

  it('produces no warnings within limits', () => {
    expect(result.warnings).toEqual([]);
  });
});

describe('calculateTPN — safety scenarios', () => {
  it('flags peripheral concentration, osmolarity and Ca-P together under restriction', () => {
    const patient: PatientInput = { weightKg: 2, ageDays: 1, line: 'peripheral', fluidRestrictionPct: 50 };
    const result = calculateTPN(patient, syntheticProfile);
    expect(result.glucose.finalConcentrationPct).toBeCloseTo(22.069, 2);
    expect(ids(result.warnings)).toEqual(
      expect.arrayContaining(['dextrose-peripheral-max', 'osmolarity-peripheral', 'ca-phosphate-precipitation']),
    );
    expect(result.warnings.every((w) => w.level === 'hard')).toBe(true);
  });

  it('reports a hard volume-balance violation when components overflow the volume', () => {
    const patient: PatientInput = { weightKg: 2, ageDays: 1, line: 'central', fluidRestrictionPct: 10 };
    const result = calculateTPN(patient, syntheticProfile);
    expect(result.derived.dextroseWaterMl).toBeLessThan(0);
    expect(result.glucose.finalConcentrationPct).toBe(0);
    const balance = result.warnings.find((w) => w.ruleId === 'volume-balance');
    expect(balance?.level).toBe('hard');
  });

  it('raises a soft volume-overflow warning above maxVolumePerKg', () => {
    const patient: PatientInput = {
      weightKg: 2,
      ageDays: 5,
      line: 'central',
      phototherapy: true,
      radiantWarmer: true,
    };
    const result = calculateTPN(patient, syntheticProfile);
    const overflow = result.warnings.find((w) => w.ruleId === 'volume-overflow');
    expect(overflow?.level).toBe('soft');
    expect(result.warnings.some((w) => w.level === 'hard')).toBe(false);
  });
});

describe('calculateTPN — guards', () => {
  it('throws on invalid patient input', () => {
    expect(() => calculateTPN({ weightKg: 0, ageDays: 1, line: 'central' }, syntheticProfile)).toThrow(TPNInputError);
  });

  it('throws on an unfilled profile', () => {
    const profile = cloneProfile();
    (profile.glucose as { girMax: number | null }).girMax = null;
    expect(() => calculateTPN({ weightKg: 2, ageDays: 1, line: 'central' }, profile)).toThrow(TPNProfileError);
  });
});
