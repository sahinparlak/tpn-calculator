import type { PatientInput, TPNProfile } from '../types.js';
import { resolveRef } from './resolve.js';

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

// ---------------------------------------------------------------------------
// Non-throwing structural validation (for configuration UIs / imports)
// ---------------------------------------------------------------------------

/** A single profile problem, keyed by a dotted field path for inline display. */
export interface ProfileError {
  /** Dotted path to the offending field, e.g. "glucose.girMax". */
  path: string;
  message: string;
}

export type ProfileValidation = { valid: true } | { valid: false; errors: ProfileError[] };

const ELECTROLYTE_IONS = ['sodium', 'potassium', 'calcium', 'magnesium', 'phosphate', 'chloride'] as const;
const ADDITIVE_KEYS = ['traceElements', 'vitamins', 'heparin'] as const;
const TOP_LEVEL_KEYS = new Set([
  'meta',
  'units',
  'patient',
  'fluid',
  'energy',
  'glucose',
  'aminoAcid',
  'lipid',
  'electrolytes',
  'additives',
  'osmolarity',
  'caPhosphate',
  'safety',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Validates an arbitrary value against the profile shape without throwing,
 * returning every problem as a `{ path, message }` pair. This is the executable
 * twin of `profiles/schema/profile.schema.json`: configuration UIs use it for
 * inline field errors, and imports use it to refuse malformed profiles. It checks
 * structure, types, ranges and cross-field rules (schedule continuity, start ≤
 * max, range min ≤ max, safety `ref` paths resolve) but, like the engine, asserts
 * no clinical value of its own.
 */
export function validateProfile(input: unknown): ProfileValidation {
  const errors: ProfileError[] = [];
  const add = (path: string, message: string): void => {
    errors.push({ path, message });
  };

  if (!isRecord(input)) {
    return { valid: false, errors: [{ path: '(root)', message: 'Profile must be an object.' }] };
  }
  const root = input;

  for (const key of Object.keys(root)) {
    if (key.startsWith('_') || key === '$schema') continue;
    if (!TOP_LEVEL_KEYS.has(key)) add(key, 'Unknown top-level field.');
  }

  // Leaf helpers -----------------------------------------------------------
  const num = (
    obj: Record<string, unknown> | undefined,
    key: string,
    path: string,
    opts: { min?: number; max?: number; exclusiveMin?: number; integer?: boolean } = {},
  ): number | undefined => {
    const v = obj?.[key];
    if (v === null || v === undefined) {
      add(path, 'Required value is missing.');
      return undefined;
    }
    if (typeof v !== 'number' || !Number.isFinite(v)) {
      add(path, 'Must be a finite number.');
      return undefined;
    }
    if (opts.integer && !Number.isInteger(v)) add(path, 'Must be a whole number.');
    if (opts.exclusiveMin !== undefined && v <= opts.exclusiveMin)
      add(path, `Must be greater than ${opts.exclusiveMin}.`);
    if (opts.min !== undefined && v < opts.min) add(path, `Must be at least ${opts.min}.`);
    if (opts.max !== undefined && v > opts.max) add(path, `Must be at most ${opts.max}.`);
    return v;
  };

  const text = (
    obj: Record<string, unknown> | undefined,
    key: string,
    path: string,
    opts: { pattern?: RegExp; enum?: readonly string[]; patternHint?: string } = {},
  ): string | undefined => {
    const v = obj?.[key];
    if (v === null || v === undefined || v === '') {
      add(path, 'Required value is missing.');
      return undefined;
    }
    if (typeof v !== 'string') {
      add(path, 'Must be text.');
      return undefined;
    }
    if (v.startsWith('FILL_ME')) {
      add(path, 'Placeholder text must be replaced.');
      return undefined;
    }
    if (opts.enum && !opts.enum.includes(v)) add(path, `Must be one of: ${opts.enum.join(', ')}.`);
    if (opts.pattern && !opts.pattern.test(v)) add(path, opts.patternHint ?? 'Has an invalid format.');
    return v;
  };

  const bool = (obj: Record<string, unknown> | undefined, key: string, path: string): void => {
    const v = obj?.[key];
    if (typeof v !== 'boolean') add(path, 'Must be true or false.');
  };

  const section = (key: string): Record<string, unknown> | undefined => {
    const v = root[key];
    if (v === null || v === undefined) {
      add(key, 'Required section is missing.');
      return undefined;
    }
    if (!isRecord(v)) {
      add(key, 'Must be an object.');
      return undefined;
    }
    return v;
  };

  // meta -------------------------------------------------------------------
  const meta = section('meta');
  if (meta) {
    text(meta, 'name', 'meta.name');
    text(meta, 'version', 'meta.version', {
      pattern: /^\d+\.\d+\.\d+$/,
      patternHint: 'Must be a semantic version, e.g. 1.0.0.',
    });
    text(meta, 'locale', 'meta.locale');
    text(meta, 'lastReviewed', 'meta.lastReviewed', {
      pattern: /^\d{4}-\d{2}-\d{2}$/,
      patternHint: 'Must be an ISO date (YYYY-MM-DD).',
    });
    text(meta, 'reviewedBy', 'meta.reviewedBy');
  }

  // units ------------------------------------------------------------------
  const units = section('units');
  if (units) {
    text(units, 'energy', 'units.energy', { enum: ['kcal', 'kJ'] });
    text(units, 'electrolyte', 'units.electrolyte', { enum: ['mmol', 'mEq'] });
  }

  // patient ----------------------------------------------------------------
  const patient = section('patient');
  if (patient) {
    text(patient, 'ageBasis', 'patient.ageBasis', { enum: ['dayOfLife', 'postmenstrualAge'] });
    bool(patient, 'usesGestationalAge', 'patient.usesGestationalAge');
  }

  // fluid ------------------------------------------------------------------
  const fluid = section('fluid');
  if (fluid) {
    validateFluidSchedule(fluid.schedulePerKg, add, num);
    num(fluid, 'phototherapyAdjMlPerKg', 'fluid.phototherapyAdjMlPerKg');
    num(fluid, 'radiantWarmerAdjMlPerKg', 'fluid.radiantWarmerAdjMlPerKg');
    num(fluid, 'maxVolumePerKg', 'fluid.maxVolumePerKg', { exclusiveMin: 0 });
  }

  // energy -----------------------------------------------------------------
  const energy = section('energy');
  if (energy) {
    const target = energy.targetKcalPerKg;
    if (!isRecord(target)) {
      add('energy.targetKcalPerKg', 'Required section is missing.');
    } else {
      const min = num(target, 'min', 'energy.targetKcalPerKg.min');
      const max = num(target, 'max', 'energy.targetKcalPerKg.max');
      if (min !== undefined && max !== undefined && min > max) {
        add('energy.targetKcalPerKg.max', 'Maximum must be greater than or equal to the minimum.');
      }
    }
    const perGram = energy.kcalPerGram;
    if (!isRecord(perGram)) {
      add('energy.kcalPerGram', 'Required section is missing.');
    } else {
      num(perGram, 'carbohydrate', 'energy.kcalPerGram.carbohydrate', { exclusiveMin: 0 });
      num(perGram, 'protein', 'energy.kcalPerGram.protein', { exclusiveMin: 0 });
      num(perGram, 'fat', 'energy.kcalPerGram.fat', { exclusiveMin: 0 });
    }
  }

  // glucose ----------------------------------------------------------------
  const glucose = section('glucose');
  if (glucose) {
    const girStart = num(glucose, 'girStart', 'glucose.girStart', { exclusiveMin: 0 });
    num(glucose, 'girAdvance', 'glucose.girAdvance', { exclusiveMin: 0 });
    const girMax = num(glucose, 'girMax', 'glucose.girMax', { exclusiveMin: 0 });
    if (girStart !== undefined && girMax !== undefined && girStart > girMax) {
      add('glucose.girMax', 'Maximum GIR must be greater than or equal to the starting GIR.');
    }
    num(glucose, 'maxConcPeripheral', 'glucose.maxConcPeripheral', { exclusiveMin: 0, max: 100 });
    num(glucose, 'maxConcCentral', 'glucose.maxConcCentral', { exclusiveMin: 0, max: 100 });
    const stocks = glucose.stockConcentrations;
    if (!Array.isArray(stocks) || stocks.length === 0) {
      add('glucose.stockConcentrations', 'Provide at least one stock concentration.');
    } else {
      stocks.forEach((v, i) => {
        const path = `glucose.stockConcentrations[${i}]`;
        if (typeof v !== 'number' || !Number.isFinite(v)) add(path, 'Must be a finite number.');
        else if (v <= 0 || v > 100) add(path, 'Must be greater than 0 and at most 100.');
      });
    }
  }

  // macronutrients ---------------------------------------------------------
  validateMacronutrient(section('aminoAcid'), 'aminoAcid', add, num, text);
  validateMacronutrient(section('lipid'), 'lipid', add, num, text);

  // electrolytes -----------------------------------------------------------
  const electrolytes = section('electrolytes');
  if (electrolytes) {
    for (const ion of ELECTROLYTE_IONS) {
      const entry = electrolytes[ion];
      if (!isRecord(entry)) {
        add(`electrolytes.${ion}`, 'Required section is missing.');
        continue;
      }
      num(entry, 'dosePerKg', `electrolytes.${ion}.dosePerKg`, { min: 0 });
      num(entry, 'stockConcentration', `electrolytes.${ion}.stockConcentration`, { exclusiveMin: 0 });
    }
  }

  // additives --------------------------------------------------------------
  const additives = section('additives');
  if (additives) {
    for (const key of ADDITIVE_KEYS) {
      const entry = additives[key];
      if (!isRecord(entry)) {
        add(`additives.${key}`, 'Required section is missing.');
        continue;
      }
      bool(entry, 'enabled', `additives.${key}.enabled`);
      num(entry, 'dosePerKg', `additives.${key}.dosePerKg`, { min: 0 });
    }
  }

  // osmolarity -------------------------------------------------------------
  const osmolarity = section('osmolarity');
  if (osmolarity) {
    num(osmolarity, 'dextroseMOsmPerGram', 'osmolarity.dextroseMOsmPerGram', { min: 0 });
    num(osmolarity, 'aminoAcidMOsmPerGram', 'osmolarity.aminoAcidMOsmPerGram', { min: 0 });
    const coeffs = osmolarity.electrolyteMOsmPerUnit;
    if (!isRecord(coeffs)) {
      add('osmolarity.electrolyteMOsmPerUnit', 'Required section is missing.');
    } else {
      for (const ion of ELECTROLYTE_IONS) {
        num(coeffs, ion, `osmolarity.electrolyteMOsmPerUnit.${ion}`, { min: 0 });
      }
    }
    num(osmolarity, 'peripheralMaxMOsmPerL', 'osmolarity.peripheralMaxMOsmPerL', { exclusiveMin: 0 });
  }

  // caPhosphate ------------------------------------------------------------
  const caPhosphate = section('caPhosphate');
  if (caPhosphate) {
    num(caPhosphate, 'maxSolubilityProduct', 'caPhosphate.maxSolubilityProduct', { exclusiveMin: 0 });
  }

  // safety -----------------------------------------------------------------
  const safety = section('safety');
  if (safety) {
    text(safety, 'defaultLine', 'safety.defaultLine', { enum: ['peripheral', 'central'] });
    const rules = safety.rules;
    if (!Array.isArray(rules)) {
      add('safety.rules', 'Must be a list of rules.');
    } else {
      rules.forEach((rule, i) => {
        const path = `safety.rules[${i}]`;
        if (!isRecord(rule)) {
          add(path, 'Must be an object.');
          return;
        }
        text(rule, 'id', `${path}.id`);
        text(rule, 'level', `${path}.level`, { enum: ['hard', 'soft'] });
        const hasRef = typeof rule.ref === 'string' && rule.ref.length > 0;
        const hasThreshold = typeof rule.threshold === 'number' && Number.isFinite(rule.threshold);
        if (!hasRef && !hasThreshold) {
          add(path, 'Rule needs either a "ref" path or a fixed "threshold".');
        }
        // Only check ref resolution once the rest of the profile is structurally sound,
        // otherwise a missing target would produce confusing duplicate errors.
        if (
          hasRef &&
          errors.length === 0 &&
          resolveRef(root as unknown as TPNProfile, rule.ref as string) === undefined
        ) {
          add(`${path}.ref`, `Reference "${rule.ref}" does not resolve to a profile value.`);
        }
      });
    }
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

type NumFn = (
  obj: Record<string, unknown> | undefined,
  key: string,
  path: string,
  opts?: { min?: number; max?: number; exclusiveMin?: number; integer?: boolean },
) => number | undefined;

type TextFn = (
  obj: Record<string, unknown> | undefined,
  key: string,
  path: string,
  opts?: { pattern?: RegExp; enum?: readonly string[]; patternHint?: string },
) => string | undefined;

function validateMacronutrient(
  macro: Record<string, unknown> | undefined,
  key: string,
  add: (path: string, message: string) => void,
  num: NumFn,
  text: TextFn,
): void {
  if (!macro) return;
  const product = macro.product;
  if (!isRecord(product)) {
    add(`${key}.product`, 'Required section is missing.');
  } else {
    text(product, 'name', `${key}.product.name`);
    num(product, 'concentrationPct', `${key}.product.concentrationPct`, { exclusiveMin: 0, max: 100 });
  }
  const doseStart = num(macro, 'doseStart', `${key}.doseStart`, { min: 0 });
  num(macro, 'doseAdvance', `${key}.doseAdvance`, { min: 0 });
  const doseMax = num(macro, 'doseMax', `${key}.doseMax`, { exclusiveMin: 0 });
  if (doseStart !== undefined && doseMax !== undefined && doseStart > doseMax) {
    add(`${key}.doseMax`, 'Maximum dose must be greater than or equal to the starting dose.');
  }
}

function validateFluidSchedule(steps: unknown, add: (path: string, message: string) => void, num: NumFn): void {
  if (!Array.isArray(steps) || steps.length === 0) {
    add('fluid.schedulePerKg', 'Provide at least one fluid step.');
    return;
  }

  let prevDayTo: number | null = null;
  steps.forEach((step, i) => {
    const path = `fluid.schedulePerKg[${i}]`;
    if (!isRecord(step)) {
      add(path, 'Must be an object.');
      return;
    }
    const dayFrom = num(step, 'dayFrom', `${path}.dayFrom`, { min: 0, integer: true });

    let dayTo: number | null = null;
    if (step.dayTo === null) {
      dayTo = null;
      if (i !== steps.length - 1) add(`${path}.dayTo`, 'Only the final step may be open-ended (dayTo: null).');
    } else {
      dayTo = num(step, 'dayTo', `${path}.dayTo`, { min: 0, integer: true }) ?? null;
      if (dayFrom !== undefined && dayTo !== null && dayTo < dayFrom) {
        add(`${path}.dayTo`, 'dayTo must be greater than or equal to dayFrom.');
      }
    }

    num(step, 'mlPerKg', `${path}.mlPerKg`, { exclusiveMin: 0 });

    // Continuity: each step must start the day after the previous one ended.
    if (i > 0 && dayFrom !== undefined) {
      if (prevDayTo === null) {
        add(`${path}.dayFrom`, 'A step follows an open-ended (dayTo: null) step.');
      } else if (dayFrom !== prevDayTo + 1) {
        add(
          `${path}.dayFrom`,
          `Expected dayFrom ${prevDayTo + 1} to continue from the previous step without a gap or overlap.`,
        );
      }
    }
    prevDayTo = dayTo;
  });
}
