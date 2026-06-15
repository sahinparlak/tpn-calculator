import type { TPNProfile } from '../types.js';

/**
 * Resolves a dotted profile path (e.g. `"glucose.girMax"`) to a finite number.
 * Returns `undefined` when the path is missing or does not point to a number;
 * the safety layer treats an unresolved reference as "rule not applicable".
 */
export function resolveRef(profile: TPNProfile, path: string): number | undefined {
  const value = path.split('.').reduce<unknown>((acc, key) => {
    if (acc !== null && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, profile);
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}
