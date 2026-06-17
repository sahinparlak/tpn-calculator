// Integration test for the app's clinical pipeline: form parsing
// (`toPatientInput`) → bundled ESPGHAN profile (`BUILTIN_PROFILE`) → engine
// (`calculateTPN`). No clinical logic lives in the app, so this verifies the
// wiring is correct end-to-end, not the numbers themselves (the engine has its
// own reference tests).
import { calculateTPN } from '@tpn/engine';
import { en } from '../src/lib/i18n/en';
import { BUILTIN_PROFILE } from '../src/lib/profile';
import { type PatientFormState, toPatientInput } from '../src/store/patient';

// A small, low-birth-weight preterm on day 1: on a peripheral line the admixture
// trips the peripheral dextrose-max hard limit; a central line lifts that limit.
const baseForm: PatientFormState = {
  weight: '1.8',
  age: '1',
  line: 'peripheral',
  gestationalAge: '',
  phototherapy: false,
  radiantWarmer: false,
  fluidRestriction: '',
  set: () => {},
  reset: () => {},
};

function hardRuleIds(line: PatientFormState['line']): string[] {
  const parsed = toPatientInput({ ...baseForm, line }, en.patient.errors);
  if ('errors' in parsed) throw new Error(`unexpected validation errors: ${JSON.stringify(parsed.errors)}`);
  return calculateTPN(parsed.input, BUILTIN_PROFILE)
    .warnings.filter((w) => w.level === 'hard')
    .map((w) => w.ruleId);
}

describe('preterm 1.8 kg — store → embedded profile → engine', () => {
  it('peripheral line raises a line-specific hard warning', () => {
    expect(hardRuleIds('peripheral').some((id) => id.includes('peripheral'))).toBe(true);
  });

  it('switching to a central line clears the peripheral-specific hard warning', () => {
    expect(hardRuleIds('central').some((id) => id.includes('peripheral'))).toBe(false);
  });

  // Ca–P precipitation risk comes from the admixture concentration, not the line —
  // a central line must NOT be read as "safe" just because it cleared the line limit.
  it('keeps the line-agnostic Ca–P precipitation warning on both lines', () => {
    expect(hardRuleIds('peripheral')).toContain('ca-phosphate-precipitation');
    expect(hardRuleIds('central')).toContain('ca-phosphate-precipitation');
  });
});
