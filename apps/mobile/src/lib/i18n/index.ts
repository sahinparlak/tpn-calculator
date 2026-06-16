// i18n entry point. The app ships English-only for now, but the infrastructure
// is locale-ready: register more dictionaries in `dictionaries` and the device
// locale (via expo-localization) will pick the matching one, falling back to en.
import { getLocales } from 'expo-localization';
import { en, type Strings } from './en';

const dictionaries: Record<string, Strings> = {
  en,
  // tr: ...  ← drop in a translated dictionary of the same shape to add Turkish.
};

const deviceLanguage = getLocales()[0]?.languageCode ?? 'en';

/** Active string dictionary for the current locale (falls back to English). */
export const strings: Strings = dictionaries[deviceLanguage] ?? en;

/** Hook form, so screens can become locale-reactive later without API churn. */
export function useStrings(): Strings {
  return strings;
}

export type { Strings };
