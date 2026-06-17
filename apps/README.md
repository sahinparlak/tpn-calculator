# apps/

Application layer — both consume `@tpn/engine` and contain no clinical logic.

- `apps/mobile/` — **Expo (React Native)**, iOS + Android. **Phase 2–3** (built first).
- `apps/web/` — **React/Next**, live in-browser demo. **Phase 4**.

`apps/mobile` now ships the **Configuration UI** (Phase 3): multiple profiles
persisted on the device, profile selection, a full in-app editor (every field,
validated by the engine's `validateProfile`), unit-system-aware output
(mmol/mEq, kcal/kJ), and JSON import/export. The bundled ESPGHAN reference is an
undeletable, uneditable builtin — clone it to create a center profile.

`apps/web/` will be scaffolded in its phase.
