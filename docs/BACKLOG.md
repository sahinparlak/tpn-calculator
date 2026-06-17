# Project Backlog — Professional & Safety Hardening

Gaps to close on the way to an "extremely professional", clinically credible
release. Grouped by priority. Items here feed the roadmap in [`PLAN.md`](./PLAN.md).

## A. Clinical safety & validation — highest priority

- [x] **Clinical validation dataset.** Source-traceable regression tests added in
      `test/espghan-reference.test.ts` (dosing trajectory by day of life, energy
      target, line safety) against the ESPGHAN 2018 reference profile.
- [x] **A filled reference profile.** Guideline-derived reference done:
      `profiles/espghan-2018-reference.json` (+ `test/fixtures/espghan-reference.profile.ts`).
      A **center-validated** profile (e.g. a real Erciyes NICU protocol) is still pending.
- [ ] **Surface modeling caveats** for clinician review: Ca–P solubility-product is
      an approximation (not a curve), additive dose modeled as ml/kg, lipid drawn
      separately from the volume budget. Documented in `PLAN.md`/`PROFILE.md`; make
      them easy to find from output/README.
- [x] **Cite the scientific basis** of the formulas and default reference values:
      `docs/REFERENCES.md` + `profiles/espghan-2018-reference.sources.md`.

### A.1 Engine/schema modeling gaps (surfaced while sourcing ESPGHAN 2018)

- [ ] **Phototherapy / radiant-warmer adjustment unit mismatch.** ESPGHAN expresses
      phototherapy as a **percentage** increase (+10–20%), but the schema field
      `fluid.phototherapyAdjMlPerKg` (and the radiant-warmer field) is an **absolute
      ml/kg** value. Either convert per profile, or make the field percentage-based.
- [ ] **Fluid schedule has no weight-band dimension.** ESPGHAN fluid intake varies
      by birth-weight band (term / >1500 g / 1000–1500 g / <1000 g); the schema's
      `fluid.schedulePerKg` is keyed on day of life only. The reference profile fixes
      one band (preterm >1500 g); a future schema may need a weight-band axis.
- [ ] **Ca–P safety model vs guideline.** The engine models Ca–P risk as a
      solubility product (Ca×P > threshold), but ESPGHAN (Mihatsch 2018) expresses it
      as a molar **Ca:P ratio** (0.8–1.0 early, ~1.3 stable growth) plus
      pharmacy-tested physical compatibility (R 8.7) — it gives **no numeric product
      threshold**. Consider adding a molar Ca:P-ratio safety rule (guideline-traceable)
      and keep `caPhosphate.maxSolubilityProduct` as a pharmacy/product value.
      Note: the mobile app now labels this output "Ca × P **solubility product**" with
      its `(mmol/L)²` unit and a "simplified estimate" caveat, to prevent it being read
      against the familiar mg²/dL² (~<200) precipitation threshold.
- [ ] **Final-dextrose concentration basis.** `glucose.finalConcentrationPct` is
      computed over the **dextrose-water (aqueous) phase only** — `glucoseGrams /
      dextroseWaterMl` (`calculate.ts:51`, `glucose.volumeMl === dextroseWaterMl` at
      `calculate.ts:91`), not over total or aqueous-minus-additives volume. Decide and
      document the intended basis (peripheral tolerance is usually judged on the final
      in-line concentration the vein sees). The mobile app now labels it "Final dextrose
      **(aqueous phase)**" to make the current basis explicit pending this decision.

## B. Engineering maturity / OSS showcase

- [ ] Test **coverage** measurement + README badge (prestige criterion in `PLAN.md`,
      currently unmeasured).
- [ ] **Linter + formatter** (ESLint + Prettier, or Biome) — none configured yet.
- [ ] **CI hardening:** add lint + coverage steps; consider a Node version matrix.
- [ ] **Release process:** semantic versioning, `CHANGELOG.md`, git tags, and
      publishing `@tpn/engine` to npm (currently `0.0.0`, no releases).

## C. Community / professional infrastructure

- [ ] `CONTRIBUTING.md`
- [ ] `SECURITY.md` (responsible-disclosure / vulnerability reporting)
- [ ] `CODE_OF_CONDUCT.md`
- [ ] Issue templates + pull-request template (`.github/`)
- [ ] `CITATION.cff` — enables academic citation; high value for a clinician-authored tool
- [ ] `.github/dependabot.yml` — dependency update automation

## D. Product (already on the roadmap)

- [ ] Mobile MVP (Expo) — Phase 2
- [ ] Web app + live demo — Phase 4
- [ ] README: live-demo link + screenshot/GIF once an app exists
