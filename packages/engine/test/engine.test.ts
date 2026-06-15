import { describe, it, expect } from 'vitest';
import { calculateTPN } from '../src/index.js';
import type { PatientInput, TPNProfile } from '../src/index.js';

describe('calculateTPN', () => {
  // Temporary: in Phase 1 this will be replaced with validated reference cases.
  it('reports that the implementation is pending (pre-Phase 1)', () => {
    expect(() => calculateTPN({} as PatientInput, {} as TPNProfile)).toThrow();
  });
});
