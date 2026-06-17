import type { TPNProfile } from '@tpn/engine';

// Unit labels derived from the active profile. The engine already emits every
// number in the profile's own units (electrolyte doses in `units.electrolyte`,
// energy from the profile's per-gram factors), so this is purely a labeling
// concern — no value is converted here.
export interface UnitLabels {
  /** 'kcal' | 'kJ' */
  energy: string;
  /** e.g. 'kcal/kg' */
  energyPerKg: string;
  /** 'mmol' | 'mEq' */
  electrolyte: string;
  /** e.g. 'mmol/kg' */
  electrolytePerKg: string;
  /** Ca × P product unit, e.g. '(mmol/L)²' */
  caPhosphateProduct: string;
}

export function unitLabels(profile: TPNProfile): UnitLabels {
  const energy = profile.units.energy;
  const electrolyte = profile.units.electrolyte;
  return {
    energy,
    energyPerKg: `${energy}/kg`,
    electrolyte,
    electrolytePerKg: `${electrolyte}/kg`,
    caPhosphateProduct: `(${electrolyte}/L)²`,
  };
}
