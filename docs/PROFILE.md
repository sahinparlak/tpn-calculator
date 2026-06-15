# Merkez Profili Yazma Rehberi

Bir profil, motorun kullandığı **tüm klinik değerleri** tutar. Motor hiçbir doz,
limit veya birim varsaymaz; hepsi buradan gelir. Bu yüzden bir profilin
doğruluğu, çıktının doğruluğunu birebir belirler.

> **Sorumluluk:** Profildeki her değer, merkezinizin **onaylı protokolünden veya
> güvenilir bir klinik kaynaktan** girilmelidir. Bkz. [`../DISCLAIMER.md`](../DISCLAIMER.md).

## Nasıl başlanır

1. [`../profiles/erciyes-nicu.template.json`](../profiles/erciyes-nicu.template.json)
   dosyasını kopyalayın, kendi merkez adınızla yeniden adlandırın.
2. `null` olan her klinik değeri ve `DOLDUR` yazan her metni doldurun.
3. Doldurduktan sonra yardımcı `_NOT` ve `_yardim` anahtarlarını **silin**
   (şema bunlara izin vermez; doğrulama ancak temizleyince geçer).
4. [JSON Şeması](../profiles/schema/profile.schema.json) ile doğrulayın.

## Alanlar

| Bölüm | Alan | Anlamı | Birim |
|---|---|---|---|
| `meta` | `name`, `version`, `locale`, `lastReviewed`, `reviewedBy` | Kimlik ve izlenebilirlik | — |
| `units` | `energy` | Enerji birimi | `kcal` / `kJ` |
| `units` | `electrolyte` | Elektrolit birimi | `mmol` / `mEq` |
| `patient` | `ageBasis` | Yaş temeli | `dayOfLife` / `postmenstrualAge` |
| `fluid` | `schedulePerKg` | Yaşa göre sıvı | ml/kg/gün |
| `fluid` | `phototherapyAdjMlPerKg`, `radiantWarmerAdjMlPerKg` | Düzeltmeler | ml/kg/gün |
| `fluid` | `maxVolumePerKg` | Üst sınır | ml/kg/gün |
| `energy` | `targetKcalPerKg` | Hedef kalori aralığı | kcal/kg/gün |
| `glucose` | `girStart` / `girAdvance` / `girMax` | GIR şeması | mg/kg/dk |
| `glucose` | `maxConcPeripheral` / `maxConcCentral` | Maks dekstroz | % |
| `glucose` | `stockConcentrations` | Mevcut stoklar | % (liste) |
| `aminoAcid`, `lipid` | `product` | Ürün adı + konsantrasyon | % |
| `aminoAcid`, `lipid` | `doseStart` / `doseAdvance` / `doseMax` | Doz şeması | g/kg/gün |
| `electrolytes.*` | `dosePerKg` | Günlük doz | `units.electrolyte`/kg/gün |
| `electrolytes.*` | `stockConcentration` | Stok çözelti | birim/mL |
| `additives.*` | `enabled`, `dosePerKg` | Eklenenler | birim/kg/gün |
| `safety.defaultLine` | — | Varsayılan damar yolu | `peripheral` / `central` |
| `safety.rules` | `level` | `hard` engeller, `soft` uyarır | — |

## Güvenlik kuralları

Her kural ya bir profil değerine **referans** verir (`"ref": "glucose.girMax"`)
ya da sabit bir **eşik** taşır (`"threshold": 900`). `level`:

- `hard` — sınır aşılırsa sonuç **engellenir / kırmızı uyarı**.
- `soft` — yalnızca **uyarı** gösterilir.

Hangi kuralların hard/soft olacağı tamamen merkezin tercihidir.
