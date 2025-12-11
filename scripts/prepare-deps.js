#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const tsconfigPath = path.join(__dirname, '..', 'tsconfig.json');
const localDavComponentsPath = path.join(__dirname, '..', '..', 'davComponents');
const nodeModulesPath = path.join(__dirname, '..', 'node_modules', '@dav033', 'dav-components');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));

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
  // Desarrollo: usar workspace si está configurado, sino file:../davComponents
  davComponentsVersion = 'workspace:*';
  console.log('📦 Using local davComponents package via workspace (development mode)');
} else {
  // Producción: SIEMPRE usar npm (el paquete está publicado)
  davComponentsVersion = '@dav033/dav-components';
  if (isProduction) {
    console.log('📦 Using npm package @dav033/dav-components (production mode)');
  } else {
    console.log('📦 Using npm package @dav033/dav-components (local package not found)');
  }
}

// Verificar si la versión correcta ya está instalada
const isLocalVersion = currentVersion.startsWith('file:') || currentVersion.startsWith('workspace:');
const isNpmVersion = !isLocalVersion && !currentVersion.startsWith('workspace:');
const isCorrectVersion = 
  (davComponentsVersion.startsWith('workspace:') && currentVersion.startsWith('workspace:')) ||
  (davComponentsVersion.startsWith('file:') && currentVersion.startsWith('file:')) ||
  (!davComponentsVersion.startsWith('file:') && !davComponentsVersion.startsWith('workspace:') && isNpmVersion);

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
  // Verificar que tsconfig.json tenga la configuración correcta
  // Si usamos file:../davComponents, no necesitamos aliases en tsconfig
  // Si usamos npm, tampoco necesitamos aliases
  const hasLocalAliases = tsconfig.compilerOptions.paths && (
    tsconfig.compilerOptions.paths['@dav033/dav-components'] || 
    tsconfig.compilerOptions.paths['@dav033/dav-components/*']
  );
  
  // Remover aliases si existen (no son necesarios cuando usamos file: o npm)
  if (hasLocalAliases) {
    delete tsconfig.compilerOptions.paths['@dav033/dav-components'];
    delete tsconfig.compilerOptions.paths['@dav033/dav-components/*'];
    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2) + '\n');
    console.log('✅ Updated tsconfig.json (removed local aliases)');
  } else {
    console.log('✅ Dependencies are correctly configured');
  }
  process.exit(0);
}

// Actualizar package.json y tsconfig.json si es necesario
if (currentVersion !== davComponentsVersion) {
  packageJson.dependencies['@dav033/dav-components'] = davComponentsVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log('✅ Updated package.json');
  
  // Remover aliases de tsconfig.json (no son necesarios cuando usamos file: o npm)
  if (tsconfig.compilerOptions.paths) {
    const hadAliases = tsconfig.compilerOptions.paths['@dav033/dav-components'] || 
                       tsconfig.compilerOptions.paths['@dav033/dav-components/*'];
    delete tsconfig.compilerOptions.paths['@dav033/dav-components'];
    delete tsconfig.compilerOptions.paths['@dav033/dav-components/*'];
    if (hadAliases) {
      fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2) + '\n');
      console.log('✅ Updated tsconfig.json (removed local aliases)');
    }
  }
  
  // En producción/CI, ejecutar npm install automáticamente
  if (isProduction) {
    console.log('📦 Running npm install to update dependencies...');
    const { execSync } = require('child_process');
    try {
      execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
      console.log('✅ Dependencies installed successfully');
      process.exit(0);
    } catch (error) {
      console.error('❌ Failed to install dependencies');
      process.exit(1);
    }
  } else {
    console.log('📦 Running npm install to update dependencies...');
    const { execSync } = require('child_process');
    try {
      execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
      console.log('✅ Dependencies installed successfully');
      process.exit(0);
    } catch (error) {
      console.error('❌ Failed to install dependencies');
      process.exit(1);
    }
  }
} else {
  // package.json está correcto pero node_modules no tiene la dependencia
  // Solo mostramos un warning pero no fallamos, para permitir que npm install se ejecute después
  console.log('⚠️  package.json is correct but dependencies may need to be installed');
  console.log('   If you see import errors, run "npm install"');
  // No salimos con error, permitimos que continúe
  process.exit(0);
}

