import { calculateTPN, type TPNResult } from '@tpn/engine';
import { useMemo, useState } from 'react';
import { Disclaimer } from './components/Disclaimer';
import { PatientForm } from './components/PatientForm';
import { ResultView } from './components/ResultView';
import { Card } from './components/ui';
import { type FieldErrors, type FormState, initialForm, parseForm } from './lib/calc';
import { BUILTIN_PROFILE } from './lib/profile';
import { strings } from './lib/strings';

const ACCEPT_KEY = 'tpn-web:accepted';

type Computed = { result: TPNResult } | { errors: FieldErrors } | { error: string };

function compute(form: FormState): Computed {
  const parsed = parseForm(form);
  if ('errors' in parsed) {
    return { errors: parsed.errors };
  }
  try {
    return { result: calculateTPN(parsed.input, BUILTIN_PROFILE) };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export function App() {
  const [accepted, setAccepted] = useState(() => {
    try {
      return localStorage.getItem(ACCEPT_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [form, setForm] = useState<FormState>(initialForm);

  const computed = useMemo(() => compute(form), [form]);
  const errors: FieldErrors = 'errors' in computed ? computed.errors : {};

  function accept() {
    try {
      localStorage.setItem(ACCEPT_KEY, '1');
    } catch {
      // ignore storage failures (private mode); accept for this session anyway
    }
    setAccepted(true);
  }

  return (
    <div className="min-h-screen">
      {!accepted ? <Disclaimer onAccept={accept} /> : null}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-4 sm:px-6">
          <h1 className="font-display text-xl text-ink">{strings.app.name}</h1>
          <span className="rounded-full bg-accent-50 px-2 py-0.5 text-[11px] font-semibold text-accent-700">
            {strings.app.demoBadge}
          </span>
          <a
            href="https://github.com/sahinparlak/tpn-calculator"
            target="_blank"
            rel="noreferrer"
            className="ml-auto text-[13px] font-medium text-accent-700 hover:underline"
          >
            {strings.app.repo} ↗
          </a>
          <p className="w-full text-[13px] text-slate-500">{strings.app.tagline}</p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-[12px] leading-relaxed text-amber-800">
          {strings.disclaimer.profileNote}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
          <div className="lg:sticky lg:top-6 lg:self-start">
            <PatientForm form={form} errors={errors} onChange={(patch) => setForm((f) => ({ ...f, ...patch }))} />
          </div>

          <div>
            {'result' in computed ? (
              <ResultView result={computed.result} profile={BUILTIN_PROFILE} />
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

        <footer className="mt-10 border-t border-slate-200 pt-4 text-[12px] text-slate-400">
          {strings.disclaimer.footnote} · MIT © 2026 Sahin Parlak
        </footer>
      </main>
    </div>
  );
}
