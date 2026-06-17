/** @type {import('tailwindcss').Config} */
// Design tokens — Direction C "Modern Editorial": warm off-white ground, navy
// accent, warm near-black ink, Fraunces serif for display/numbers + Inter for UI.
// `slate` is repointed to warm greys; red/amber stay default (reserved for safety).
// In React Native each font weight is a separate family, so weights are exposed as
// explicit `font-*` families (e.g. font-inter-semibold) rather than font-weight.
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter_400Regular'],
        inter: ['Inter_400Regular'],
        'inter-medium': ['Inter_500Medium'],
        'inter-semibold': ['Inter_600SemiBold'],
        'inter-bold': ['Inter_700Bold'],
        display: ['Fraunces_600SemiBold'],
        'display-bold': ['Fraunces_700Bold'],
      },
      colors: {
        ground: '#f7f6f3',
        ink: '#14110e',
        accent: { 50: '#eef2f8', 100: '#d9e2f0', 600: '#1d3a6e', 700: '#16294d' },
        slate: {
          50: '#faf9f7',
          100: '#f1efea',
          200: '#e7e3da',
          300: '#d6d1c6',
          400: '#9a9488',
          500: '#7c766b',
          600: '#5c574e',
          700: '#423e37',
          800: '#2b2823',
          900: '#14110e',
        },
      },
    },
  },
  plugins: [],
};
