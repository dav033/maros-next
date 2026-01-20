/**
 * Script to add missing Shadcn UI imports to files
 */

const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');

// Map of component names to their Shadcn UI import paths
const UI_COMPONENTS = {
  'Button': '@/components/ui/button',
  'Input': '@/components/ui/input',
  'Label': '@/components/ui/label',
  'Checkbox': '@/components/ui/checkbox',
  'Select': '@/components/ui/select',
  'Textarea': '@/components/ui/textarea',
  'Badge': '@/components/ui/badge',
  'Skeleton': '@/components/ui/skeleton',
};

// Regex patterns to detect component usage (not just in imports)
const componentPatterns = {
  'Button': /<Button\s/g,
  'Input': /<Input\s/g,
  'Label': /<Label\s/g,
  'Checkbox': /<Checkbox\s/g,
  'Select': /<Select\s/g,
  'Textarea': /<Textarea\s/g,
  'Badge': /<Badge\s/g,
  'Skeleton': /<Skeleton\s/g,
};

function findTsxFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.next') {
      findTsxFiles(fullPath, files);
    } else if (entry.isFile() && /\.tsx$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  
  // Find which components are used but not imported
  const usedComponents = [];
  const importedComponents = [];
  
  // Check which components are used in JSX
  for (const [comp, pattern] of Object.entries(componentPatterns)) {
    if (pattern.test(content)) {
      usedComponents.push(comp);
    }
  }
  
  if (usedComponents.length === 0) {
    return false;
  }
  
  // Check which are already imported
  for (const comp of usedComponents) {
    const importRegex = new RegExp(`import\\s*{[^}]*\\b${comp}\\b[^}]*}\\s*from`, 'g');
    if (importRegex.test(content)) {
      importedComponents.push(comp);
    }
  }
  
  // Find components that need to be imported
  const missingComponents = usedComponents.filter(c => !importedComponents.includes(c));
  
  if (missingComponents.length === 0) {
    return false;
  }
  
  // Group by import path
  const importsByPath = {};
  for (const comp of missingComponents) {
    const importPath = UI_COMPONENTS[comp];
    if (!importsByPath[importPath]) {
      importsByPath[importPath] = [];
    }
    importsByPath[importPath].push(comp);
  }
  
  // Generate new import statements
  let newImports = '';
  for (const [importPath, components] of Object.entries(importsByPath)) {
    newImports += `import { ${components.join(', ')} } from "${importPath}";\n`;
  }
  
  // Insert after existing imports or at the top
  const lastImportMatch = content.match(/^(import\s+.+from\s+["'][^"']+["'];?\n)+/m);
  if (lastImportMatch) {
    const insertPos = lastImportMatch.index + lastImportMatch[0].length;
    content = content.slice(0, insertPos) + newImports + content.slice(insertPos);
  } else {
    // Insert after "use client" if present
    const useClientMatch = content.match(/^["']use client["'];?\n/);
    if (useClientMatch) {
      content = useClientMatch[0] + '\n' + newImports + content.slice(useClientMatch[0].length);
    } else {
      content = newImports + content;
    }
  }
  
  if (!DRY_RUN) {
    fs.writeFileSync(filePath, content, 'utf-8');
  }
  
  return { file: filePath, added: missingComponents };
}

// Main
console.log(DRY_RUN ? '=== DRY RUN ===' : '=== FIXING IMPORTS ===');
console.log('');

const srcDir = path.join(__dirname, '..', 'src');
const files = findTsxFiles(srcDir);

console.log(`Scanning ${files.length} .tsx files...\n`);

let fixed = 0;
for (const file of files) {
  const result = processFile(file);
  if (result) {
    fixed++;
    const relativePath = path.relative(srcDir, result.file);
    console.log(`${DRY_RUN ? '[WOULD ADD]' : '[ADDED]'} ${relativePath}: ${result.added.join(', ')}`);
  }
}

console.log(`\n${DRY_RUN ? 'Would fix' : 'Fixed'} ${fixed} files`);
