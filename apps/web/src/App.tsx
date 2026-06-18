import { useState } from 'react';
import { Calculator } from './components/Calculator';
import { Disclaimer } from './components/Disclaimer';
import { ProfileDetail } from './components/profiles/ProfileDetail';
import { ProfileEditor } from './components/profiles/ProfileEditor';
import { ProfileImport } from './components/profiles/ProfileImport';
import { ProfilesList } from './components/profiles/ProfilesList';
import { useNav, useRoute } from './store/nav';
import { strings } from './lib/strings';

const ACCEPT_KEY = 'tpn-web:accepted';

function CurrentView() {
  const route = useRoute();
  switch (route.view) {
    case 'profiles':
      return <ProfilesList />;
    case 'detail':
      return <ProfileDetail id={route.id} />;
    case 'edit':
      return <ProfileEditor id={route.id} />;
    case 'import':
      return <ProfileImport />;
    default:
      return <Calculator />;
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
  const goHome = useNav((n) => n.push);
  const route = useRoute();

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
          <button
            type="button"
            onClick={() => goHome({ view: 'calculator' })}
            className="font-display text-xl text-ink"
          >
            {strings.app.name}
          </button>
          {route.view === 'calculator' ? (
            <button
              type="button"
              onClick={() => goHome({ view: 'profiles' })}
              className="text-[13px] font-medium text-accent-700 hover:underline"
            >
              {strings.common.profiles}
            </button>
          ) : null}
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
        <CurrentView />

        <footer className="mt-10 border-t border-slate-200 pt-4 text-[12px] text-slate-400">
          {strings.disclaimer.footnote} · MIT © 2026 Sahin Parlak
        </footer>
      </main>
    </div>
  );
}
