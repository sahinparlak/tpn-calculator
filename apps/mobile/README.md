# TPN Calculator — Mobile (Expo)

The mobile app for [TPN Calculator](../../README.md) — Phase 2 MVP. It calculates
a single patient's parenteral nutrition prescription against one embedded center
profile and surfaces the engine's hard/soft safety warnings.

**No clinical logic lives in this app.** Every calculation goes through
[`@tpn/engine`](../../packages/engine); the profile is opaque configuration. The
app is presentation only.

## Stack

- **Expo SDK 56** + **Expo Router** (file-based routing under `src/app/`)
- **NativeWind v4** (Tailwind for React Native) — design tokens in `tailwind.config.js`
- **Zustand** for form state, **AsyncStorage** for the accept-once disclaimer
- **i18n-ready**: all UI strings live in `src/lib/i18n/en.ts` behind `useStrings()`;
  the device locale (via `expo-localization`) selects the dictionary, falling back
  to English. English-only for now — add a `tr.ts` of the same shape to localize.

## Screens

`src/app/` — Disclaimer gate (+ Terms modal) → Patient (validated input) → Result
(`calculateTPN` output, warnings, provenance) → Profile (read-only source summary).

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

- `test/calculation.test.ts` — store → embedded profile → engine integration.
- `test/result-screen.test.tsx` — Result screen render smoke (hard-warning banner).

> Uses `@testing-library/react-native` **v13** + `react-test-renderer` (v14's new
> renderer does not settle with jest-expo 56 / React 19).

## Notes

- Design: Direction C "Modern Editorial" — warm off-white ground, navy (`#1d3a6e`)
  accent, Fraunces + Inter; red/amber reserved for safety ("color = meaning").
- The embedded profile is the guideline-based ESPGHAN 2018 reference — **not
  center-validated**. Verify results against your own protocol. See
  [`DISCLAIMER.md`](../../DISCLAIMER.md).
