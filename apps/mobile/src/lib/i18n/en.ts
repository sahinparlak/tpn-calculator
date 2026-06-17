// English UI strings. Single source of truth for all user-facing copy.
// Engine output (component labels, warning messages) is already English and is
// surfaced directly; this dictionary covers the app chrome only.
//
// i18n-ready: add another locale file with the same shape and register it in
// `./index.ts`. Keep keys structured by screen.
export const en = {
  app: {
    name: 'TPN Calculator',
  },
  common: {
    continue: 'Continue',
    back: 'Back',
    edit: 'Edit',
    close: 'Close',
    calculate: 'Calculate',
    profile: 'Profile',
  },
  disclaimer: {
    title: 'Before you start',
    intro:
      'TPN Calculator was built by a clinician. Its calculations follow current clinical guidance, every value is traceable to its source, and it shows safety limits clearly. The final decision is always yours.',
    trust: {
      guideline: 'ESPGHAN 2018',
      traceable: 'Traceable',
      safety: 'Safety',
    },
    profileNote:
      'Active profile: ESPGHAN 2018 reference — guideline-based, not center-validated. Verify results against your own protocol.',
    consentBefore: "I'm a qualified clinician; I accept the ",
    consentLink: 'terms',
    consentAfter: ' and take responsibility.',
    footnote: 'Accepted once · the disclaimer stays visible on the Result screen',
  },
  terms: {
    title: 'Terms of use',
    sections: [
      {
        h: 'Purpose',
        p: "An informational and educational decision-support tool for qualified healthcare professionals; it does not replace professional judgment. The engine contains no clinical constants — a result reflects the user's profile and input.",
      },
      {
        h: 'No warranty',
        p: 'The software is provided "as is"; no warranty is given, including accuracy, completeness, or fitness for a particular purpose (LICENSE).',
      },
      {
        h: 'Risk & responsibility on you',
        p: "Use is entirely at the user's own risk. Verifying the profile, independently checking every result, and all clinical decisions and orders are the user's responsibility.",
      },
      {
        h: 'Limitation of liability & indemnity',
        p: 'To the maximum extent permitted by law, the authors are not liable for any damages; the user holds the authors harmless against claims arising from their use.',
      },
      {
        h: 'Regulatory status',
        p: 'Not approved or registered as a medical device by any authority (FDA, EU MDR, TİTCK). Classification depends on the intended use given by the user, who is responsible for it.',
      },
    ],
    footer: 'Full text: DISCLAIMER.md · this summary is not legal advice.',
  },
  patient: {
    title: 'Patient',
    activeProfile: 'Active profile',
    profileNote: 'guideline-based reference · not center-validated',
    weight: 'Weight',
    age: 'Age',
    days: 'days',
    lineType: 'Line type',
    peripheral: 'Peripheral',
    central: 'Central',
    lineHint: 'Default comes from the profile (central). Peripheral applies stricter osmolarity/dextrose limits.',
    optional: 'Optional',
    gestationalAge: 'Gestational age',
    optionalTag: 'optional',
    weeks: 'weeks',
    phototherapy: 'Phototherapy',
    radiantWarmer: 'Radiant warmer',
    fluidRestriction: 'Fluid restriction',
    errors: {
      weightPositive: 'Weight must be greater than 0.',
      ageInteger: 'Age must be a whole number of days (0 or more).',
      restrictionRange: 'Fluid restriction must be between 0 and 100.',
      gestationalRange: 'Gestational age looks out of range.',
    },
  },
  result: {
    title: 'Result',
    totalVolume: 'Total volume',
    glucose: 'Glucose',
    gir: 'GIR',
    finalDextrose: 'Final dextrose (aqueous phase)',
    amount: 'Amount',
    volume: 'Volume',
    dextroseVolume: 'Dextrose volume',
    aminoAcid: 'Amino acid',
    lipid: 'Lipid',
    electrolytes: 'Electrolytes',
    ion: 'Ion',
    perKg: 'mmol/kg',
    total: 'total',
    additives: 'Additives',
    off: 'off',
    energy: 'Energy',
    carb: 'Carb',
    protein: 'Protein',
    fat: 'Fat',
    osmolarity: 'Osmolarity',
    osmolarityNote: 'Above the peripheral-line upper limit (clears on a central line).',
    derived: 'Derived values',
    aqueousVolume: 'Aqueous volume',
    lipidVolume: 'Lipid volume',
    caPProduct: 'Ca × P solubility product',
    caPProductNote:
      'Simplified estimate in (mmol/L)² — not the classic mg²/dL² precipitation threshold. Confirm physical compatibility with your pharmacy.',
    colorKey: 'Warning color key',
    hardKey: 'red = hard / block',
    softKey: 'amber = soft / caution',
    mustNotUse: 'Must not be used without independent verification',
    hardExceeded: 'hard safety limits exceeded:',
    softNote: 'soft cautions:',
    noWarnings: 'No limit warnings',
    noWarningsNote: 'No hard/soft safety limits exceeded for this line. Still, verify results independently.',
    footer:
      'Clinical decision-support tool · the ordering clinician is solely responsible · verify results independently.',
    profileLink: 'Profile: ESPGHAN 2018 Reference — guideline-based, not center-validated',
  },
  profile: {
    title: 'Active profile',
    subtitle: 'preterm >1500 g · NICU',
    tag: 'guideline-based reference · not center-validated',
    version: 'Version',
    lastReviewed: 'Last reviewed',
    reviewedBy: 'Reviewed by',
    dosingTitle: 'Dosing — guideline-traceable',
    representativeTitle: 'Representative values',
    representativeBody:
      "Dextrose % limits, stock concentrations and product details aren't single numbers in the guideline — they're physicochemical approximations / pharmacy facts. Each center must replace and validate them.",
    sourceList: 'Full source list:',
  },
} as const;

export type Strings = typeof en;
