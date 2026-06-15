/**
 * @tpn/engine — Domain model (Phase 0 design lock)
 *
 * RULE: This file — and the entire engine — contains NO clinical constants.
 * All doses, limits, products and units come from the `TPNProfile`.
 */

// ---------------------------------------------------------------------------
// Units and shared types
// ---------------------------------------------------------------------------

export type EnergyUnit = 'kcal' | 'kJ';
export type ElectrolyteUnit = 'mmol' | 'mEq';
export type AgeBasis = 'dayOfLife' | 'postmenstrualAge';
export type LineType = 'peripheral' | 'central';

/** hard = block when the limit is exceeded, soft = warn only */
export type SafetyLevel = 'hard' | 'soft';

export interface Range {
  min: number;
  max: number;
}

// ---------------------------------------------------------------------------
// Profile (center-specific configuration) — the engine's clinical data source
// ---------------------------------------------------------------------------

export interface ProfileMeta {
  /** Center / protocol name */
  name: string;
  /** Semantic version, e.g. "1.0.0" */
  version: string;
  /** BCP-47 language tag, e.g. "en" */
  locale: string;
  /** Date of last clinical review (ISO 8601) */
  lastReviewed: string;
  /** Clinician responsible for the review */
  reviewedBy: string;
  description?: string;
}

export interface UnitConfig {
  energy: EnergyUnit;
  electrolyte: ElectrolyteUnit;
}

export interface PatientModelConfig {
  ageBasis: AgeBasis;
  usesGestationalAge: boolean;
}

/** Age-based fluid step. `dayTo: null` => that day and onward */
export interface FluidStep {
  dayFrom: number;
  dayTo: number | null;
  mlPerKg: number;
}

export interface FluidConfig {
  schedulePerKg: FluidStep[];
  phototherapyAdjMlPerKg: number;
  radiantWarmerAdjMlPerKg: number;
  maxVolumePerKg: number;
}

/**
 * Energy density of each macronutrient. These are reference/product-dependent
 * (e.g. dextrose monohydrate vs anhydrous; the glycerol load of a lipid
 * emulsion), so — like every other clinical value — they live in the profile
 * rather than being hardcoded in the engine.
 */
export interface EnergyFactors {
  /** kcal per gram of carbohydrate (dextrose) */
  carbohydrate: number;
  /** kcal per gram of amino acid (protein) */
  protein: number;
  /** kcal per gram of lipid */
  fat: number;
}

export interface EnergyConfig {
  targetKcalPerKg: Range;
  kcalPerGram: EnergyFactors;
}

export interface GlucoseConfig {
  /** mg/kg/min */
  girStart: number;
  girAdvance: number;
  girMax: number;
  /** Maximum allowed dextrose percentage for a peripheral line */
  maxConcPeripheral: number;
  /** Maximum allowed dextrose percentage for a central line */
  maxConcCentral: number;
  /** Dextrose stock concentrations available at the center (%) */
  stockConcentrations: number[];
}

export interface MacronutrientProduct {
  name: string;
  concentrationPct: number;
}

export interface MacronutrientConfig {
  product: MacronutrientProduct;
  /** g/kg/day */
  doseStart: number;
  doseAdvance: number;
  doseMax: number;
}

export interface ElectrolyteEntry {
  /** Dose in profile.units.electrolyte units, per kg/day */
  dosePerKg: number;
  /** Concentration of the stock solution used (units/mL) */
  stockConcentration: number;
}

export interface ElectrolyteConfig {
  sodium: ElectrolyteEntry;
  potassium: ElectrolyteEntry;
  calcium: ElectrolyteEntry;
  magnesium: ElectrolyteEntry;
  phosphate: ElectrolyteEntry;
  chloride: ElectrolyteEntry;
}

export interface AdditiveEntry {
  enabled: boolean;
  dosePerKg: number;
}

export interface AdditivesConfig {
  traceElements: AdditiveEntry;
  vitamins: AdditiveEntry;
  heparin: AdditiveEntry;
}

/**
 * Coefficients for the osmolarity estimate. Osmolarity is modeled as a linear
 * sum: each component contributes `amount × coefficient`, and the total is
 * divided by the aqueous admixture volume. The coefficients themselves depend
 * on the products and reference formula a center uses, so they come from the
 * profile; the engine only owns the linear structure.
 */
export interface OsmolarityElectrolyteCoefficients {
  /** mOsm per profile electrolyte unit (mmol or mEq, per `units.electrolyte`) */
  sodium: number;
  potassium: number;
  calcium: number;
  magnesium: number;
  phosphate: number;
  chloride: number;
}

export interface OsmolarityConfig {
  /** mOsm contributed per gram of dextrose */
  dextroseMOsmPerGram: number;
  /** mOsm contributed per gram of amino acid */
  aminoAcidMOsmPerGram: number;
  /** mOsm contributed per electrolyte unit, per ion */
  electrolyteMOsmPerUnit: OsmolarityElectrolyteCoefficients;
  /** Upper osmolarity limit for a peripheral line (mOsm/L) */
  peripheralMaxMOsmPerL: number;
}

/**
 * Calcium–phosphate precipitation model. Phase 1 uses the simple solubility
 * product (Ca concentration × P concentration in the final admixture). This is
 * an approximation — true compatibility depends on the amino-acid product, pH,
 * temperature and order of mixing — so the threshold is a center value.
 */
export interface CaPhosphateConfig {
  /**
   * Maximum tolerated Ca × P product. Units follow the center's model
   * (e.g. (mmol/L)² when `units.electrolyte` is mmol).
   */
  maxSolubilityProduct: number;
}

export interface SafetyRule {
  id: string;
  level: SafetyLevel;
  /** Reference to a profile value, e.g. "glucose.girMax" */
  ref?: string;
  /** Fixed threshold (when there is no ref) */
  threshold?: number;
  message?: string;
}

export interface SafetyConfig {
  defaultLine: LineType;
  rules: SafetyRule[];
}

export interface TPNProfile {
  meta: ProfileMeta;
  units: UnitConfig;
  patient: PatientModelConfig;
  fluid: FluidConfig;
  energy: EnergyConfig;
  glucose: GlucoseConfig;
  aminoAcid: MacronutrientConfig;
  lipid: MacronutrientConfig;
  electrolytes: ElectrolyteConfig;
  additives: AdditivesConfig;
  osmolarity: OsmolarityConfig;
  caPhosphate: CaPhosphateConfig;
  safety: SafetyConfig;
}

// ---------------------------------------------------------------------------
// Patient input
// ---------------------------------------------------------------------------

export interface PatientInput {
  weightKg: number;
  /** Postnatal day (interpreted per ageBasis) */
  ageDays: number;
  gestationalAgeWeeks?: number;
  line: LineType;
  phototherapy?: boolean;
  radiantWarmer?: boolean;
  /** Ordered fluid restriction (percentage of the total target, 0-100) */
  fluidRestrictionPct?: number;
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

export interface ComponentResult {
  label: string;
  volumeMl: number;
  detail?: Record<string, number | string>;
}

export interface Warning {
  ruleId: string;
  level: SafetyLevel;
  message: string;
}

export interface EnergyResult {
  totalKcal: number;
  kcalPerKg: number;
  distribution: {
    carbsPct: number;
    proteinPct: number;
    fatPct: number;
  };
}

/** Cross-cutting derived totals, exposed for transparency and the safety layer. */
export interface DerivedTotals {
  /** Delivered fluid in ml/kg/day after adjustments and any restriction */
  prescribedMlPerKg: number;
  /** Aqueous admixture volume (total minus lipid emulsion), ml */
  aqueousVolumeMl: number;
  /** Lipid emulsion volume, ml */
  lipidVolumeMl: number;
  /** Water available to carry dextrose (aqueous minus other aqueous additions), ml */
  dextroseWaterMl: number;
  /** Calcium × phosphate solubility product in the final admixture */
  caPhosphateProduct: number;
}

export interface TPNResult {
  totalVolumeMl: number;
  fluid: ComponentResult;
  glucose: ComponentResult & { gir: number; finalConcentrationPct: number };
  aminoAcid: ComponentResult & { gPerKg: number };
  lipid: ComponentResult & { gPerKg: number };
  electrolytes: ComponentResult[];
  additives: ComponentResult[];
  energy: EnergyResult;
  osmolarityMOsmPerL: number;
  derived: DerivedTotals;
  warnings: Warning[];
}
