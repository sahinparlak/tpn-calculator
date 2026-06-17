// Mocks for native modules evaluated at import time, so tests can run under Node.
// `expo-localization` is read at module load in `src/lib/i18n/index.ts`.
jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'en' }],
}));
