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
const npmVersion = '^0.0.6'; // Versión del paquete en npm

if (!isProduction && localExists) {
  // Desarrollo: usar paquete local con file:../davComponents
  davComponentsVersion = 'file:../davComponents';
  console.log('📦 Using local davComponents package (development mode)');
} else {
  // Producción: SIEMPRE usar npm (el paquete está publicado)
  davComponentsVersion = npmVersion;
  if (isProduction) {
    console.log(`📦 Using npm package @dav033/dav-components@${npmVersion} (production mode)`);
  } else {
    console.log(`📦 Using npm package @dav033/dav-components@${npmVersion} (local package not found)`);
  }
}

// Verificar si la versión correcta ya está instalada
const isLocalVersion = currentVersion && currentVersion.startsWith('file:');
const isNpmVersion = currentVersion && !currentVersion.startsWith('file:');
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

// Limpiar aliases de tsconfig si existen (no son necesarios cuando usamos file: o npm)
const hasLocalAliases = tsconfig.compilerOptions.paths && (
  tsconfig.compilerOptions.paths['@dav033/dav-components'] || 
  tsconfig.compilerOptions.paths['@dav033/dav-components/*']
);

if (hasLocalAliases) {
  delete tsconfig.compilerOptions.paths['@dav033/dav-components'];
  delete tsconfig.compilerOptions.paths['@dav033/dav-components/*'];
  fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2) + '\n');
  console.log('✅ Updated tsconfig.json (removed local aliases)');
}

if (isInstalled) {
  console.log('✅ Dependencies are correctly configured');
  process.exit(0);
}

// Actualizar package.json si es necesario
if (currentVersion !== davComponentsVersion) {
  packageJson.dependencies['@dav033/dav-components'] = davComponentsVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log('✅ Updated package.json');
}

  // Ejecutar npm install para asegurar que las dependencias estén instaladas
  console.log('📦 Running npm install to ensure dependencies are installed...');
  const { execSync } = require('child_process');
  const projectRoot = path.join(__dirname, '..');
  
  try {
    // En producción, instalar sin workspaces para evitar conflictos
    if (isProduction) {
      execSync('npm install --no-workspaces', { stdio: 'inherit', cwd: projectRoot });
    } else {
      execSync('npm install', { stdio: 'inherit', cwd: projectRoot });
    }
    
    // Verificar que el paquete se instaló correctamente
    // Primero verificar en node_modules local, luego en el workspace root
    let installedPath = path.join(projectRoot, 'node_modules', '@dav033', 'dav-components');
    if (!fs.existsSync(installedPath)) {
      // Intentar en el workspace root
      const workspaceRoot = path.join(projectRoot, '..');
      installedPath = path.join(workspaceRoot, 'node_modules', '@dav033', 'dav-components');
    }
    
    if (!fs.existsSync(installedPath)) {
      console.error('❌ Package @dav033/dav-components was not installed correctly');
      console.error(`   Checked paths:`);
      console.error(`   - ${path.join(projectRoot, 'node_modules', '@dav033', 'dav-components')}`);
      console.error(`   - ${path.join(projectRoot, '..', 'node_modules', '@dav033', 'dav-components')}`);
      process.exit(1);
    }
    
    // Verificar que el package.json del paquete instalado existe
    const installedPackageJson = path.join(installedPath, 'package.json');
    if (!fs.existsSync(installedPackageJson)) {
      console.error('❌ Package @dav033/dav-components package.json not found');
      process.exit(1);
    }
    
    console.log(`✅ Dependencies installed successfully at: ${installedPath}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }

