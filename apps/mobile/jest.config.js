// Jest config for the Expo app. `jest-expo` provides the React Native transform
// and module mapping; we add setup mocks for native modules that run at import
// time (e.g. expo-localization in the i18n entry point).
//
// `@tpn/engine` ships ESM-only with an `import`-conditioned `exports` map, which
// Jest's CommonJS resolver can't read — so we map it to its built entry point
// (run `npm run build -w @tpn/engine` first). Babel then transpiles it like app code.
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['<rootDir>/test/**/*.test.{ts,tsx}'],
  moduleNameMapper: {
    '^@tpn/engine$': '<rootDir>/../../packages/engine/dist/index.js',
  },
};
