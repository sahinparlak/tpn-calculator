<h1 align="center">TPN Calculator</h1>

<p align="center">
  <strong>Configurable parenteral nutrition calculator for neonatal &amp; pediatric patients.</strong><br>
  Every clinical value lives in a center profile — nothing is hardcoded.
</p>

<p align="center">
  <a href="https://github.com/sahinparlak/tpn-calculator/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/sahinparlak/tpn-calculator/actions/workflows/ci.yml/badge.svg"></a>
  <a href="#license"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-blue.svg"></a>
  <img alt="Status: early development" src="https://img.shields.io/badge/status-early%20development-orange.svg">
</p>

> ⚠️ **Clinical decision-support tool — not a medical device.** The prescribing
> clinician is fully responsible for every prescription. See
> [`DISCLAIMER.md`](./DISCLAIMER.md).

---

## Why

Total parenteral nutrition (TPN) for neonates and children is calculation-heavy,
error-prone, and **different at every center** — different dose schedules, limits,
product concentrations, and units. Most calculators bake one institution's
protocol into the code.

This project flips that: a **pure, tested calculation engine** plus a
**per-center configuration profile**. The same engine powers every center; only
the profile changes.

## Architecture

```
tpn-calculator/                 (monorepo · npm workspaces)
├── packages/
│   └── engine/        @tpn/engine — framework-agnostic calc core, fully tested
├── apps/
│   ├── mobile/        Expo (React Native) · iOS + Android   ← built first
│   └── web/           React/Next · live in-browser demo     ← built next
├── profiles/          center profiles + JSON Schema
└── docs/              plan, profile-authoring guide
```

The engine knows **no clinical constants**. It takes a patient input and a
center profile, and returns a prescription plus safety warnings.

## Configuration-first

A center profile defines fluid schedules, energy targets, glucose/GIR limits,
amino-acid & lipid dosing, electrolytes, additives, and safety rules (hard =
block, soft = warn). Units (kcal/kJ, mmol/mEq) are configurable for
international use.

See [`docs/PROFILE.md`](./docs/PROFILE.md) and the
[JSON Schema](./profiles/schema/profile.schema.json). A blank starter profile:
[`profiles/erciyes-nicu.template.json`](./profiles/erciyes-nicu.template.json).

## Roadmap

- [x] **Phase 0** — Design lock: domain model, profile schema, plan
- [ ] **Phase 1** — `@tpn/engine`: calculation core + test suite
- [ ] **Phase 2** — Mobile MVP (Expo)
- [ ] **Phase 3** — Profile management UI + units
- [ ] **Phase 4** — Web app + live demo
- [ ] **Phase 5** — i18n, docs site, community

Full plan: [`docs/PLAN.md`](./docs/PLAN.md).

## License

[MIT](./LICENSE) © 2026 Sahin Parlak
