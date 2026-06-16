import type { LineType, PatientInput } from '@tpn/engine';
import { create } from 'zustand';
import { activeProfile } from '../lib/profile';

// Raw form state — numeric fields are kept as strings while typing; parsing and
// validation happen on submit (see `toPatientInput`). No clinical logic here.
export interface PatientFormState {
  weight: string;
  age: string;
  line: LineType;
  gestationalAge: string;
  phototherapy: boolean;
  radiantWarmer: boolean;
  fluidRestriction: string;
  set: (patch: Partial<PatientFormState>) => void;
  reset: () => void;
}

const initial = {
  weight: '',
  age: '',
  line: activeProfile.safety.defaultLine,
  gestationalAge: '',
  phototherapy: false,
  radiantWarmer: false,
  fluidRestriction: '',
};

export const usePatientStore = create<PatientFormState>((set) => ({
  ...initial,
  set: (patch) => set(patch),
  reset: () => set(initial),
}));

/** A field-level validation error, keyed by form field. */
export type FieldErrors = Partial<Record<'weight' | 'age' | 'gestationalAge' | 'fluidRestriction', string>>;

/**
 * Parses + validates the form into a `PatientInput` for the engine. Returns either
 * the input or a map of inline field errors. This guards obvious input mistakes;
 * the engine's own `TPNInputError` remains the backstop.
 */
export function toPatientInput(
  form: PatientFormState,
  messages: {
    weightPositive: string;
    ageInteger: string;
    restrictionRange: string;
    gestationalRange: string;
  },
): { input: PatientInput } | { errors: FieldErrors } {
  const errors: FieldErrors = {};

  const weightKg = Number(form.weight);
  if (!form.weight.trim() || !Number.isFinite(weightKg) || weightKg <= 0) {
    errors.weight = messages.weightPositive;
  }

  const ageDays = Number(form.age);
  if (!form.age.trim() || !Number.isInteger(ageDays) || ageDays < 0) {
    errors.age = messages.ageInteger;
  }

  let gestationalAgeWeeks: number | undefined;
  if (form.gestationalAge.trim()) {
    const g = Number(form.gestationalAge);
    if (!Number.isFinite(g) || g < 20 || g > 45) {
      errors.gestationalAge = messages.gestationalRange;
    } else {
      gestationalAgeWeeks = g;
    }
  }

  let fluidRestrictionPct: number | undefined;
  if (form.fluidRestriction.trim()) {
    const r = Number(form.fluidRestriction);
    if (!Number.isFinite(r) || r <= 0 || r > 100) {
      errors.fluidRestriction = messages.restrictionRange;
    } else {
      fluidRestrictionPct = r;
    }
  }

  if (Object.keys(errors).length > 0) return { errors };

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
