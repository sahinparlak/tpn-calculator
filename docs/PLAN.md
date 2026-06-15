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

## 6. Engine calculation model (Phase 1)

The engine implements universal formulas; every number comes from the profile.
The model — and the modeling choices a clinician should review — is:

- **Advancement.** GIR and macronutrient doses follow one schedule pattern:
  `value(day) = min(start + advance × (day − 1), max)`. Day 1 yields `start`.
- **Fluid.** Age-based ml/kg from the schedule, plus phototherapy and
  radiant-warmer adjustments, scaled by any ordered restriction, times weight.
- **Volume balance.** The fluid total is the budget. **Lipid is a separate
  emulsion** drawn from it, leaving an **aqueous admixture** (`total − lipid`).
  Amino acid, electrolytes and additives take their volumes from the admixture;
  the remaining water carries the dextrose, fixing the **final dextrose %**.
- **Glucose.** `grams/day = GIR × weight × 1440 ÷ 1000`; concentration is
  `glucose g ÷ dextrose-water ml × 100`.
- **Macronutrients / electrolytes.** `volume = amount ÷ concentration` (product
  `%` for macros, stock units/ml for electrolytes).
- **Additives.** With no stock concentration in the schema, an additive dose is
  modeled as **ml/kg/day** (a direct volume); a disabled additive adds nothing.
- **Energy.** `kcal = grams × kcalPerGram` per macronutrient (factors from the
  profile); distribution is each one's share of the total.
- **Osmolarity.** Linear estimate over the aqueous admixture:
  `Σ (amount × coefficient) ÷ litres`; all coefficients from the profile. Lipid
  is excluded (separate emulsion).
- **Ca–P.** Phase 1 uses the simple solubility product (Ca × P concentrations in
  the admixture) versus a profile threshold — an approximation, not a curve.
- **Safety.** Rules from the profile are evaluated against the computed values
  (`ref`/`threshold`); `hard` violations are **returned as warnings, not thrown**
  — the caller decides whether to block. A built-in structural check flags when
  components overflow the total volume.

> These choices (lipid separate from the budget, additive dose as ml/kg, the
> Ca–P product model) are deliberate, documented defaults open to a center's
> clinical review.

## 7. Roadmap

0. **Design lock** ✅ — domain model, profile schema, repo scaffold, plan.
1. **Engine** ✅ — `@tpn/engine` calculation logic + comprehensive tests. (A
   filled clinical profile still requires a center's own numbers.)
2. **Mobile MVP** — Expo: single-patient calculation, single profile, output + warnings.
3. **Configuration UI** — profile selection/editing, unit system, multiple profiles.
4. **Web** — web build from the same engine + live demo (GitHub Pages/Vercel).
5. **Internationalization** — additional languages (English-first), docs site, community infrastructure.

## 8. License and legal

**MIT** — the most permissive; anyone may use/modify/distribute, and its "AS IS"
clause provides legal protection. Because this is a medical tool, a visible
**clinical disclaimer** ([`../DISCLAIMER.md`](../DISCLAIMER.md)) is also included.

## 9. Prestige criteria (ongoing)

Working live demo · high test coverage + green CI · polished README · reusable
core published to npm · clean architecture · release tags · `CONTRIBUTING` +
issue templates · documentation.
