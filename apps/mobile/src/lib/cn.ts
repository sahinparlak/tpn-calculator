/** Tiny className joiner (keeps NativeWind class lists readable). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
