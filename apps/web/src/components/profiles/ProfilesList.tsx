import { useNav } from '../../store/nav';
import { useProfilesStore } from '../../store/profiles';
import { strings } from '../../lib/strings';

const s = strings.profiles;

export function ProfilesList() {
  const { push, back } = useNav();
  const profiles = useProfilesStore((st) => st.profiles);
  const activeProfileId = useProfilesStore((st) => st.activeProfileId);
  const clone = useProfilesStore((st) => st.clone);

  function onNew() {
    const newId = clone(activeProfileId);
    if (newId) {
      push({ view: 'edit', id: newId });
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button type="button" onClick={back} className="text-[14px] font-medium text-accent-700">
          ‹ {strings.common.back}
        </button>
        <h2 className="font-display text-xl text-ink">{s.title}</h2>
        <span className="w-10" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {profiles.map((p, i) => {
          const builtin = p.source === 'builtin';
          const active = p.id === activeProfileId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => push({ view: 'detail', id: p.id })}
              className={`flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50 ${
                i > 0 ? 'border-t border-slate-100' : ''
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-ink">{p.profile.meta.name}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      builtin ? 'bg-amber-100 text-amber-800' : 'bg-accent-50 text-accent-700'
                    }`}
                  >
                    {builtin ? s.reference : s.custom}
                  </span>
                  {active ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                      ✓ {s.activeBadge}
                    </span>
                  ) : null}
                </div>
                <span className="text-[12px] text-slate-400">v{p.profile.meta.version}</span>
              </div>
              <span className="text-slate-300">›</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={onNew}
          className="flex-1 rounded-xl bg-accent-600 px-4 py-3 text-[14px] font-semibold text-white hover:bg-accent-700"
        >
          + {s.newProfile}
        </button>
        <button
          type="button"
          onClick={() => push({ view: 'import' })}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[14px] font-semibold text-slate-600 hover:bg-slate-50"
        >
          {s.importAction}
        </button>
      </div>
      <p className="mt-3 text-[12px] leading-relaxed text-slate-400">{s.builtinNote}</p>
    </div>
  );
}
