import type { TPNProfile } from '../../src/index.js';

/**
 * ESPGHAN 2018 REFERENCE PROFILE — preterm newborn (>1500 g), NICU.
 *
 * Clinical DOSING values are traceable to the ESPGHAN/ESPEN/ESPR/CSPEN 2018
 * guidelines (recommendation numbers cited inline; see
 * profiles/espghan-2018-reference.sources.md and docs/REFERENCES.md).
 *
 * Values that the guidelines do NOT specify as a single number are marked
 * `representative` — they are physicochemical approximations (osmolarity),
 * product/pharmacy facts (stock concentrations, products, additives), or
 * conventions (peripheral/central dextrose %). A real center MUST replace these
 * and validate the whole profile against its own approved source.
 *
 * ⚠️  This is a guideline-derived REFERENCE, not a center-validated protocol.
 *     Not for clinical use as-is. See DISCLAIMER.md.
 *
 * This fixture is the tested source of truth; profiles/espghan-2018-reference.json
 * mirrors it for distribution.
 */
export const espghanReferenceProfile: TPNProfile = {
  meta: {
    name: 'ESPGHAN 2018 Reference (preterm >1500 g)',
    version: '0.1.0',
    locale: 'en',
    lastReviewed: '2026-06-16',
    reviewedBy: 'Sahin Parlak (guideline-derived; not center-validated)',
    description: 'Preterm (>1500 g) NICU reference derived from ESPGHAN/ESPEN/ESPR/CSPEN 2018.',
  },
  units: { energy: 'kcal', electrolyte: 'mmol' },
  patient: { ageBasis: 'dayOfLife', usesGestationalAge: true },
  fluid: {
    // Fluid & electrolytes (Jochum 2018) Table 1, preterm >1500 g, ml/kg/day.
    schedulePerKg: [
      { dayFrom: 1, dayTo: 1, mlPerKg: 70 }, // D1 60–80
      { dayFrom: 2, dayTo: 2, mlPerKg: 90 }, // D2 80–100
      { dayFrom: 3, dayTo: 3, mlPerKg: 110 }, // D3 100–120
      { dayFrom: 4, dayTo: 4, mlPerKg: 130 }, // D4 120–140
      { dayFrom: 5, dayTo: 5, mlPerKg: 150 }, // D5 140–160
      { dayFrom: 6, dayTo: null, mlPerKg: 150 }, // stable (Table 3) 140–160
    ],
    phototherapyAdjMlPerKg: 15, // representative: guideline gives +10–20% (see BACKLOG A.1)
    radiantWarmerAdjMlPerKg: 15, // representative: insensible loss increase (see BACKLOG A.1)
    maxVolumePerKg: 180, // representative upper bound (phase II up to ~170)
  },
  energy: {
    targetKcalPerKg: { min: 90, max: 120 }, // Energy (Joosten 2018) R 2.6 (VLBW growth)
    kcalPerGram: {
      carbohydrate: 3.75, // Energy chapter: glucose 3.75 kcal/g (anhydrous, as GIR-derived)
      protein: 4, // Atwater (chapter notes 4 kcal/g frequently used)
      fat: 10, // Energy chapter: ILE energy ~10 kcal/g (20% emulsion = 2.0 kcal/mL)
    },
  },
  glucose: {
    girStart: 4, // Carbohydrates (Mesotten 2018) R 5.4 preterm start 4–8 mg/kg/min
    girAdvance: 2, // R 5.4 "increase gradually over 2–3 days to target 8–10"
    girMax: 12, // R 5.4 max 12 mg/kg/min
    maxConcPeripheral: 12.5, // representative convention (ASPEN's primary limit is osmolarity 900)
    maxConcCentral: 25, // representative convention
    stockConcentrations: [5, 10, 20, 30, 50], // representative pharmacy stocks (%)
  },
  aminoAcid: {
    product: { name: 'Pediatric amino acid 10% (representative)', concentrationPct: 10 },
    doseStart: 1.5, // Amino acids (van Goudoever 2018) R 3.1: ≥1.5 g/kg/day from day 1
    doseAdvance: 1.0, // R 3.2: day 2 onwards 2.5–3.5 g/kg/day
    doseMax: 3.5, // R 3.2 / R 3.3 (>3.5 only in trials)
  },
  lipid: {
    product: { name: 'Lipid emulsion 20% (representative)', concentrationPct: 20 },
    doseStart: 1.0, // Lipids (Lapillonne 2018) R 4.2: start by day 2 (2–3 g/kg/day acceptable day 1)
    doseAdvance: 1.0,
    doseMax: 4.0, // R 4.3: preterm/term ≤4 g/kg/day
  },
  electrolytes: {
    // Doses: preterm (Na/K/Cl: Jochum 2018 Table 3; Ca/P/Mg: Mihatsch 2018 Table 1, growing premature).
    // stockConcentration (units/mL): representative products — replace per pharmacy.
    sodium: { dosePerKg: 3, stockConcentration: 1.0 }, // Na 2–3 mmol/kg/d
    potassium: { dosePerKg: 2, stockConcentration: 1.0 }, // K 1–3 mmol/kg/d
    calcium: { dosePerKg: 1.6, stockConcentration: 0.225 }, // Ca 1.6–3.5; Ca gluconate 10% ≈ 0.225 mmol/mL
    magnesium: { dosePerKg: 0.2, stockConcentration: 0.5 }, // Mg 0.2–0.3 mmol/kg/d
    phosphate: { dosePerKg: 1.6, stockConcentration: 1.0 }, // P 1.6–3.5; molar Ca:P = 1.0 (R 8.12 early 0.8–1.0)
    chloride: { dosePerKg: 3, stockConcentration: 1.0 }, // Cl 3–5 mmol/kg/d
  },
  additives: {
    // Modeled as ml/kg/day (direct volume). Representative products — replace per center.
    traceElements: { enabled: true, dosePerKg: 1.0 },
    vitamins: { enabled: true, dosePerKg: 1.0 },
    heparin: { enabled: false, dosePerKg: 0 },
  },
  osmolarity: {
    // Linear estimate — approximation; pharmacy should validate (see types.ts, BACKLOG A).
    dextroseMOsmPerGram: 5.0, // ASPEN / MW-derived (1000/180 ≈ 5.5)
    aminoAcidMOsmPerGram: 10, // representative (product-dependent)
    electrolyteMOsmPerUnit: {
      sodium: 1,
      potassium: 1,
      calcium: 1,
      magnesium: 1,
      phosphate: 1,
      chloride: 1,
    }, // ~1 mOsm per mmol per ion (approximation)
    peripheralMaxMOsmPerL: 900, // ASPEN: peripheral PN ≤ 900 mOsm/L
  },
  caPhosphate: {
    maxSolubilityProduct: 200, // representative placeholder — no guideline number; pharmacy must set (BACKLOG A.1)
  },
  safety: {
    defaultLine: 'central',
    rules: [
      { id: 'gir-max', level: 'hard', ref: 'glucose.girMax', message: 'GIR upper limit exceeded.' },
      {
        id: 'dextrose-peripheral-max',
        level: 'hard',
        ref: 'glucose.maxConcPeripheral',
        message: 'Dextrose concentration too high for a peripheral line.',
      },
      {
        id: 'osmolarity-peripheral',
        level: 'hard',
        ref: 'osmolarity.peripheralMaxMOsmPerL',
        message: 'Osmolarity upper limit exceeded for a peripheral line.',
      },
      {
        id: 'ca-phosphate-precipitation',
        level: 'hard',
        ref: 'caPhosphate.maxSolubilityProduct',
        message: 'Calcium-phosphate precipitation risk.',
      },
      {
        id: 'volume-overflow',
        level: 'soft',
        ref: 'fluid.maxVolumePerKg',
        message: 'Total volume exceeds the upper limit.',
      },
    ],
  },
};
