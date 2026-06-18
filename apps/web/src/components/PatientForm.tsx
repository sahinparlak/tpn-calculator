import type { FieldErrors, FormState } from '../lib/calc';
import { strings } from '../lib/strings';
import { Card, NumberField, Segmented, Toggle } from './ui';

const s = strings.patient;

export function PatientForm({
  form,
  errors,
  onChange,
}: {
  form: FormState;
  errors: FieldErrors;
  onChange: (patch: Partial<FormState>) => void;
}) {
  return (
    <Card>
      <h2 className="mb-4 font-display text-xl tracking-tight text-ink">{s.title}</h2>

      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label={s.weight}
          unit="kg"
          value={form.weight}
          onChange={(v) => onChange({ weight: v })}
          error={errors.weight}
        />
        <NumberField
          label={s.age}
          unit={s.days}
          step="1"
          value={form.age}
          onChange={(v) => onChange({ age: v })}
          error={errors.age}
        />
      </div>

      <div className="mt-4">
        <span className="mb-1.5 block text-[13px] font-semibold text-slate-600">{s.lineType}</span>
        <Segmented
          value={form.line}
          onChange={(line) => onChange({ line })}
          options={[
            { label: s.peripheral, value: 'peripheral' },
            { label: s.central, value: 'central' },
          ]}
        />
        <p className="mt-1.5 text-xs text-slate-400">{s.lineHint}</p>
      </div>

      <p className="mb-3 mt-5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{s.optional}</p>

      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label={s.gestationalAge}
          unit={s.weeks}
          placeholder="—"
          value={form.gestationalAge}
          onChange={(v) => onChange({ gestationalAge: v })}
          error={errors.gestationalAge}
        />
        <NumberField
          label={s.fluidRestriction}
          unit="%"
          placeholder="0"
          value={form.fluidRestriction}
          onChange={(v) => onChange({ fluidRestriction: v })}
          error={errors.fluidRestriction}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Toggle label={s.phototherapy} value={form.phototherapy} onChange={(v) => onChange({ phototherapy: v })} />
        <Toggle label={s.radiantWarmer} value={form.radiantWarmer} onChange={(v) => onChange({ radiantWarmer: v })} />
      </div>
    </Card>
  );
}
