import { describe, expect, it } from 'vitest';
import { assertProfileFilled, assertValidPatient, TPNInputError, TPNProfileError } from '../src/internal/validate.js';
import type { PatientInput } from '../src/index.js';
import { cloneProfile, syntheticProfile } from './fixtures/synthetic.profile.js';

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
