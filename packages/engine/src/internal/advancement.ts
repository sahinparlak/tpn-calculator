/**
 * Daily-advancement schedule shared by GIR and macronutrient dosing.
 *
 * The protocol *pattern* is universal — start on day 1, add `advance` for each
 * subsequent day, and never exceed `max`. The numbers (start, advance, max) all
 * come from the profile; only the shape of the schedule lives here.
 *
 * @param day Day of life (or post-menstrual day, per `profile.patient.ageBasis`).
 *            Day 1 yields `start`; day < 1 is clamped to `start`.
 */
export function advanceValue(start: number, advance: number, max: number, day: number): number {
  const daysAdvanced = Math.max(0, day - 1);
  return Math.min(start + advance * daysAdvanced, max);
}
