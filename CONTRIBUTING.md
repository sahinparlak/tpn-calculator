# Contributing

Thanks for your interest in improving the TPN Calculator. This is an open-source
**clinical decision-support tool** — contributions are welcome, with the safety
bar that a medical tool deserves.

## Ground rules

- **No clinical value is hardcoded.** The engine contains only universal formulas;
  every dose, limit, product and unit lives in a center profile. Do not add
  clinical constants to `packages/engine/src`.
- **Clinical values must be source-traceable.** Any number that goes into a
  profile (or a reference profile) must cite its source — see
  [`docs/REFERENCES.md`](docs/REFERENCES.md) and
  [`profiles/espghan-2018-reference.sources.md`](profiles/espghan-2018-reference.sources.md).
- **The engine is safety-critical.** Changes to calculation logic need tests, and
  coverage must stay above the configured thresholds.

## Getting started

```bash
npm install        # Node >= 20
npm run lint       # Biome (lint + format check)
npm run format     # auto-fix formatting
npm run typecheck
npm run build
npm test           # or: npm run test:coverage
```

## Pull requests

1. Branch from `main`.
2. Keep changes focused; match the surrounding code style (Biome enforces it).
3. Add or update tests for any behavior change.
4. Make sure `npm run lint`, `npm run typecheck`, `npm run build` and
   `npm run test:coverage` all pass — CI runs the same.
5. Open the PR using the template and describe the clinical/technical rationale.

## Reporting issues

Use the issue templates. For anything that looks like an **incorrect clinical
calculation**, please follow [`SECURITY.md`](SECURITY.md) instead of opening a
public issue.

By contributing you agree your work is licensed under the project's
[MIT License](LICENSE).
