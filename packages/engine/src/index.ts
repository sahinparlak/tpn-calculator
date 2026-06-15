/**
 * @tpn/engine — Public API
 *
 * Çekirdek motor: bir hasta girdisi ve bir merkez profili alır,
 * TPN reçetesini ve güvenlik uyarılarını döndürür.
 *
 * Hesap formülleri evrenseldir (GIR, ozmolarite, hacim dengesi, final dekstroz
 * konsantrasyonu); tüm klinik eşik ve dozlar `profile` üzerinden gelir.
 */

export * from './types';

import type { PatientInput, TPNProfile, TPNResult } from './types';

/**
 * TPN reçetesini hesaplar.
 *
 * @remarks Faz 1'de implemente edilecek. İmza ve domain modeli Faz 0'da kilitlendi.
 */
export function calculateTPN(_patient: PatientInput, _profile: TPNProfile): TPNResult {
  throw new Error('calculateTPN: implementasyon Faz 1 kapsamında eklenecek.');
}
