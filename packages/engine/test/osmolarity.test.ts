import { describe, expect, it } from 'vitest';
import { computeOsmolarity } from '../src/internal/osmolarity.js';
import { syntheticProfile } from './fixtures/synthetic.profile.js';

const electrolytes = [
  { key: 'sodium', totalDose: 6 },
  { key: 'potassium', totalDose: 4 },
  { key: 'calcium', totalDose: 2 },
  { key: 'magnesium', totalDose: 0.4 },
  { key: 'phosphate', totalDose: 2 },
  { key: 'chloride', totalDose: 6 },
] as const;

describe('computeOsmolarity', () => {
  it('sums component contributions and divides by aqueous litres', () => {
    // 11.52×5 + 2×8 + (12+8+2+0.4+2+6) = 57.6 + 16 + 30.4 = 104 mOsm / 0.19 L
    const osm = computeOsmolarity(syntheticProfile.osmolarity, {
      glucoseGrams: 11.52,
      aminoAcidGrams: 2,
      electrolytes: [...electrolytes],
      aqueousVolumeMl: 190,
    });
    expect(osm).toBeCloseTo(547.368, 2);
  });

  it('returns 0 when there is no aqueous volume', () => {
    const osm = computeOsmolarity(syntheticProfile.osmolarity, {
      glucoseGrams: 11.52,
      aminoAcidGrams: 2,
      electrolytes: [...electrolytes],
      aqueousVolumeMl: 0,
    });
    expect(osm).toBe(0);
  });
});
