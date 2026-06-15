import { describe, expect, it } from 'vitest';
import { evaluateSafety, type SafetyContext } from '../src/internal/safety.js';
import type { PatientInput } from '../src/index.js';
import { cloneProfile, syntheticProfile } from './fixtures/synthetic.profile.js';

const central: PatientInput = { weightKg: 2, ageDays: 1, line: 'central' };
const peripheral: PatientInput = { ...central, line: 'peripheral' };

const safeCtx: SafetyContext = {
  gir: 4,
  finalDextroseConcentrationPct: 7.57,
  osmolarityMOsmPerL: 547,
  caPhosphateProduct: 110,
  prescribedMlPerKg: 100,
  dextroseWaterMl: 152,
};

const ids = (warnings: { ruleId: string }[]): string[] => warnings.map((w) => w.ruleId);

describe('evaluateSafety', () => {
  it('produces no warnings for a central, in-limits prescription', () => {
    expect(evaluateSafety(safeCtx, central, syntheticProfile)).toEqual([]);
  });

  it('fires the peripheral-line rules when concentration and osmolarity are high', () => {
    const ctx: SafetyContext = {
      ...safeCtx,
      finalDextroseConcentrationPct: 22,
      osmolarityMOsmPerL: 1155,
      caPhosphateProduct: 493,
    };
    const warnings = evaluateSafety(ctx, peripheral, syntheticProfile);
    expect(ids(warnings)).toEqual(
      expect.arrayContaining(['dextrose-peripheral-max', 'osmolarity-peripheral', 'ca-phosphate-precipitation']),
    );
    expect(warnings.every((w) => w.level === 'hard')).toBe(true);
  });

  it('does not fire peripheral rules on a central line', () => {
    const ctx: SafetyContext = { ...safeCtx, finalDextroseConcentrationPct: 22, osmolarityMOsmPerL: 1155 };
    const warnings = evaluateSafety(ctx, central, syntheticProfile);
    expect(ids(warnings)).not.toContain('dextrose-peripheral-max');
    expect(ids(warnings)).not.toContain('osmolarity-peripheral');
  });

  it('fires the soft volume-overflow rule above maxVolumePerKg', () => {
    const warnings = evaluateSafety({ ...safeCtx, prescribedMlPerKg: 180 }, central, syntheticProfile);
    const overflow = warnings.find((w) => w.ruleId === 'volume-overflow');
    expect(overflow?.level).toBe('soft');
  });

  it('fires gir-max via its ref threshold', () => {
    const warnings = evaluateSafety({ ...safeCtx, gir: 13 }, central, syntheticProfile);
    expect(ids(warnings)).toContain('gir-max');
  });

  it('always reports the structural volume-balance violation', () => {
    const warnings = evaluateSafety({ ...safeCtx, dextroseWaterMl: -5 }, central, syntheticProfile);
    const balance = warnings.find((w) => w.ruleId === 'volume-balance');
    expect(balance?.level).toBe('hard');
  });

  it('ignores unknown rule ids', () => {
    const profile = cloneProfile();
    profile.safety.rules.push({ id: 'made-up-rule', level: 'hard', threshold: 1 });
    expect(evaluateSafety(safeCtx, central, profile)).toEqual([]);
  });
});
