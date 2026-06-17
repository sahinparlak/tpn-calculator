# TPN Calculator — Mobile (Expo)

The mobile app for [TPN Calculator](../../README.md) — Phases 2–3. It calculates
a single patient's parenteral nutrition prescription against the active center
profile and surfaces the engine's hard/soft safety warnings. Phase 3 adds the
Configuration UI: multiple device-persisted profiles, profile selection, a full
in-app editor (every field, validated by the engine), unit-system-aware output,
and JSON import/export.

**No clinical logic lives in this app.** Every calculation goes through
[`@tpn/engine`](../../packages/engine); the profile is opaque configuration. The
app is presentation only.

## Stack

- **Expo SDK 56** + **Expo Router** (file-based routing under `src/app/`)
- **NativeWind v4** (Tailwind for React Native) — design tokens in `tailwind.config.js`
- **Zustand** for form + profile state; **AsyncStorage** persists profiles (the
  store in `src/store/profiles.ts`) and the accept-once disclaimer
- **expo-clipboard** for profile JSON import/export
- **i18n-ready**: all UI strings live in `src/lib/i18n/en.ts` behind `useStrings()`;
  the device locale (via `expo-localization`) selects the dictionary, falling back
  to English. English-only for now — add a `tr.ts` of the same shape to localize.

## Screens

`src/app/` — Disclaimer gate (+ Terms modal) → Patient (validated input) → Result
(`calculateTPN` output, warnings, unit-aware labels). Profiles flow:
`profiles/` (list) → `profiles/[id]` (detail: set active, clone, export, delete) →
`profiles/edit/[id]` (full editor, live-validated) and `profiles/import` (paste +
validate JSON). The active profile is read via `useActiveProfile()`; the bundled
ESPGHAN reference seeds the store as an undeletable, uneditable builtin.

## Run

From the repo root, install once and build the engine:

```bash
npm install
npm run build -w @tpn/engine
```

Then start the app:

```bash
cd apps/mobile
npx expo start            # then press i (iOS sim), a (Android), or w (web)
npx expo start --web      # browser preview
npx expo start --ios      # iOS Simulator (needs Xcode)
```

On a physical phone, scan the QR code with **Expo Go**. No custom native modules,
so Expo Go / simulator / web all work.

## Test

```bash
cd apps/mobile
npm test                  # jest-expo: integration + render smoke tests
```

- `test/calculation.test.ts` — store → bundled profile → engine integration.
- `test/result-screen.test.tsx` — Result screen render smoke (hard-warning banner).
- `test/profiles-store.test.ts` — profile store: seed, clone, builtin immutability,
  active-profile fallback.
- `test/units.test.ts` — unit labels follow the active profile (mmol/mEq, kcal/kJ).
- `test/profiles-screen.test.tsx` — profile list + detail render.
- `test/profile-editor.test.tsx` — editor validation gating (Save blocks on invalid).
- `test/profile-import.test.tsx` — import rejects bad JSON/profiles, accepts valid.

> Uses `@testing-library/react-native` **v13** + `react-test-renderer` (v14's new
> renderer does not settle with jest-expo 56 / React 19).

## Notes

- Design: Direction C "Modern Editorial" — warm off-white ground, navy (`#1d3a6e`)
  accent, Fraunces + Inter; red/amber reserved for safety ("color = meaning").
- The bundled profile is the guideline-based ESPGHAN 2018 reference — **not
  center-validated**. Clone it and edit (or import your own) to build a center
  profile; verify results against your own protocol. See
  [`DISCLAIMER.md`](../../DISCLAIMER.md).
