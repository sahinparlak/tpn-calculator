# Scientific Basis & References

This project separates **universal calculation logic** from **clinical values**.
The engine (`@tpn/engine`) contains no clinical constants; all doses, limits and
product data come from a center profile. Sourcing therefore happens at two levels.

## Level 1 — Model and default reference values (international guidelines)

### Primary — ESPGHAN/ESPEN/ESPR/CSPEN 2018

The revised 2018 European guidelines on pediatric parenteral nutrition
(ESPGHAN · ESPEN · ESPR · CSPEN), published in *Clinical Nutrition* (2018). Their
modular structure maps almost directly onto the profile schema:

| Profile area | Guideline module |
|---|---|
| `fluid`, `electrolytes` | Fluid and electrolytes |
| `energy` | Energy |
| `glucose` / GIR | Carbohydrates |
| `lipid` | Lipids |
| `aminoAcid` | Amino acids |
| `electrolytes` (Ca/P/Mg) | Calcium, phosphorus and magnesium |
| `additives` (trace, vitamins) | Iron and trace minerals; Vitamins |
| patient `line` / access | Venous access |

### Complementary — A.S.P.E.N.

Used especially for **safety thresholds** and a North-American perspective:

- A.S.P.E.N. Parenteral Nutrition Safety Consensus Recommendations.
- A.S.P.E.N. Guidelines for parenteral nutrition in preterm infants
  (Robinson et al., *JPEN*, 2023).
- Example: A.S.P.E.N. recommends peripheral PN osmolarity not exceed
  **~900 mOsm/L** — the basis for the `osmolarity-peripheral` safety rule.
  (Verify the exact value against the source before encoding it into a profile.)

## Level 2 — Actual profile values (per center)

The numbers in any given profile must come from:

- the **center's own approved TPN protocol** — recorded in
  `profile.meta.reviewedBy` and `profile.meta.lastReviewed`; and
- **national guidance** — e.g. Türk Neonatoloji Derneği (Turkish Neonatal
  Society) for the Turkish context.

The engine does **not** verify that a profile reflects safe or locally approved
practice (see [`../DISCLAIMER.md`](../DISCLAIMER.md)).

## Modeling caveats that need a dedicated source

- **Calcium–phosphate:** the engine uses a simple solubility-product
  approximation. Real compatibility is product-, amino-acid-, pH- and
  temperature-dependent; the Ca/P guideline module plus a **product-specific
  compatibility reference** should back any profile threshold.

## Validation

Reference cases in the test suite should be **derived from the sources above**, so
that every expected output is traceable to a citation (see
[`BACKLOG.md`](./BACKLOG.md), section A).

## Note

This file lists **authoritative sources**. It does not reproduce copyrighted
guideline text or quote specific clinical values; exact figures must be read from
the source documents themselves.

### Links

- ESPGHAN — Published Guidelines: <https://espghan.info/published-guidelines/>
- ESPEN — Pediatric PN guideline files: <https://www.espen.org/guidelines-home/espen-guidelines>
- A.S.P.E.N. — Guidelines & Standards: <https://nutritioncare.org/clinical-resources/guidelines-standards/>
- A.S.P.E.N. preterm PN guideline (Robinson et al., 2023):
  <https://aspenjournals.onlinelibrary.wiley.com/doi/10.1002/jpen.2550>
