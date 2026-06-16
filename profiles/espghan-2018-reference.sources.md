# Provenance — `espghan-2018-reference.json`

Source for every value in the reference profile. Because JSON cannot hold
comments, citations live here. Clinical **dosing** is traceable to the
ESPGHAN/ESPEN/ESPR/CSPEN 2018 guidelines (recommendation numbers `R x.x`).
Values marked **representative** are not specified as a single number by the
guidelines — they are physicochemical approximations, product/pharmacy facts, or
conventions, and a center must replace and validate them.

> ⚠️ Guideline-derived **reference**, not a center-validated protocol.
> Not for clinical use as-is. See [`../DISCLAIMER.md`](../DISCLAIMER.md).

## Dosing — guideline-traceable

| Field | Value | Source |
|---|---|---|
| `glucose.girStart` / `girAdvance` / `girMax` | 4 / 2 / 12 mg/kg/min | Carbohydrates (Mesotten 2018) **R 5.4** (preterm: start 4–8, target 8–10, max 12) |
| `aminoAcid.doseStart` | 1.5 g/kg/day | Amino acids (van Goudoever 2018) **R 3.1** (≥1.5 from day 1) |
| `aminoAcid.doseAdvance` / `doseMax` | 1.0 / 3.5 | **R 3.2** (day 2+ 2.5–3.5), **R 3.3** (>3.5 trials only) |
| `lipid.doseStart` / `doseAdvance` / `doseMax` | 1.0 / 1.0 / 4.0 g/kg/day | Lipids (Lapillonne 2018) **R 4.2** (start by day 2), **R 4.3** (≤4) |
| `fluid.schedulePerKg` | 70→90→110→130→150→150 ml/kg/day | Fluid & electrolytes (Jochum 2018) Table 1 + Table 3, preterm >1500 g |
| `energy.targetKcalPerKg` | 90–120 kcal/kg/day | Energy (Joosten 2018) **R 2.6** (VLBW growth) |
| `electrolytes.sodium/potassium/chloride` | Na 3 / K 2 / Cl 3 mmol/kg/day | Fluid & electrolytes (Jochum 2018) Table 3, preterm >1500 g (Na 2–3, K 1–3, Cl 3–5) |
| `electrolytes.calcium/phosphate/magnesium` | Ca 1.6 / P 1.6 / Mg 0.2 mmol/kg/day | Ca, P & Mg (Mihatsch 2018) **R 8.9** Table 1 (growing premature); molar Ca:P = 1.0 (**R 8.12**: early 0.8–1.0) |

## Energy density (`energy.kcalPerGram`)

| Field | Value | Source |
|---|---|---|
| `carbohydrate` | 3.75 kcal/g | Energy chapter: glucose 3.75 kcal/g (anhydrous — engine derives glucose grams from GIR) |
| `protein` | 4 kcal/g | Atwater (Energy chapter: 4 kcal/g frequently used) |
| `fat` | 10 kcal/g | Energy chapter: ILE ~10 kcal/g (20% emulsion = 2.0 kcal/mL) |

## Representative — replace and validate per center

| Field | Value | Why representative |
|---|---|---|
| `glucose.maxConcPeripheral` / `maxConcCentral` | 12.5 / 25 % | Conventions; ASPEN's primary peripheral limit is osmolarity, not dextrose % |
| `glucose.stockConcentrations` | 5/10/20/30/50 % | Pharmacy stock list |
| `aminoAcid.product` / `lipid.product` | 10% AA / 20% emulsion | Product facts |
| `electrolytes.*.stockConcentration` | units/mL | Pharmacy product concentrations (e.g. Ca gluconate 10% ≈ 0.225 mmol/mL) |
| `additives.*` | trace/vitamins 1 ml/kg, heparin off | Product-dependent (ml/kg model) |
| `osmolarity.*` | dextrose 5, AA 10, ions ~1 | Physicochemical approximation; pharmacy validates (dextrose 5 mOsm/g per ASPEN/MW) |
| `osmolarity.peripheralMaxMOsmPerL` | 900 mOsm/L | A.S.P.E.N.: peripheral PN ≤ 900 mOsm/L |
| `caPhosphate.maxSolubilityProduct` | 200 | **No guideline number** — pharmacy compatibility (Mihatsch 2018 R 8.7); see BACKLOG A.1 |
| `fluid.phototherapyAdjMlPerKg` / `radiantWarmerAdjMlPerKg` | 15 / 15 ml/kg | Guideline gives +10–20% (percentage); unit mismatch tracked in BACKLOG A.1 |
| `fluid.maxVolumePerKg` | 180 ml/kg | Representative upper bound |

See [`../docs/REFERENCES.md`](../docs/REFERENCES.md) for full citations and links.
