# @tpn/web

In-browser web app for the TPN Calculator — **React + Vite** on top of
[`@tpn/engine`](../../packages/engine). It runs the same calculation core as the
mobile app: a disclaimer gate, a patient form that recalculates live, and a full
result view with hard/soft safety warnings.

It also ships **full profile management** (parity with the mobile app): multiple
profiles persisted in `localStorage`, profile selection, a complete in-app editor
for every field — validated live by the engine's `validateProfile` — and JSON
import/export. The bundled reference is clone-only. So it isn't read-only:
change any clinical value and the result updates.

It ships the guideline-based **ESPGHAN 2018 reference profile** (read-only here);
like everywhere else in this project, the engine holds no clinical constants —
every value comes from that profile.

> ⚠️ Clinical decision-support tool, **not a medical device**. The ordering
> clinician is solely responsible; verify every result independently. See
> [`DISCLAIMER.md`](../../DISCLAIMER.md).

## Develop

```bash
npm install            # from the repo root (workspaces)
npm run build -w @tpn/engine   # the web app imports the engine's built output
npm run dev -w @tpn/web        # http://localhost:5173
```

Other scripts: `build` (production bundle), `preview` (serve the build),
`typecheck`.

## Deploy

Pushing to `main` triggers [`deploy.yml`](../../.github/workflows/deploy.yml),
which builds the engine and this app and publishes `dist/` to **GitHub Pages**.
The production base path is `/tpn-calculator/` (see `vite.config.ts`).

First-time setup: in the repository **Settings → Pages**, set the source to
**GitHub Actions**.
