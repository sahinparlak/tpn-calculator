import { describe, expect, it } from 'vitest';
import { computeAdditives } from '../src/internal/additives.js';
import { cloneProfile, syntheticProfile } from './fixtures/synthetic.profile.js';

describe('computeAdditives', () => {
  it('treats an enabled additive dose as a ml/kg volume', () => {
    const result = computeAdditives(syntheticProfile.additives, 2);
    expect(result.find((a) => a.key === 'traceElements')?.volumeMl).toBe(1); // 0.5 × 2
    expect(result.find((a) => a.key === 'vitamins')?.volumeMl).toBe(2); // 1 × 2
  });

  it('contributes nothing when disabled, even with a non-zero dose', () => {
    const profile = cloneProfile();
    profile.additives.heparin = { enabled: false, dosePerKg: 5 };
    const heparin = computeAdditives(profile.additives, 2).find((a) => a.key === 'heparin');
    expect(heparin?.volumeMl).toBe(0);
  });
});
