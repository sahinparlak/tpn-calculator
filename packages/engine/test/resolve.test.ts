import { describe, expect, it } from 'vitest';
import { resolveRef } from '../src/internal/resolve.js';
import { syntheticProfile } from './fixtures/synthetic.profile.js';

describe('resolveRef', () => {
  it('resolves a dotted path to a number', () => {
    expect(resolveRef(syntheticProfile, 'glucose.girMax')).toBe(12);
    expect(resolveRef(syntheticProfile, 'osmolarity.peripheralMaxMOsmPerL')).toBe(900);
    expect(resolveRef(syntheticProfile, 'caPhosphate.maxSolubilityProduct')).toBe(200);
  });

  it('returns undefined for a missing path', () => {
    expect(resolveRef(syntheticProfile, 'glucose.nope')).toBeUndefined();
    expect(resolveRef(syntheticProfile, 'a.b.c')).toBeUndefined();
  });

  it('returns undefined when the path is not a number', () => {
    expect(resolveRef(syntheticProfile, 'meta.name')).toBeUndefined();
  });
});
