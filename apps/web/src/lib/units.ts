import type { TPNProfile } from '@tpn/engine';

// Unit labels derived from the active profile. The engine already emits every
// number in the profile's own units, so this is purely a labeling concern — no
// value is converted here. Mirrors the mobile app's units helper.
export interface UnitLabels {
  energy: string;
  energyPerKg: string;
  electrolyte: string;
  electrolytePerKg: string;
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
