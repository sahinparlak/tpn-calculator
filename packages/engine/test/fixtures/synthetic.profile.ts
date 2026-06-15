import type { TPNProfile } from '../../src/index.js';

/**
 * ⚠️  SYNTHETIC TEST PROFILE — NOT FOR CLINICAL USE.
 *
 * Every number below is arbitrary and chosen only to make the engine's
 * arithmetic easy to verify by hand. None of it represents a real protocol,
 * dose, limit, or recommendation. Real profiles come from a center's approved
 * source (see profiles/erciyes-nicu.template.json and docs/PROFILE.md).
 */
export const syntheticProfile: TPNProfile = {
  meta: {
    name: 'SYNTHETIC TEST — not clinical',
    version: '0.0.0',
    locale: 'en',
    lastReviewed: '2026-01-01',
    reviewedBy: 'test-suite',
    description: 'Arbitrary numbers to exercise the engine arithmetic.',
  },
  units: { energy: 'kcal', electrolyte: 'mmol' },
  patient: { ageBasis: 'dayOfLife', usesGestationalAge: true },
  fluid: {
    schedulePerKg: [
      { dayFrom: 1, dayTo: 1, mlPerKg: 100 },
      { dayFrom: 2, dayTo: 2, mlPerKg: 120 },
      { dayFrom: 3, dayTo: null, mlPerKg: 150 },
    ],
    phototherapyAdjMlPerKg: 10,
    radiantWarmerAdjMlPerKg: 20,
    maxVolumePerKg: 170,
  },
  energy: {
    targetKcalPerKg: { min: 90, max: 120 },
    kcalPerGram: { carbohydrate: 4, protein: 4, fat: 9 },
  },
  glucose: {
    girStart: 4,
    girAdvance: 1,
    girMax: 12,
    maxConcPeripheral: 12.5,
    maxConcCentral: 25,
    stockConcentrations: [5, 10, 50],
  },
  aminoAcid: {
    product: { name: 'TestAA 10%', concentrationPct: 10 },
    doseStart: 1,
    doseAdvance: 0.5,
    doseMax: 3.5,
  },
  lipid: {
    product: { name: 'TestLipid 20%', concentrationPct: 20 },
    doseStart: 1,
    doseAdvance: 0.5,
    doseMax: 3,
  },
  electrolytes: {
    sodium: { dosePerKg: 3, stockConcentration: 3 },
    potassium: { dosePerKg: 2, stockConcentration: 2 },
    calcium: { dosePerKg: 1, stockConcentration: 0.5 },
    magnesium: { dosePerKg: 0.2, stockConcentration: 0.5 },
    phosphate: { dosePerKg: 1, stockConcentration: 0.5 },
    chloride: { dosePerKg: 3, stockConcentration: 3 },
  },
  additives: {
    traceElements: { enabled: true, dosePerKg: 0.5 },
    vitamins: { enabled: true, dosePerKg: 1 },
    heparin: { enabled: false, dosePerKg: 0 },
  },
  osmolarity: {
    dextroseMOsmPerGram: 5,
    aminoAcidMOsmPerGram: 8,
    electrolyteMOsmPerUnit: {
      sodium: 2,
      potassium: 2,
      calcium: 1,
      magnesium: 1,
      phosphate: 1,
      chloride: 1,
    },
    peripheralMaxMOsmPerL: 900,
  },
  caPhosphate: { maxSolubilityProduct: 200 },
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

/** Deep clone so a test can mutate one field without affecting others. */
export function cloneProfile(): TPNProfile {
  return structuredClone(syntheticProfile);
}
