import type { OsmolarityConfig, OsmolarityElectrolyteCoefficients } from '../types.js';

export interface OsmolarityInput {
  glucoseGrams: number;
  aminoAcidGrams: number;
  electrolytes: { key: keyof OsmolarityElectrolyteCoefficients; totalDose: number }[];
  /** Volume of the aqueous admixture (total minus lipid emulsion), ml */
  aqueousVolumeMl: number;
}

/**
 * Osmolarity estimate (mOsm/L) of the aqueous admixture, modeled as a linear
 * sum: each component contributes `amount × coefficient`, divided by the
 * aqueous volume in litres. The engine owns only this structure — every
 * coefficient comes from `profile.osmolarity`. Lipid is excluded (separate
 * emulsion, negligible osmotic contribution).
 */
export function computeOsmolarity(cfg: OsmolarityConfig, input: OsmolarityInput): number {
  let mOsm = input.glucoseGrams * cfg.dextroseMOsmPerGram + input.aminoAcidGrams * cfg.aminoAcidMOsmPerGram;
  for (const electrolyte of input.electrolytes) {
    mOsm += electrolyte.totalDose * cfg.electrolyteMOsmPerUnit[electrolyte.key];
  }
  const litres = input.aqueousVolumeMl / 1000;
  return litres > 0 ? mOsm / litres : 0;
}
