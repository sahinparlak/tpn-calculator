import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// GitHub Pages serves this project at /tpn-calculator/. The base path only
// matters for the production build; dev runs from root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/tpn-calculator/' : '/',
  plugins: [react()],
  // The embedded reference profile lives at the monorepo root (single source of
  // truth, shared with the mobile app), so the dev server must read above app root.
  server: { fs: { allow: ['../..'] } },
}));
