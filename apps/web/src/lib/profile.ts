import type { TPNProfile } from '@tpn/engine';

// The bundled reference profile. Source of truth lives at the repo root (shared
// with the mobile app); the engine treats it as opaque configuration — no
// clinical constants live in this app. The web demo ships this single
// guideline-derived reference; it is read-only here.
import espghanProfile from '../../../../profiles/espghan-2018-reference.json';

export const BUILTIN_PROFILE = espghanProfile as unknown as TPNProfile;
