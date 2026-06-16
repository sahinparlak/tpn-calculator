import { describe, expect, it } from 'vitest';
import { computeFluid } from '../src/internal/fluid.js';
import { TPNInputError } from '../src/internal/validate.js';
import type { PatientInput } from '../src/index.js';
import { syntheticProfile } from './fixtures/synthetic.profile.js';

const base: PatientInput = { weightKg: 2, ageDays: 1, line: 'central' };

describe('computeFluid', () => {
  it('uses the schedule step for the day', () => {
    const f = computeFluid(base, syntheticProfile);
    expect(f.prescribedMlPerKg).toBe(100);
    expect(f.totalVolumeMl).toBe(200);
    expect(f.result.detail?.scheduledMlPerKg).toBe(100);
    expect(f.result.detail?.adjustmentsMlPerKg).toBe(0);
  });

  it('adds phototherapy and radiant-warmer adjustments', () => {
    const f = computeFluid({ ...base, ageDays: 5, phototherapy: true, radiantWarmer: true }, syntheticProfile);
    expect(f.prescribedMlPerKg).toBe(180); // 150 + 10 + 20
    expect(f.totalVolumeMl).toBe(360);
  });

  it('scales by a fluid restriction', () => {
    const f = computeFluid({ ...base, fluidRestrictionPct: 50 }, syntheticProfile);
    expect(f.prescribedMlPerKg).toBe(50);
    expect(f.totalVolumeMl).toBe(100);
  });

  it('throws when no schedule step covers the day', () => {
    expect(() => computeFluid({ ...base, ageDays: 0 }, syntheticProfile)).toThrow(TPNInputError);
  });
});
