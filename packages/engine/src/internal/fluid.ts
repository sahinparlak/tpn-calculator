import type { ComponentResult, FluidStep, PatientInput, TPNProfile } from '../types.js';
import { TPNInputError } from './validate.js';

export interface FluidComputation {
  /** Delivered fluid in ml/kg/day after adjustments and any restriction */
  prescribedMlPerKg: number;
  totalVolumeMl: number;
  result: ComponentResult;
}

/** Finds the schedule step covering `day` (`dayTo: null` means open-ended). */
function findStep(schedule: FluidStep[], day: number): FluidStep | undefined {
  return schedule.find((step) => day >= step.dayFrom && (step.dayTo === null || day <= step.dayTo));
}

/**
 * Total fluid volume: the age-based ml/kg from the schedule, plus phototherapy
 * and radiant-warmer adjustments, scaled by any ordered restriction, times
 * weight. Lipid is part of this budget; it is treated as a separate emulsion in
 * the downstream volume balance, not added on top.
 */
export function computeFluid(patient: PatientInput, profile: TPNProfile): FluidComputation {
  const step = findStep(profile.fluid.schedulePerKg, patient.ageDays);
  if (!step) {
    throw new TPNInputError(`No fluid schedule step covers day ${patient.ageDays}.`);
  }

  const adjustmentsMlPerKg =
    (patient.phototherapy ? profile.fluid.phototherapyAdjMlPerKg : 0) +
    (patient.radiantWarmer ? profile.fluid.radiantWarmerAdjMlPerKg : 0);

  const targetMlPerKg = step.mlPerKg + adjustmentsMlPerKg;
  const restrictionFactor = (patient.fluidRestrictionPct ?? 100) / 100;
  const prescribedMlPerKg = targetMlPerKg * restrictionFactor;
  const totalVolumeMl = prescribedMlPerKg * patient.weightKg;

  return {
    prescribedMlPerKg,
    totalVolumeMl,
    result: {
      label: 'Total fluid',
      volumeMl: totalVolumeMl,
      detail: {
        scheduledMlPerKg: step.mlPerKg,
        adjustmentsMlPerKg,
        prescribedMlPerKg,
      },
    },
  };
}
