const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Encontrar la raíz del proyecto (apps/mobile) y la raíz del monorepo (/Partidos)
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Vigilar los archivos de todo el monorepo (para detectar @partidos/core)
config.watchFolders = [workspaceRoot];

// 2. Decirle a Metro dónde buscar módulos node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Forzar a Metro a resolver dependencias en ese orden
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
