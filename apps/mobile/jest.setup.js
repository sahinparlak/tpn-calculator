// Mocks for native modules evaluated at import time, so tests can run under Node.
// `expo-localization` is read at module load in `src/lib/i18n/index.ts`.
jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'en' }],
}));

// `@react-native-async-storage/async-storage` is read at import time by the
// persisted profiles store (`src/store/profiles.ts`); use the package's mock.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
