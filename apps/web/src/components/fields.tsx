import { type ReactNode, useState } from 'react';

function numToStr(n: number): string {
  return Number.isFinite(n) ? String(n) : '';
}

function parseNum(text: string): number {
  return text.trim() === '' ? Number.NaN : Number(text);
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="mb-4 font-display text-[15px] text-ink">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function ErrText({ children }: { children: ReactNode }) {
  return <p className="mt-1 text-xs text-red-600">{children}</p>;
}

function LabelText({ label, hint }: { label: string; hint?: string | undefined }) {
  return (
    <span className="mb-1.5 block text-[13px] font-semibold text-slate-600">
      {label}
      {hint ? <span className="ml-1 font-normal text-slate-400">({hint})</span> : null}
    </span>
  );
}

const inputCls = (error?: string) =>
  `w-full rounded-xl border bg-white px-3 py-2.5 text-[15px] text-ink outline-none placeholder:text-slate-300 focus:border-accent-500 ${
    error ? 'border-red-300' : 'border-slate-200'
  }`;

export function EditText({
  label,
  value,
  onChange,
  error,
  hint,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | undefined;
  hint?: string | undefined;
  placeholder?: string | undefined;
}) {
  return (
    <label className="block">
      <LabelText label={label} hint={hint} />
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls(error)}
      />
      {error ? <ErrText>{error}</ErrText> : null}
    </label>
  );
}

export function EditNum({
  label,
  value,
  onChange,
  error,
  hint,
  unit,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  error?: string | undefined;
  hint?: string | undefined;
  unit?: string | undefined;
}) {
  // Local string buffer: keeps partial input ("1.", "") intact instead of
  // round-tripping through Number() on every keystroke. Seeded once; array rows
  // are keyed by stable uids so each field stays mounted with its entry.
  const [text, setText] = useState(() => numToStr(value));
  return (
    <label className="block">
      <LabelText label={label} hint={hint} />
      <span className={`flex items-center gap-2 ${inputCls(error)} p-0 pr-3`}>
        <input
          type="number"
          inputMode="decimal"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            onChange(parseNum(e.target.value));
          }}
          className="w-full bg-transparent px-3 py-2.5 text-[15px] text-ink outline-none"
        />
        {unit ? <span className="shrink-0 text-sm text-slate-400">{unit}</span> : null}
      </span>
      {error ? <ErrText>{error}</ErrText> : null}
    </label>
  );
}

export function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-dashed border-slate-300 px-3 py-2 text-[13px] font-semibold text-accent-700 hover:border-accent-400 hover:bg-accent-50"
    >
      {label}
    </button>
  );
}

export function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[12px] font-medium text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
    >
      {label}
    </button>
  );
}
