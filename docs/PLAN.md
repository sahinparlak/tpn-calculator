# TPN Calculator — Project Plan

## 1. Vision and core principle

An open-source clinical decision-support tool that makes neonatal/pediatric
parenteral nutrition calculations **center-independent**. The central design
decision: **no clinical value is hardcoded.** All doses, limits, product
concentrations and defaults are defined in a **center profile**
(configuration). The same engine runs at every center; only the profile changes.

## 2. Architecture: two layers

```
┌───────────────────────────────────────────┐
│  UI layer (Expo mobile + React/Next web)   │  ← presentation, NO clinical logic
├───────────────────────────────────────────┤
│  @tpn/engine (pure TS, fully tested)        │  ← the core; framework-agnostic
│  + Profile schema (center configuration)   │
└───────────────────────────────────────────┘
```

The engine is a pure library: input (patient + profile) → output (prescription +
warnings). It knows nothing about the UI, so it runs identically on mobile, on
web, and in tests. This is the center of clinical safety; high test coverage
here is mandatory.

## 3. Technology stack (locked)

- **Monorepo:** npm workspaces (best Expo compatibility; easy to switch to pnpm later)
- **`@tpn/engine`:** pure TypeScript, publishable npm core
- **`apps/mobile`:** Expo (React Native) — iOS + Android (first)
- **`apps/web`:** React/Next — live in-browser demo (next)
- **Test:** Vitest · **CI:** GitHub Actions · **License:** MIT
- **Language:** English-first; no localization initially.

## 4. Domain model

What the engine produces (every threshold/dose comes from the **profile**):

| Component | Calculation | Comes from the profile |
|---|---|---|
| Fluid | total volume by age/kg | start & advancement schedule, adjustments, max |
| Energy | total kcal/kg, distribution | target calorie range |
| Glucose/GIR | GIR (mg/kg/min), final dextrose % | start/max GIR, max concentration |
| Amino acid | g/kg → volume | dose schedule, product and % |
| Lipid | g/kg → volume | dose schedule, product and % |
| Electrolytes | Na/K/Ca/Mg/P/Cl | dose ranges, stock concentrations, unit |
| Additives | trace elements, vitamins, heparin | presence/dose |

**Key derived outputs:** remaining water volume, final dextrose concentration,
**osmolarity** (peripheral/central decision), calorie distribution, total volume
check.

## 5. Clinical safety layer

- **Limit warnings:** GIR, peripheral osmolarity/dextrose, electrolyte limits,
  **Ca-P precipitation risk**, volume overflow. Every threshold from the profile.
- **hard vs soft:** block or warn — defined in the profile.
- **Disclaimer:** a visible clinical disclaimer at startup and on output.
- **Validation dataset:** regression tests with reference cases.
- **Unit system:** kcal/kJ, mmol/mEq — for international use.

## 6. Roadmap

0. **Design lock** ✅ — domain model, profile schema, repo scaffold, plan.
1. **Engine** — `@tpn/engine` calculation logic + comprehensive tests + sample profiles.
2. **Mobile MVP** — Expo: single-patient calculation, single profile, output + warnings.
3. **Configuration UI** — profile selection/editing, unit system, multiple profiles.
4. **Web** — web build from the same engine + live demo (GitHub Pages/Vercel).
5. **Internationalization** — additional languages (English-first), docs site, community infrastructure.

## 7. License and legal

**MIT** — the most permissive; anyone may use/modify/distribute, and its "AS IS"
clause provides legal protection. Because this is a medical tool, a visible
**clinical disclaimer** ([`../DISCLAIMER.md`](../DISCLAIMER.md)) is also included.

## 8. Prestige criteria (ongoing)

Working live demo · high test coverage + green CI · polished README · reusable
core published to npm · clean architecture · release tags · `CONTRIBUTING` +
issue templates · documentation.
