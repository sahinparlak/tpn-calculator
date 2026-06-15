import { describe, expect, it } from 'vitest';
import { advanceValue } from '../src/internal/advancement.js';

describe('advanceValue', () => {
  it('returns start on day 1', () => {
    expect(advanceValue(4, 1, 12, 1)).toBe(4);
  });

  it('adds advance for each day after the first', () => {
    expect(advanceValue(4, 1, 12, 5)).toBe(8); // 4 + 1*4
    expect(advanceValue(1, 0.5, 3.5, 5)).toBe(3); // 1 + 0.5*4
  });

  it('never exceeds max', () => {
    expect(advanceValue(4, 1, 12, 10)).toBe(12); // 4 + 9 = 13, capped
    expect(advanceValue(1, 0.5, 3.5, 10)).toBe(3.5); // capped
  });

  it('clamps day < 1 to start', () => {
    expect(advanceValue(4, 1, 12, 0)).toBe(4);
  });
});
