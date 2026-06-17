/**
 * @tpn/engine — Public API
 *
 * Core engine: takes a patient input and a center profile, and returns the TPN
 * prescription plus safety warnings.
 *
 * The calculation formulas are universal (GIR, osmolarity, volume balancing,
 * final dextrose concentration); all clinical thresholds, doses and factors
 * come from the `profile`. The engine contains no clinical constants.
 */

export * from './types.js';
export { calculateTPN } from './calculate.js';
export {
  type ProfileError,
  type ProfileValidation,
  TPNInputError,
  TPNProfileError,
  validateProfile,
} from './internal/validate.js';
