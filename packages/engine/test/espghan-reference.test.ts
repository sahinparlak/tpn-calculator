import { describe, expect, it } from 'vitest';
import { calculateTPN } from '../src/index.js';
import type { PatientInput } from '../src/index.js';
import { espghanReferenceProfile as profile } from './fixtures/espghan-reference.profile.js';

/**
 * Clinical validation against the ESPGHAN/ESPEN/ESPR/CSPEN 2018 reference profile.
 *
 * The engine, fed guideline-derived dosing, must reproduce the guideline dosing
 * trajectory and stay within guideline targets. Rate/concentration outputs are
 * weight-independent in this model, so a single weight exercises every case.
 */
const ids = (warnings: { ruleId: string }[]): string[] => warnings.map((w) => w.ruleId);

describe('ESPGHAN reference — dosing trajectory by day of life', () => {
  // Expected per-day dosing, traceable to:
  //   GIR    → Carbohydrates R 5.4 (start 4, advance to target, max 12 mg/kg/min)
  //   aa     → Amino acids R 3.1/R 3.2 (start 1.5, to 2.5–3.5 g/kg/day, max 3.5)
  //   lipid  → Lipids R 4.2/R 4.3 (start 1, to max 4 g/kg/day)
  //   fluid  → Fluid & electrolytes Table 1, preterm >1500 g (ml/kg/day)
  const trajectory = [
    { day: 1, gir: 4, aa: 1.5, lipid: 1, fluidMlPerKg: 70 },
    { day: 2, gir: 6, aa: 2.5, lipid: 2, fluidMlPerKg: 90 },
    { day: 3, gir: 8, aa: 3.5, lipid: 3, fluidMlPerKg: 110 },
    { day: 4, gir: 10, aa: 3.5, lipid: 4, fluidMlPerKg: 130 },
    { day: 5, gir: 12, aa: 3.5, lipid: 4, fluidMlPerKg: 150 },
    { day: 6, gir: 12, aa: 3.5, lipid: 4, fluidMlPerKg: 150 },
  ] as const;

  it.each(trajectory)('day $day → GIR $gir, AA $aa g/kg, lipid $lipid g/kg, fluid $fluidMlPerKg ml/kg', ({
    day,
    gir,
    aa,
    lipid,
    fluidMlPerKg,
  }) => {
    const patient: PatientInput = { weightKg: 1.8, ageDays: day, line: 'central' };
    const r = calculateTPN(patient, profile);
    expect(r.glucose.gir).toBe(gir);
    expect(r.aminoAcid.gPerKg).toBe(aa);
    expect(r.lipid.gPerKg).toBe(lipid);
    expect(r.derived.prescribedMlPerKg).toBe(fluidMlPerKg);
  });
});

describe('ESPGHAN reference — guideline-derived doses meet the guideline energy target', () => {
  it('a stable (day 7) prescription lands inside the 90–120 kcal/kg target (Energy R 2.6)', () => {
    const patient: PatientInput = { weightKg: 1.8, ageDays: 7, line: 'central' };
    const r = calculateTPN(patient, profile);
    // carb 17.28×3.75 + protein 3.5×4 + fat 4×10 = 118.8 kcal/kg
    expect(r.energy.kcalPerKg).toBeCloseTo(118.8, 1);
    expect(r.energy.kcalPerKg).toBeGreaterThanOrEqual(profile.energy.targetKcalPerKg.min);
    expect(r.energy.kcalPerKg).toBeLessThanOrEqual(profile.energy.targetKcalPerKg.max);
  });
});

describe('ESPGHAN reference — line safety', () => {
  // A full preterm TPN (day 5) is appropriate centrally but must NOT go peripheral.
  const day5 = { weightKg: 1.8, ageDays: 5 } as const;

  it('central line: full day-5 prescription raises no warnings', () => {
    const r = calculateTPN({ ...day5, line: 'central' }, profile);
    expect(r.warnings).toEqual([]);
  });

  it('peripheral line: same prescription is blocked (osmolarity >900 and dextrose >12.5%)', () => {
    const r = calculateTPN({ ...day5, line: 'peripheral' }, profile);
    expect(r.osmolarityMOsmPerL).toBeGreaterThan(900);
    expect(r.glucose.finalConcentrationPct).toBeGreaterThan(profile.glucose.maxConcPeripheral);
    expect(ids(r.warnings)).toEqual(expect.arrayContaining(['osmolarity-peripheral', 'dextrose-peripheral-max']));
    expect(r.warnings.every((w) => w.level === 'hard')).toBe(true);
  });
});
