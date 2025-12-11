#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const localDavComponentsPath = path.join(__dirname, '..', '..', 'davComponents');
const nodeModulesPath = path.join(__dirname, '..', 'node_modules', '@dav033', 'dav-components');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Detectar si estamos en producción
// En producción, NODE_ENV generalmente es 'production'
// También verificamos si estamos en CI/CD
const isProduction = 
  process.env.NODE_ENV === 'production' || 
  process.env.CI === 'true' ||
  process.env.VERCEL === '1' ||
  process.env.NETLIFY === 'true';

const localExists = fs.existsSync(localDavComponentsPath) && 
                   fs.existsSync(path.join(localDavComponentsPath, 'package.json'));

// Determinar qué versión usar
let davComponentsVersion;
let currentVersion = packageJson.dependencies['@dav033/dav-components'];

if (!isProduction && localExists) {
  // Desarrollo: usar paquete local si existe
  davComponentsVersion = 'file:../davComponents';
  console.log('📦 Using local davComponents package (development mode)');
} else {
  // Producción o si no existe local: usar npm
  davComponentsVersion = '@dav033/dav-components';
  if (isProduction) {
    console.log('📦 Using npm package @dav033/dav-components (production mode)');
  } else {
    console.log('📦 Using npm package @dav033/dav-components (local package not found)');
  }
}

// Verificar si la versión correcta ya está instalada
const isLocalVersion = currentVersion.startsWith('file:');
const isNpmVersion = !isLocalVersion;
const isCorrectVersion = 
  (davComponentsVersion.startsWith('file:') && isLocalVersion) ||
  (!davComponentsVersion.startsWith('file:') && isNpmVersion);

// Verificar si node_modules tiene la versión correcta
// Para paquetes locales, npm crea un symlink, así que verificamos tanto el symlink como el directorio
let nodeModulesExists = false;
try {
  const stats = fs.lstatSync(nodeModulesPath);
  nodeModulesExists = stats.isSymbolicLink() || stats.isDirectory();
} catch (e) {
  nodeModulesExists = false;
}

const isInstalled = isCorrectVersion && nodeModulesExists;

if (isInstalled) {
  console.log('✅ Dependencies are correctly configured');
  process.exit(0);
}

// Actualizar package.json solo si es necesario
if (currentVersion !== davComponentsVersion) {
  packageJson.dependencies['@dav033/dav-components'] = davComponentsVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log('✅ Updated package.json');
  console.log('\n⚠️  Please run "npm install" to update dependencies');
  process.exit(1);
} else {
  // package.json está correcto pero node_modules no tiene la dependencia
  // Solo mostramos un warning pero no fallamos, para permitir que npm install se ejecute después
  console.log('⚠️  package.json is correct but dependencies may need to be installed');
  console.log('   If you see import errors, run "npm install"');
  // No salimos con error, permitimos que continúe
  process.exit(0);
}

