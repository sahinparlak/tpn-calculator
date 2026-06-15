# Profile Authoring Guide

A profile holds **all the clinical values** the engine uses. The engine assumes
no dose, limit or unit; everything comes from here. Therefore the correctness of
a profile directly determines the correctness of the output.

> **Responsibility:** Every value in a profile must be entered from your
> center's **approved protocol or a trusted clinical source**. See
> [`../DISCLAIMER.md`](../DISCLAIMER.md).

## Getting started

1. Copy [`../profiles/erciyes-nicu.template.json`](../profiles/erciyes-nicu.template.json)
   and rename it for your center.
2. Fill in every clinical value that is `null` and every text marked `FILL_ME`.
3. After filling in, **delete** the helper `_note` and `_help` keys (the schema
   does not allow them; validation only passes once they are removed).
4. Validate against the [JSON Schema](../profiles/schema/profile.schema.json).

## Fields

| Section | Field | Meaning | Unit |
|---|---|---|---|
| `meta` | `name`, `version`, `locale`, `lastReviewed`, `reviewedBy` | Identity and traceability | — |
| `units` | `energy` | Energy unit | `kcal` / `kJ` |
| `units` | `electrolyte` | Electrolyte unit | `mmol` / `mEq` |
| `patient` | `ageBasis` | Age basis | `dayOfLife` / `postmenstrualAge` |
| `fluid` | `schedulePerKg` | Fluid by age | ml/kg/day |
| `fluid` | `phototherapyAdjMlPerKg`, `radiantWarmerAdjMlPerKg` | Adjustments | ml/kg/day |
| `fluid` | `maxVolumePerKg` | Upper limit | ml/kg/day |
| `energy` | `targetKcalPerKg` | Target calorie range | kcal/kg/day |
| `energy` | `kcalPerGram` | Energy density: carbohydrate / protein / fat | kcal/g |
| `glucose` | `girStart` / `girAdvance` / `girMax` | GIR schedule | mg/kg/min |
| `glucose` | `maxConcPeripheral` / `maxConcCentral` | Max dextrose | % |
| `glucose` | `stockConcentrations` | Available stocks | % (list) |
| `aminoAcid`, `lipid` | `product` | Product name + concentration | % |
| `aminoAcid`, `lipid` | `doseStart` / `doseAdvance` / `doseMax` | Dose schedule | g/kg/day |
| `electrolytes.*` | `dosePerKg` | Daily dose | `units.electrolyte`/kg/day |
| `electrolytes.*` | `stockConcentration` | Stock solution | units/mL |
| `additives.*` | `enabled`, `dosePerKg` | Additives (dose modeled as ml/kg/day) | ml/kg/day |
| `osmolarity` | `dextroseMOsmPerGram`, `aminoAcidMOsmPerGram` | Osmolarity coefficients | mOsm/g |
| `osmolarity` | `electrolyteMOsmPerUnit.*` | Per-ion coefficient | mOsm per electrolyte unit |
| `osmolarity` | `peripheralMaxMOsmPerL` | Peripheral-line upper limit | mOsm/L |
| `caPhosphate` | `maxSolubilityProduct` | Max tolerated Ca × P product | (e.g. (mmol/L)²) |
| `safety.defaultLine` | — | Default line | `peripheral` / `central` |
| `safety.rules` | `level` | `hard` blocks, `soft` warns | — |

## Safety rules

Each rule either **references** a profile value
(`"ref": "glucose.girMax"`) or carries a fixed **threshold**
(`"threshold": 900`). `level`:

- `hard` — if the limit is exceeded, the result is **blocked / red warning**.
- `soft` — only a **warning** is shown.

Which rules are hard or soft is entirely the center's choice.

## Osmolarity and Ca–P models

Osmolarity is estimated as a **linear sum** over the aqueous admixture: each
component contributes `amount × coefficient`, divided by the volume in litres.
The coefficients depend on your products and chosen reference formula, so they
live in the profile. The calcium–phosphate check uses the **simple solubility
product** (Ca × P concentrations) against `caPhosphate.maxSolubilityProduct` —
an approximation only; true compatibility depends on the amino-acid product, pH,
temperature and mixing order. Set both from your center's source.
