import type { PatientInput, TPNProfile, Warning } from '../types.js';
import { resolveRef } from './resolve.js';

/** Computed quantities the safety rules are evaluated against. */
export interface SafetyContext {
  gir: number;
  finalDextroseConcentrationPct: number;
  osmolarityMOsmPerL: number;
  caPhosphateProduct: number;
  prescribedMlPerKg: number;
  /** Water remaining for dextrose; <= 0 means components overflow the volume */
  dextroseWaterMl: number;
}

/** Returns true when the rule's limit is violated. */
type Predicate = (ctx: SafetyContext, patient: PatientInput, threshold: number) => boolean;

/**
 * Predicates for the known safety-rule ids. Each rule supplies its threshold
 * from the profile (`ref` or `threshold`); this map only decides which computed
 * quantity to compare and under what condition. Unknown rule ids are ignored,
 * so a center can omit rules without breaking the engine.
 */
const PREDICATES: Record<string, Predicate> = {
  'gir-max': (ctx, _patient, threshold) => ctx.gir > threshold,
  'dextrose-peripheral-max': (ctx, patient, threshold) =>
    patient.line === 'peripheral' && ctx.finalDextroseConcentrationPct > threshold,
  'osmolarity-peripheral': (ctx, patient, threshold) =>
    patient.line === 'peripheral' && ctx.osmolarityMOsmPerL > threshold,
  'ca-phosphate-precipitation': (ctx, _patient, threshold) => ctx.caPhosphateProduct > threshold,
  'volume-overflow': (ctx, _patient, threshold) => ctx.prescribedMlPerKg > threshold,
};

/** Built-in rule id for the structural check that components fit in the volume. */
export const VOLUME_BALANCE_RULE_ID = 'volume-balance';

export function evaluateSafety(ctx: SafetyContext, patient: PatientInput, profile: TPNProfile): Warning[] {
  const warnings: Warning[] = [];

  // Structural guard, independent of any configured rule: the other components
  // must not consume more than the total fluid volume.
  if (ctx.dextroseWaterMl <= 0) {
    warnings.push({
      ruleId: VOLUME_BALANCE_RULE_ID,
      level: 'hard',
      message: 'Component volumes exceed the total fluid volume; no water left for dextrose.',
    });
  }

  for (const rule of profile.safety.rules) {
    const predicate = PREDICATES[rule.id];
    if (!predicate) continue;

    const threshold = rule.ref !== undefined ? resolveRef(profile, rule.ref) : rule.threshold;
    if (threshold === undefined) continue;

    if (predicate(ctx, patient, threshold)) {
      warnings.push({
        ruleId: rule.id,
        level: rule.level,
        message: rule.message ?? `Safety rule "${rule.id}" violated.`,
      });
    }
  }

  return warnings;
}
