import { type ReactNode, useState } from 'react';
import { useNav } from '../../store/nav';
import { useProfilesStore } from '../../store/profiles';
import { profileDosingSummary, provenanceDosing } from '../../lib/profile';
import { strings } from '../../lib/strings';
import { Card, CardTitle, KV } from '../ui';

const s = strings.profiles;

export function ProfileDetail({ id }: { id: string }) {
  const { push, replace, back } = useNav();
  const stored = useProfilesStore((st) => st.profiles.find((p) => p.id === id));
  const activeProfileId = useProfilesStore((st) => st.activeProfileId);
  const setActive = useProfilesStore((st) => st.setActive);
  const clone = useProfilesStore((st) => st.clone);
  const remove = useProfilesStore((st) => st.remove);
  const [copied, setCopied] = useState(false);

  if (!stored) {
    return (
      <DetailShell onBack={back}>
        <Card>
          <p className="text-[14px] text-slate-500">{s.notFound}</p>
        </Card>
      </DetailShell>
    );
  }

  const { profile } = stored;
  const builtin = stored.source === 'builtin';
  const active = id === activeProfileId;

  async function onExport() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(profile, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable (permissions / insecure context) — ignore
    }
  }

  function onClone() {
    const newId = clone(id);
    if (newId) {
      replace({ view: 'detail', id: newId });
    }
  }

  function onDelete() {
    if (window.confirm(s.deleteConfirm)) {
      remove(id);
      back();
    }
  }

  const dosing: { label: string; value: string; ref?: string }[] = builtin
    ? provenanceDosing
    : profileDosingSummary(profile);

  return (
    <DetailShell onBack={back}>
      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-xl text-ink">{profile.meta.name}</h2>
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
        <p className={`mt-1 text-[12px] ${builtin ? 'text-amber-700' : 'text-slate-400'}`}>
          {builtin ? s.notCenterValidated : s.centerProfile}
        </p>
        <div className="mt-3 border-t border-slate-100 pt-3">
          <KV k={strings.profile.version} v={profile.meta.version} />
          <KV k={strings.profile.lastReviewed} v={profile.meta.lastReviewed} />
          <KV k={strings.profile.reviewedBy} v={profile.meta.reviewedBy} />
          <KV k={strings.profile.energyUnit} v={profile.units.energy} />
          <KV k={strings.profile.electrolyteUnit} v={profile.units.electrolyte} />
          <KV k={strings.profile.defaultLine} v={profile.safety.defaultLine} />
        </div>
      </Card>

      <div className="space-y-3">
        {active ? (
          <div className="rounded-xl bg-emerald-50 px-4 py-2.5 text-center text-[13px] font-semibold text-emerald-700">
            ✓ {s.isActive}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setActive(id);
              back();
            }}
            className="w-full rounded-xl bg-accent-600 px-4 py-3 text-[14px] font-semibold text-white hover:bg-accent-700"
          >
            {s.setActive}
          </button>
        )}

        <div className="flex gap-3">
          {!builtin ? (
            <button
              type="button"
              onClick={() => push({ view: 'edit', id })}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-600 hover:bg-slate-50"
            >
              {s.edit}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClone}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-600 hover:bg-slate-50"
          >
            {s.clone}
          </button>
          {!builtin ? (
            <button
              type="button"
              onClick={onDelete}
              className="flex-1 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-red-600 hover:bg-red-50"
            >
              {strings.common.delete}
            </button>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onExport}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-600 hover:bg-slate-50"
        >
          {copied ? `✓ ${strings.io.exportedTitle}` : s.exportAction}
        </button>
      </div>

      <Card>
        <CardTitle>{builtin ? strings.profile.dosingTitle : s.dosingTitle}</CardTitle>
        {dosing.map((row) => (
          <div key={row.label} className="flex items-center justify-between py-1 text-[13px]">
            <span className="text-slate-500">{row.label}</span>
            <span className="flex items-center gap-2">
              <span className="font-semibold text-ink">{row.value}</span>
              {row.ref ? (
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-400">{row.ref}</span>
              ) : null}
            </span>
          </div>
        ))}
      </Card>

      {builtin ? (
        <Card>
          <CardTitle>{strings.profile.representativeTitle}</CardTitle>
          <p className="text-[13px] leading-relaxed text-slate-500">{strings.profile.representativeBody}</p>
          <p className="mt-3 text-[12px] text-slate-400">
            {strings.profile.sourceList} profiles/espghan-2018-reference.sources.md
          </p>
        </Card>
      ) : null}
    </DetailShell>
  );
}

function DetailShell({ children, onBack }: { children: ReactNode; onBack: () => void }) {
  return (
    <div className="space-y-3">
      <div className="mb-1 flex items-center justify-between">
        <button type="button" onClick={onBack} className="text-[14px] font-medium text-accent-700">
          ‹ {strings.common.back}
        </button>
        <span className="w-10" />
      </div>
      {children}
    </div>
  );
}
