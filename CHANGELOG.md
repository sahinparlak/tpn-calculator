# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Web app (`apps/web`)** — Phase 4. A live in-browser demo built with React + Vite on the same
  `@tpn/engine`: accept-once disclaimer gate, a patient form that recalculates live, and the full
  result view (hard/soft safety warnings, glucose/GIR, macronutrients, electrolytes, energy
  distribution, osmolarity, Ca–P estimate). Ships the guideline-based ESPGHAN 2018 reference profile.
- **GitHub Pages deployment** — `deploy.yml` workflow builds the engine and the web app and publishes
  the demo to GitHub Pages on every relevant push to `main`.

## [0.1.0] — 2026-06-17

First tagged release. The calculation engine and the mobile app are feature-complete for
single-center use; every clinical value comes from a configurable profile, none are hardcoded.

### Added

- **`@tpn/engine`** — framework-agnostic calculation core: fluid schedules, energy targets,
  glucose/GIR, macronutrients, electrolytes, additives, osmolarity, and a Ca–P solubility-product
  estimate, with profile-driven hard/soft safety rules. 87 tests, 98% coverage.
- **Profile system** — JSON Schema plus a non-throwing `validateProfile()` for config UIs and
  imports; a guideline-based ESPGHAN 2018 reference profile (source-traceable, not center-validated).
- **Mobile app (Expo)** — accept-once disclaimer gate, validated patient input, a result screen with
  hard/soft warnings and provenance, accessibility support, and jest-expo integration/render tests.
- **Profile management UI** — profile selection, a full editor with live validation, JSON
  import/export, and unit-system-aware labels (kcal/kJ, mmol/mEq).
- **Tooling** — CI (lint + typecheck + build + coverage), Biome, and community-health files
  (CONTRIBUTING, SECURITY, CODE_OF_CONDUCT, CITATION, issue/PR templates).

### Notes

- Clinical decision-support tool, **not a medical device**. The ordering clinician is solely
  responsible; verify every result independently. See [`DISCLAIMER.md`](./DISCLAIMER.md).
- The shipped ESPGHAN 2018 profile is **guideline-based, not center-validated** — each center must
  supply and validate its own numbers.

[0.1.0]: https://github.com/sahinparlak/tpn-calculator/releases/tag/v0.1.0
