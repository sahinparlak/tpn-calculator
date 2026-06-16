// Metro config for the TPN monorepo (Expo + npm workspaces).
// Follows the official Expo monorepo guide so Metro can resolve the
// workspace package `@tpn/engine` (built to its own `dist/`) via the
// hoisted symlink at the repo root.
// https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo so changes to `@tpn/engine` are picked up.
config.watchFolders = [workspaceRoot];

// 2. Resolve modules from both the app's and the workspace root's node_modules.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = config;
