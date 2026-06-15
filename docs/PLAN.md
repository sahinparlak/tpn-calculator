# TPN Hesaplayıcı — Proje Planı

## 1. Vizyon ve temel ilke

Yenidoğan/pediatrik parenteral nütrisyon hesabını **merkez bağımsız** yapan açık
kaynak bir karar destek aracı. Temel tasarım kararı: **hiçbir klinik değer koda
gömülmez.** Tüm dozlar, limitler, ürün konsantrasyonları ve varsayılanlar bir
**merkez profili** (konfigürasyon) içinde tanımlanır. Aynı motor her merkezde
çalışır; yalnızca profil değişir.

## 2. Mimari: iki katman

```
┌─────────────────────────────────────────┐
│  UI Katmanı (Expo mobil + React/Next web)│  ← sunum, klinik mantık YOK
├─────────────────────────────────────────┤
│  @tpn/engine (saf TS, %100 test)          │  ← kalbi; çerçeve bilmez
│  + Profil şeması (merkez yapılandırması)  │
└─────────────────────────────────────────┘
```

Motor saf bir kütüphanedir: girdi (hasta + profil) → çıktı (reçete + uyarılar).
Arayüzü bilmez, böylece hem mobilde hem webde hem testlerde aynen çalışır.
Klinik güvenliğin merkezi burasıdır; bu katmanda yüksek test kapsamı zorunludur.

## 3. Teknoloji yığını (kilitli)

- **Monorepo:** npm workspaces (Expo ile en uyumlu; ileride pnpm'e geçiş kolay)
- **`@tpn/engine`:** saf TypeScript, npm'e yayınlanabilir çekirdek
- **`apps/mobile`:** Expo (React Native) — iOS + Android (önce)
- **`apps/web`:** React/Next — tarayıcıda canlı demo (sonra)
- **Test:** Vitest · **CI:** GitHub Actions · **Lisans:** MIT

## 4. Domain modeli

Motorun ürettikleri (her eşik/doz **profilden** gelir):

| Bileşen | Hesap | Profilden gelen |
|---|---|---|
| Sıvı | yaş/kg'a göre toplam hacim | başlangıç & ilerleme şeması, düzeltmeler, max |
| Enerji | toplam kcal/kg, dağılım | hedef kalori aralığı |
| Glukoz/GIR | GIR (mg/kg/dk), final dekstroz % | başlangıç/max GIR, max konsantrasyon |
| Amino asit | g/kg → hacim | doz şeması, ürün ve % |
| Lipid | g/kg → hacim | doz şeması, ürün ve % |
| Elektrolit | Na/K/Ca/Mg/P/Cl | doz aralıkları, stok konsantrasyonlar, birim |
| Eklenenler | eser element, vitamin, heparin | varlık/doz |

**Türetilen kritik çıktılar:** kalan su hacmi, final dekstroz konsantrasyonu,
**ozmolarite** (periferik/santral kararı), kalori dağılımı, toplam hacim uyumu.

## 5. Klinik güvenlik katmanı

- **Sınır uyarıları:** GIR, periferik ozmolarite/dekstroz, elektrolit limitleri,
  **Ca-P çökelme riski**, hacim taşması. Her eşik profilden.
- **hard vs soft:** engelle mi, uyar mı — profilde tanımlı.
- **Disclaimer:** açılışta ve çıktıda görünür klinik sorumluluk reddi.
- **Doğrulama veri seti:** referans vakalarla regresyon testleri.
- **Birim sistemi:** kcal/kJ, mmol/mEq — uluslararası kullanım için.

## 6. Yol haritası

0. **Tasarım kilidi** ✅ — domain modeli, profil şeması, repo iskeleti, plan.
1. **Motor** — `@tpn/engine` hesap mantığı + kapsamlı testler + örnek profiller.
2. **Mobil MVP** — Expo: tek hasta hesabı, tek profil, çıktı + uyarılar.
3. **Konfigürasyon UI** — profil seçme/düzenleme, birim sistemi, çoklu profil.
4. **Web** — aynı motordan web sürümü + canlı demo (GitHub Pages/Vercel).
5. **Uluslararasılaştırma** — çoklu dil, dokümantasyon sitesi, topluluk altyapısı.

## 7. Lisans ve hukuk

**MIT** — en serbest, herkes kullanır/değiştirir/dağıtır; "AS IS" maddesiyle
yasal koruma sağlar. Tıbbi araç olduğu için ayrıca görünür bir **klinik
disclaimer** ([`../DISCLAIMER.md`](../DISCLAIMER.md)) eklenmiştir.

## 8. Prestij ölçütleri (sürdürülen)

Çalışan canlı demo · yüksek test kapsamı + yeşil CI · cilalı README · npm'e
yayınlanmış yeniden kullanılabilir çekirdek · temiz mimari · sürüm etiketleri ·
`CONTRIBUTING` + issue şablonları · dokümantasyon.
