# Project Backlog — Professional & Safety Hardening

Gaps to close on the way to an "extremely professional", clinically credible
release. Grouped by priority. Items here feed the roadmap in [`PLAN.md`](./PLAN.md).

## A. Clinical safety & validation — highest priority

- [ ] **Clinical validation dataset.** Reference cases with **source-traceable**
      expected outputs, run as regression tests. The current suite tests against a
      *synthetic* profile only (`test/fixtures/synthetic.profile.ts`), not against
      clinically known-correct cases. This is the single biggest blocker to
      "ready". (Promised in `PLAN.md` §5.)
- [ ] **One filled, clinically-reviewed profile** (e.g. Erciyes NICU) so the tool's
      real output is demonstrable — today only the blank template exists.
- [ ] **Surface modeling caveats** for clinician review: Ca–P solubility-product is
      an approximation (not a curve), additive dose modeled as ml/kg, lipid drawn
      separately from the volume budget. Documented in `PLAN.md`/`PROFILE.md`; make
      them easy to find from output/README.
- [ ] **Cite the scientific basis** of the formulas and default reference values
      (see "Scientific sources" decision once finalized).

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
