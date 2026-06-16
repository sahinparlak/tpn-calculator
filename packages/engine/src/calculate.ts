import type { PatientInput, TPNProfile, TPNResult } from './types.js';
import { assertProfileFilled, assertValidPatient } from './internal/validate.js';
import { computeFluid } from './internal/fluid.js';
import { computeMacronutrient } from './internal/macronutrients.js';
import { computeGir, dextroseConcentrationPct, glucoseGramsPerDay } from './internal/glucose.js';
import { computeElectrolytes } from './internal/electrolytes.js';
import { computeAdditives } from './internal/additives.js';
import { computeEnergy } from './internal/energy.js';
import { computeOsmolarity } from './internal/osmolarity.js';
import { evaluateSafety } from './internal/safety.js';

/**
 * Calculates a TPN prescription for one patient under one center profile.
 *
 * Volume model: the fluid schedule sets the total daily volume. Lipid is a
 * separate emulsion drawn from that budget, leaving an **aqueous admixture**
 * (total − lipid). Amino acid, electrolytes and additives take their volumes
 * from the admixture; whatever water remains carries the dextrose, which fixes
 * the final dextrose concentration. Osmolarity is estimated over the admixture.
 *
 * Every threshold and dose comes from `profile`; the formulas here are
 * universal. The result is never blocked — hard violations are returned as
 * `warnings` with `level: 'hard'` for the caller to surface.
 *
 * @throws TPNInputError  when the patient input is invalid
 * @throws TPNProfileError when the profile still holds template placeholders
 */
export function calculateTPN(patient: PatientInput, profile: TPNProfile): TPNResult {
  assertValidPatient(patient);
  assertProfileFilled(profile);

  const { weightKg, ageDays } = patient;

  // Components
  const fluid = computeFluid(patient, profile);
  const aminoAcid = computeMacronutrient(profile.aminoAcid, weightKg, ageDays, 'Amino acid');
  const lipid = computeMacronutrient(profile.lipid, weightKg, ageDays, 'Lipid');
  const electrolytes = computeElectrolytes(profile.electrolytes, weightKg);
  const additives = computeAdditives(profile.additives, weightKg);

  const gir = computeGir(profile, ageDays);
  const glucoseGrams = glucoseGramsPerDay(gir, weightKg);

  // Volume balance
  const lipidVolumeMl = lipid.volumeMl;
  const aqueousVolumeMl = fluid.totalVolumeMl - lipidVolumeMl;
  const electrolyteVolumeMl = electrolytes.reduce((sum, e) => sum + e.volumeMl, 0);
  const additiveVolumeMl = additives.reduce((sum, a) => sum + a.volumeMl, 0);
  const dextroseWaterMl = aqueousVolumeMl - aminoAcid.volumeMl - electrolyteVolumeMl - additiveVolumeMl;

  const finalConcentrationPct = dextroseWaterMl > 0 ? dextroseConcentrationPct(glucoseGrams, dextroseWaterMl) : 0;

  // Osmolarity over the aqueous admixture
  const osmolarityMOsmPerL = computeOsmolarity(profile.osmolarity, {
    glucoseGrams,
    aminoAcidGrams: aminoAcid.grams,
    electrolytes: electrolytes.map((e) => ({ key: e.key, totalDose: e.totalDose })),
    aqueousVolumeMl,
  });

  // Calcium–phosphate solubility product, as concentrations in the admixture
  const totalDoseOf = (key: 'calcium' | 'phosphate'): number => electrolytes.find((e) => e.key === key)?.totalDose ?? 0;
  const aqueousLitres = aqueousVolumeMl / 1000;
  const caPhosphateProduct =
    aqueousLitres > 0 ? (totalDoseOf('calcium') / aqueousLitres) * (totalDoseOf('phosphate') / aqueousLitres) : 0;

  const energy = computeEnergy(
    profile.energy,
    { carbohydrate: glucoseGrams, protein: aminoAcid.grams, fat: lipid.grams },
    weightKg,
  );

  const warnings = evaluateSafety(
    {
      gir,
      finalDextroseConcentrationPct: finalConcentrationPct,
      osmolarityMOsmPerL,
      caPhosphateProduct,
      prescribedMlPerKg: fluid.prescribedMlPerKg,
      dextroseWaterMl,
    },
    patient,
    profile,
  );

  return {
    totalVolumeMl: fluid.totalVolumeMl,
    fluid: fluid.result,
    glucose: {
      label: 'Dextrose',
      volumeMl: dextroseWaterMl,
      gir,
      finalConcentrationPct,
      detail: { glucoseGrams },
    },
    aminoAcid: aminoAcid.result,
    lipid: lipid.result,
    electrolytes: electrolytes.map((e) => e.result),
    additives: additives.map((a) => a.result),
    energy,
    osmolarityMOsmPerL,
    derived: {
      prescribedMlPerKg: fluid.prescribedMlPerKg,
      aqueousVolumeMl,
      lipidVolumeMl,
      dextroseWaterMl,
      caPhosphateProduct,
    },
    warnings,
  };
}
