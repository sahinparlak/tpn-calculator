import { type ProfileError, type TPNProfile, validateProfile } from '@tpn/engine';
import { useState } from 'react';
import { useNav } from '../../store/nav';
import { useProfilesStore } from '../../store/profiles';
import { strings } from '../../lib/strings';

const s = strings.io;

export function ProfileImport() {
  const { replace, back } = useNav();
  const add = useProfilesStore((st) => st.add);
  const [text, setText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [problems, setProblems] = useState<ProfileError[]>([]);

  async function onPaste() {
    try {
      const clip = await navigator.clipboard.readText();
      if (clip) {
        setText(clip);
      }
    } catch {
      // clipboard read unavailable — user can paste manually
    }
  }

  function onImport() {
    setJsonError(null);
    setProblems([]);
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      setJsonError(s.invalidJson);
      return;
    }
    const result = validateProfile(parsed);
    if (!result.valid) {
      setProblems(result.errors);
      return;
    }
    const id = add(parsed as TPNProfile, { activate: false });
    replace({ view: 'detail', id });
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button type="button" onClick={back} className="text-[14px] font-medium text-accent-700">
          ‹ {strings.common.back}
        </button>
        <h2 className="font-display text-xl text-ink">{s.importTitle}</h2>
        <span className="w-10" />
      </div>

      <p className="mb-3 text-[13px] text-slate-500">{s.importHint}</p>

      <button
        type="button"
        onClick={onPaste}
        className="mb-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] font-semibold text-accent-700 hover:bg-slate-50"
      >
        {s.paste}
      </button>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={'{ "meta": { ... }, ... }'}
        spellCheck={false}
        className="h-64 w-full rounded-xl border border-slate-200 bg-white p-3 font-mono text-[12px] text-ink outline-none focus:border-accent-500"
      />

      {jsonError ? (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[13px] font-semibold text-red-700">
          {jsonError}
        </div>
      ) : null}

      {problems.length > 0 ? (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-[13px] font-semibold text-red-700">{s.invalidProfile}</p>
          <ul className="mt-2 space-y-1">
            {problems.slice(0, 12).map((p) => (
              <li key={`${p.path}:${p.message}`} className="text-[12px] text-red-700">
                <span className="font-mono">{p.path}</span> — {p.message}
              </li>
            ))}
          </ul>
          {problems.length > 12 ? <p className="mt-1 text-[12px] text-red-500">+{problems.length - 12} more…</p> : null}
        </div>
      ) : null}

      <button
        type="button"
        onClick={onImport}
        disabled={text.trim() === ''}
        className={`mt-4 w-full rounded-xl px-4 py-3 text-[14px] font-semibold text-white ${
          text.trim() === '' ? 'cursor-not-allowed bg-slate-300' : 'bg-accent-600 hover:bg-accent-700'
        }`}
      >
        {s.importButton}
      </button>
    </div>
  );
}
