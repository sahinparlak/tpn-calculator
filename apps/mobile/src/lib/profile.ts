import type { TPNProfile } from '@tpn/engine';

// The bundled reference profile. Source of truth lives at the repo root; the
// engine treats it as opaque configuration (no clinical constants in the app).
// This ships as the read-only "builtin" profile that seeds the profile store
// (see `store/profiles.ts`); users select, clone or edit profiles on top of it.
import espghanProfile from '../../../../profiles/espghan-2018-reference.json';

export const BUILTIN_PROFILE = espghanProfile as unknown as TPNProfile;

/**
 * Guideline-traceable dosing summary shown on the provenance screen. This mirrors
 * `profiles/espghan-2018-reference.sources.md`; values are display-only and not
 * used in any calculation.
 */
export const provenanceDosing: { label: string; value: string; ref: string }[] = [
  { label: 'GIR (start/advance/max)', value: '4 / 2 / 12', ref: 'R 5.4' },
  { label: 'Amino acid (g/kg)', value: '1.5 → 3.5', ref: 'R 3.1–3.3' },
  { label: 'Lipid (g/kg)', value: '1.0 → 4.0', ref: 'R 4.2–4.3' },
  { label: 'Fluid (mL/kg)', value: '70 → 150', ref: 'Jochum’18' },
  { label: 'Energy target', value: '90–120', ref: 'R 2.6' },
  { label: 'Na / K / Cl', value: '3 / 2 / 3', ref: 'Table 3' },
  { label: 'Ca / P / Mg', value: '1.6 / 1.6 / 0.2', ref: 'R 8.9' },
];
