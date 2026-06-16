// NativeWind v4 requires the expo preset with the nativewind jsxImportSource
// plus the nativewind babel preset.
module.exports = (api) => {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
  };
};
