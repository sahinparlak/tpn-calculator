/** Round to at most 1 decimal, dropping a trailing .0. Mirrors the mobile app. */
export function r1(n: number): string {
  const v = Math.round(n * 10) / 10;
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}
