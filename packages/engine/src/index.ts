/**
 * @tpn/engine — Public API
 *
 * Core engine: takes a patient input and a center profile, and returns the
 * TPN prescription plus safety warnings.
 *
 * The calculation formulas are universal (GIR, osmolarity, volume balancing,
 * final dextrose concentration); all clinical thresholds and doses come from
 * the `profile`.
 */

export * from './types';

import type { PatientInput, TPNProfile, TPNResult } from './types';

/**
 * Calculates the TPN prescription.
 *
 * @remarks To be implemented in Phase 1. The signature and domain model were
 * locked in Phase 0.
 */
export function calculateTPN(_patient: PatientInput, _profile: TPNProfile): TPNResult {
  throw new Error('calculateTPN: implementation will be added in Phase 1.');
}
