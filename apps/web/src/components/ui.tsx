import type { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-slate-200 bg-white p-5 ${className}`}>{children}</div>;
}

export function CardTitle({ children, danger = false }: { children: ReactNode; danger?: boolean }) {
  return <h3 className={`mb-3 font-display text-[13px] ${danger ? 'text-red-700' : 'text-slate-700'}`}>{children}</h3>;
}

export function KV({ k, v, danger = false }: { k: string; v: string; danger?: boolean }) {
  return (
    <div className="flex justify-between py-1 text-[13px]">
      <span className="text-slate-500">{k}</span>
      <span className={`font-semibold ${danger ? 'text-red-700' : 'text-ink'}`}>{v}</span>
    </div>
  );
}

export function NumberField({
  label,
  unit,
  value,
  onChange,
  error,
  placeholder,
  step,
}: {
  label: string;
  unit?: string | undefined;
  value: string;
  onChange: (v: string) => void;
  error?: string | undefined;
  placeholder?: string | undefined;
  step?: string | undefined;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-slate-600">{label}</span>
      <div
        className={`flex items-center gap-2 rounded-xl border bg-white px-3 py-2.5 focus-within:border-accent-500 ${
          error ? 'border-red-300' : 'border-slate-200'
        }`}
      >
        <input
          type="number"
          inputMode="decimal"
          step={step ?? 'any'}
          value={value}
          placeholder={placeholder}
          onChange={(ev) => onChange(ev.target.value)}
          className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-slate-300"
        />
        {unit ? <span className="shrink-0 text-sm text-slate-400">{unit}</span> : null}
      </div>
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { label: string; value: T }[];
}) {
  return (
    <div className="flex rounded-xl bg-slate-100 p-1">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className={`flex-1 rounded-lg px-3 py-2 text-[13px] font-semibold transition ${
              active ? 'bg-white text-ink shadow-sm' : 'text-slate-500'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      aria-pressed={value}
      className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left"
    >
      <span className="text-[14px] text-slate-600">{label}</span>
      <span className={`relative h-6 w-10 rounded-full transition ${value ? 'bg-accent-600' : 'bg-slate-300'}`}>
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            value ? 'left-[18px]' : 'left-0.5'
          }`}
        />
      </span>
    </button>
  );
}
