import type { LineType, PatientInput } from '@tpn/engine';
import { strings } from './strings';

export interface FormState {
  weight: string;
  age: string;
  line: LineType;
  gestationalAge: string;
  phototherapy: boolean;
  radiantWarmer: boolean;
  fluidRestriction: string;
}

export const initialForm: FormState = {
  weight: '1.5',
  age: '5',
  line: 'central',
  gestationalAge: '',
  phototherapy: false,
  radiantWarmer: false,
  fluidRestriction: '',
};

export type FieldErrors = Partial<Record<'weight' | 'age' | 'gestationalAge' | 'fluidRestriction', string>>;

export type ParseResult = { input: PatientInput } | { errors: FieldErrors };

/**
 * Parse the string-based form into a typed `PatientInput`, or a map of field
 * errors. Mirrors the mobile app's `toPatientInput`. Optional fields are only
 * included when present (the engine config uses exactOptionalPropertyTypes).
 */
export function parseForm(form: FormState): ParseResult {
  const e = strings.patient.errors;
  const errors: FieldErrors = {};

  const weightKg = Number(form.weight);
  if (!form.weight.trim() || !Number.isFinite(weightKg) || weightKg <= 0) {
    errors.weight = e.weightPositive;
  }

  const ageDays = Number(form.age);
  if (!form.age.trim() || !Number.isInteger(ageDays) || ageDays < 0) {
    errors.age = e.ageInteger;
  }

  let gestationalAgeWeeks: number | undefined;
  if (form.gestationalAge.trim()) {
    const ga = Number(form.gestationalAge);
    if (!Number.isFinite(ga) || ga < 20 || ga > 45) {
      errors.gestationalAge = e.gestationalRange;
    } else {
      gestationalAgeWeeks = ga;
    }
  }

  let fluidRestrictionPct: number | undefined;
  if (form.fluidRestriction.trim()) {
    const fr = Number(form.fluidRestriction);
    if (!Number.isFinite(fr) || fr < 0 || fr > 100) {
      errors.fluidRestriction = e.restrictionRange;
    } else {
      fluidRestrictionPct = fr;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const input: PatientInput = {
    weightKg,
    ageDays,
    line: form.line,
    phototherapy: form.phototherapy,
    radiantWarmer: form.radiantWarmer,
    ...(gestationalAgeWeeks !== undefined ? { gestationalAgeWeeks } : {}),
    ...(fluidRestrictionPct !== undefined ? { fluidRestrictionPct } : {}),
  };
  return { input };
}
