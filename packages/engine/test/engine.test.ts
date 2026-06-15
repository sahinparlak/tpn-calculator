import { describe, it, expect } from 'vitest';
import { calculateTPN } from '../src/index.js';
import type { PatientInput, TPNProfile } from '../src/index.js';

describe('calculateTPN', () => {
  // Geçici: Faz 1'de bu test, doğrulanmış referans vakalarla değiştirilecek.
  it('Faz 1 öncesi: implementasyon beklediğini bildirir', () => {
    expect(() => calculateTPN({} as PatientInput, {} as TPNProfile)).toThrow();
  });
});
