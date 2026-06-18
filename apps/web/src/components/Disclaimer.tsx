import { strings } from '../lib/strings';

const s = strings.disclaimer;

/**
 * Consent gate shown before the calculator. Mirrors the mobile disclaimer: the
 * clinician must accept the terms and take responsibility before continuing.
 */
export function Disclaimer({ onAccept }: { onAccept: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <h2 className="font-display text-2xl text-ink">{s.title}</h2>
        <p className="mt-3 text-[14px] leading-relaxed text-slate-600">{s.intro}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {s.chips.map((chip) => (
            <span key={chip} className="rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700">
              {chip}
            </span>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[12px] leading-relaxed text-amber-800">
          {s.profileNote}
        </div>

        <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
          {s.sections.map((sec) => (
            <div key={sec.h}>
              <h3 className="text-[13px] font-semibold text-ink">{sec.h}</h3>
              <p className="mt-0.5 text-[13px] leading-relaxed text-slate-600">{sec.p}</p>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onAccept}
          className="mt-6 w-full rounded-xl bg-accent-600 px-4 py-3 text-[15px] font-semibold text-white transition hover:bg-accent-700"
        >
          {s.accept}
        </button>
        <p className="mt-2 text-center text-[12px] text-slate-500">{s.consentBefore}</p>
        <p className="mt-3 text-center text-[11px] text-slate-400">{s.footnote}</p>
      </div>
    </div>
  );
}
