import { describe, expect, it } from 'vitest';
import {
  assertProfileFilled,
  assertValidPatient,
  type ProfileError,
  TPNInputError,
  TPNProfileError,
  validateProfile,
} from '../src/internal/validate.js';
import type { PatientInput } from '../src/index.js';
import { espghanReferenceProfile } from './fixtures/espghan-reference.profile.js';
import { cloneProfile, syntheticProfile } from './fixtures/synthetic.profile.js';

/** Asserts validation failed and returns the error paths for assertions. */
function expectInvalid(result: ReturnType<typeof validateProfile>): ProfileError[] {
  expect(result.valid).toBe(false);
  if (result.valid) throw new Error('expected an invalid profile');
  return result.errors;
}

const paths = (errors: ProfileError[]): string[] => errors.map((e) => e.path);

const valid: PatientInput = { weightKg: 2, ageDays: 1, line: 'central' };

describe('assertValidPatient', () => {
  it('accepts valid input', () => {
    expect(() => assertValidPatient(valid)).not.toThrow();
    expect(() => assertValidPatient({ ...valid, fluidRestrictionPct: 50 })).not.toThrow();
  });

  it('rejects a non-positive or non-finite weight', () => {
    expect(() => assertValidPatient({ ...valid, weightKg: 0 })).toThrow(TPNInputError);
    expect(() => assertValidPatient({ ...valid, weightKg: -1 })).toThrow(TPNInputError);
    expect(() => assertValidPatient({ ...valid, weightKg: Number.NaN })).toThrow(TPNInputError);
  });

  it('rejects a non-integer or negative age', () => {
    expect(() => assertValidPatient({ ...valid, ageDays: -1 })).toThrow(TPNInputError);
    expect(() => assertValidPatient({ ...valid, ageDays: 1.5 })).toThrow(TPNInputError);
  });

  it('rejects a fluid restriction outside (0, 100]', () => {
    expect(() => assertValidPatient({ ...valid, fluidRestrictionPct: 0 })).toThrow(TPNInputError);
    expect(() => assertValidPatient({ ...valid, fluidRestrictionPct: 150 })).toThrow(TPNInputError);
  });
});

describe('assertProfileFilled', () => {
  it('accepts a fully-filled profile', () => {
    expect(() => assertProfileFilled(syntheticProfile)).not.toThrow();
  });

  it('rejects a profile with a null value', () => {
    const profile = cloneProfile();
    (profile.glucose as { girMax: number | null }).girMax = null;
    expect(() => assertProfileFilled(profile)).toThrow(TPNProfileError);
  });

  it('rejects a profile that still holds a FILL_ME placeholder', () => {
    const profile = cloneProfile();
    profile.meta.reviewedBy = 'FILL_ME';
    expect(() => assertProfileFilled(profile)).toThrow(TPNProfileError);
  });

  it('ignores helper keys prefixed with underscore', () => {
    const profile = cloneProfile() as Record<string, unknown>;
    profile._note = 'FILL_ME later';
    expect(() => assertProfileFilled(profile as never)).not.toThrow();
  });
});

describe('validateProfile', () => {
  it('accepts the synthetic and the shipped reference profile', () => {
    expect(validateProfile(syntheticProfile)).toEqual({ valid: true });
    expect(validateProfile(espghanReferenceProfile)).toEqual({ valid: true });
  });

  it('ignores helper keys ($schema, underscore-prefixed)', () => {
    const profile = { ...structuredClone(syntheticProfile), $schema: './schema.json', _note: 'x' };
    expect(validateProfile(profile)).toEqual({ valid: true });
  });

  it('rejects a non-object', () => {
    expect(expectInvalid(validateProfile(null))[0].path).toBe('(root)');
    expect(expectInvalid(validateProfile('nope'))[0].path).toBe('(root)');
  });

  it('flags an unknown top-level field', () => {
    const profile = { ...structuredClone(syntheticProfile), bogus: 1 };
    expect(paths(expectInvalid(validateProfile(profile)))).toContain('bogus');
  });

  it('reports a missing required value at its path', () => {
    const profile = cloneProfile() as Record<string, unknown>;
    (profile.glucose as Record<string, unknown>).girMax = null;
    expect(paths(expectInvalid(validateProfile(profile)))).toContain('glucose.girMax');
  });

  it('reports a placeholder string at its path', () => {
    const profile = cloneProfile();
    profile.meta.reviewedBy = 'FILL_ME';
    expect(paths(expectInvalid(validateProfile(profile)))).toContain('meta.reviewedBy');
  });

  it('rejects an out-of-range percentage', () => {
    const profile = cloneProfile();
    profile.glucose.maxConcPeripheral = 150;
    expect(paths(expectInvalid(validateProfile(profile)))).toContain('glucose.maxConcPeripheral');
  });

  it('rejects a bad semantic version and date', () => {
    const profile = cloneProfile();
    profile.meta.version = '1.0';
    profile.meta.lastReviewed = 'soon';
    const p = paths(expectInvalid(validateProfile(profile)));
    expect(p).toContain('meta.version');
    expect(p).toContain('meta.lastReviewed');
  });

  it('rejects an invalid enum value', () => {
    const profile = cloneProfile() as Record<string, unknown>;
    (profile.units as Record<string, unknown>).electrolyte = 'grams';
    expect(paths(expectInvalid(validateProfile(profile)))).toContain('units.electrolyte');
  });

  it('enforces start <= max for GIR and macronutrient doses, and min <= max for ranges', () => {
    const profile = cloneProfile();
    profile.glucose.girStart = 20; // > girMax (12)
    profile.aminoAcid.doseStart = 9; // > doseMax (3.5)
    profile.energy.targetKcalPerKg = { min: 120, max: 90 };
    const p = paths(expectInvalid(validateProfile(profile)));
    expect(p).toContain('glucose.girMax');
    expect(p).toContain('aminoAcid.doseMax');
    expect(p).toContain('energy.targetKcalPerKg.max');
  });

  it('rejects a fluid schedule with a gap', () => {
    const profile = cloneProfile();
    profile.fluid.schedulePerKg = [
      { dayFrom: 1, dayTo: 1, mlPerKg: 100 },
      { dayFrom: 3, dayTo: null, mlPerKg: 150 }, // gap: day 2 missing
    ];
    expect(paths(expectInvalid(validateProfile(profile)))).toContain('fluid.schedulePerKg[1].dayFrom');
  });

  it('rejects an open-ended step that is not last', () => {
    const profile = cloneProfile();
    profile.fluid.schedulePerKg = [
      { dayFrom: 1, dayTo: null, mlPerKg: 100 },
      { dayFrom: 2, dayTo: null, mlPerKg: 150 },
    ];
    expect(paths(expectInvalid(validateProfile(profile)))).toContain('fluid.schedulePerKg[0].dayTo');
  });

  it('rejects a safety rule with neither ref nor threshold', () => {
    const profile = cloneProfile();
    profile.safety.rules = [{ id: 'orphan', level: 'hard' }];
    expect(paths(expectInvalid(validateProfile(profile)))).toContain('safety.rules[0]');
  });

  it('rejects a safety rule whose ref does not resolve', () => {
    const profile = cloneProfile();
    profile.safety.rules = [{ id: 'gir-max', level: 'hard', ref: 'glucose.doesNotExist' }];
    expect(paths(expectInvalid(validateProfile(profile)))).toContain('safety.rules[0].ref');
  });
});
