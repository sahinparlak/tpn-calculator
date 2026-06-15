/**
 * @tpn/engine — Domain model (Faz 0 tasarım kilidi)
 *
 * KURAL: Bu dosyada ve tüm motorda HİÇBİR klinik sabit bulunmaz.
 * Tüm doz, limit, ürün ve birim bilgisi `TPNProfile` üzerinden gelir.
 */

// ---------------------------------------------------------------------------
// Birimler ve ortak tipler
// ---------------------------------------------------------------------------

export type EnergyUnit = 'kcal' | 'kJ';
export type ElectrolyteUnit = 'mmol' | 'mEq';
export type AgeBasis = 'dayOfLife' | 'postmenstrualAge';
export type LineType = 'peripheral' | 'central';

/** hard = sınır aşılırsa engelle, soft = yalnızca uyar */
export type SafetyLevel = 'hard' | 'soft';

export interface Range {
  min: number;
  max: number;
}

// ---------------------------------------------------------------------------
// Profil (merkeze özgü yapılandırma) — motorun klinik bilgi kaynağı
// ---------------------------------------------------------------------------

export interface ProfileMeta {
  /** Merkez/protokol adı */
  name: string;
  /** Semantik sürüm, ör. "1.0.0" */
  version: string;
  /** BCP-47 dil etiketi, ör. "tr-TR" */
  locale: string;
  /** Son klinik gözden geçirme tarihi (ISO 8601) */
  lastReviewed: string;
  /** Gözden geçirmeden sorumlu hekim */
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

/** Yaşa göre sıvı basamağı. `dayTo: null` => ve sonrası */
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

export interface EnergyConfig {
  targetKcalPerKg: Range;
}

export interface GlucoseConfig {
  /** mg/kg/dk */
  girStart: number;
  girAdvance: number;
  girMax: number;
  /** Periferik damar yolu için izin verilen maksimum dekstroz yüzdesi */
  maxConcPeripheral: number;
  /** Santral damar yolu için izin verilen maksimum dekstroz yüzdesi */
  maxConcCentral: number;
  /** Merkezde mevcut stok dekstroz konsantrasyonları (%) */
  stockConcentrations: number[];
}

export interface MacronutrientProduct {
  name: string;
  concentrationPct: number;
}

export interface MacronutrientConfig {
  product: MacronutrientProduct;
  /** g/kg/gün */
  doseStart: number;
  doseAdvance: number;
  doseMax: number;
}

export interface ElectrolyteEntry {
  /** Birim profile.units.electrolyte cinsinden, /kg/gün */
  dosePerKg: number;
  /** Kullanılan stok çözeltinin konsantrasyonu (birim/mL) */
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

export interface SafetyRule {
  id: string;
  level: SafetyLevel;
  /** Profildeki bir değere referans, ör. "glucose.girMax" */
  ref?: string;
  /** Sabit eşik (ref yoksa) */
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
  safety: SafetyConfig;
}

// ---------------------------------------------------------------------------
// Hasta girdisi
// ---------------------------------------------------------------------------

export interface PatientInput {
  weightKg: number;
  /** Postnatal gün (ageBasis'e göre yorumlanır) */
  ageDays: number;
  gestationalAgeWeeks?: number;
  line: LineType;
  phototherapy?: boolean;
  radiantWarmer?: boolean;
  /** Order edilen sıvı kısıtlaması (toplam hedefin yüzdesi, 0-100) */
  fluidRestrictionPct?: number;
}

// ---------------------------------------------------------------------------
// Çıktı
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
  warnings: Warning[];
}
