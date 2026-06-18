import { calculateTPN, type TPNProfile, type TPNResult } from '@tpn/engine';
import { useMemo, useState } from 'react';
import { useNav } from '../store/nav';
import { useActiveProfile, useActiveStoredProfile } from '../store/profiles';
import { type FieldErrors, type FormState, initialForm, parseForm } from '../lib/calc';
import { strings } from '../lib/strings';
import { PatientForm } from './PatientForm';
import { ResultView } from './ResultView';
import { Card } from './ui';

type Computed = { result: TPNResult } | { errors: FieldErrors } | { error: string };

function compute(form: FormState, profile: TPNProfile): Computed {
  const parsed = parseForm(form);
  if ('errors' in parsed) {
    return { errors: parsed.errors };
  }
  try {
    return { result: calculateTPN(parsed.input, profile) };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export function Calculator() {
  const push = useNav((n) => n.push);
  const profile = useActiveProfile();
  const stored = useActiveStoredProfile();
  const [form, setForm] = useState<FormState>(initialForm);

  const computed = useMemo(() => compute(form, profile), [form, profile]);
  const errors: FieldErrors = 'errors' in computed ? computed.errors : {};
  const builtin = stored.source === 'builtin';

  return (
    <>
      <button
        type="button"
        onClick={() => push({ view: 'profiles' })}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left hover:bg-slate-50"
      >
        <span className="min-w-0">
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {strings.result.activeProfile}
          </span>
          <span className="mt-0.5 block font-semibold text-ink">{profile.meta.name}</span>
          <span className={`mt-0.5 block text-[12px] ${builtin ? 'text-amber-700' : 'text-slate-400'}`}>
            {builtin ? strings.profiles.notCenterValidated : strings.profiles.centerProfile}
          </span>
        </span>
        <span className="shrink-0 text-[13px] font-medium text-accent-700">{strings.common.profiles} ›</span>
      </button>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <PatientForm form={form} errors={errors} onChange={(patch) => setForm((f) => ({ ...f, ...patch }))} />
        </div>

        <div>
          {'result' in computed ? (
            <ResultView result={computed.result} profile={profile} />
          ) : 'error' in computed ? (
            <Card>
              <p className="text-[14px] text-red-700">{computed.error}</p>
            </Card>
          ) : (
            <Card>
              <p className="text-[14px] text-slate-500">{strings.result.incomplete}</p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
