import type { PatientInput, TPNProfile } from '../types.js';

/** Thrown when the patient input is malformed (e.g. non-positive weight). */
export class TPNInputError extends Error {
  override readonly name = 'TPNInputError';
}

/** Thrown when the profile is incomplete (still holds template placeholders). */
export class TPNProfileError extends Error {
  override readonly name = 'TPNProfileError';
}

export function assertValidPatient(patient: PatientInput): void {
  if (!Number.isFinite(patient.weightKg) || patient.weightKg <= 0) {
    throw new TPNInputError(`weightKg must be a positive number (received ${patient.weightKg}).`);
  }
  if (!Number.isInteger(patient.ageDays) || patient.ageDays < 0) {
    throw new TPNInputError(`ageDays must be a non-negative integer (received ${patient.ageDays}).`);
  }
  if (patient.fluidRestrictionPct !== undefined) {
    const pct = patient.fluidRestrictionPct;
    if (!Number.isFinite(pct) || pct <= 0 || pct > 100) {
      throw new TPNInputError(`fluidRestrictionPct must be within (0, 100] (received ${pct}).`);
    }
  }
}

/**
 * Refuses to run on an unfilled profile. The template ships with `null` and
 * `"FILL_ME"` placeholders; the engine must never compute on them, so this scan
 * collects every unfilled leaf and throws with their paths. Helper keys prefixed
 * with `_` (e.g. `_note`, `_help`) are ignored.
 */
export function assertProfileFilled(profile: TPNProfile): void {
  const unfilled: string[] = [];

  // Keys where `null` is a real value, not an unfilled placeholder.
  // `fluid.schedulePerKg[].dayTo: null` means "that day and onward".
  const nullableKeys = new Set(['dayTo']);

  const visit = (value: unknown, path: string, key: string): void => {
    if (value === null || value === undefined) {
      if (value === null && nullableKeys.has(key)) return;
      unfilled.push(path || '(root)');
      return;
    }
    if (typeof value === 'number' && !Number.isFinite(value)) {
      unfilled.push(path);
      return;
    }
    if (typeof value === 'string' && value.startsWith('FILL_ME')) {
      unfilled.push(path);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item, i) => {
        visit(item, `${path}[${i}]`, key);
      });
      return;
    }
    if (typeof value === 'object') {
      for (const [childKey, child] of Object.entries(value as Record<string, unknown>)) {
        if (childKey.startsWith('_')) continue;
        visit(child, path ? `${path}.${childKey}` : childKey, childKey);
      }
    }
  };

  visit(profile, '', '');

  if (unfilled.length > 0) {
    throw new TPNProfileError(
      `Profile has ${unfilled.length} unfilled value(s); complete them before use: ${unfilled.join(', ')}.`,
    );
  }
}
