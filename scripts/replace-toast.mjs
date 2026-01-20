#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const srcDir = join(process.cwd(), 'src');

function getAllFiles(dir, fileList = []) {
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (extname(file) === '.ts' || extname(file) === '.tsx') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function replaceToast(filePath) {
  let content = readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Replace import
  if (content.includes("import { useToast } from \"@/components/custom\"")) {
    content = content.replace(
      /import\s*{\s*useToast\s*}\s*from\s*["']@\/components\/custom["'];?/g,
      "import { toast } from \"sonner\";"
    );
    modified = true;
  }
  
  // Remove const toast = useToast();
  if (content.includes("const toast = useToast();")) {
    content = content.replace(/\s*const\s+toast\s*=\s*useToast\(\);\s*\n/g, '\n');
    modified = true;
  }
  
  // Replace toast.showSuccess -> toast.success
  if (content.includes("toast.showSuccess")) {
    content = content.replace(/toast\.showSuccess/g, 'toast.success');
    modified = true;
  }
  
  // Replace toast.showError -> toast.error
  if (content.includes("toast.showError")) {
    content = content.replace(/toast\.showError/g, 'toast.error');
    modified = true;
  }
  
  // Replace toast.showInfo -> toast.info
  if (content.includes("toast.showInfo")) {
    content = content.replace(/toast\.showInfo/g, 'toast.info');
    modified = true;
  }
  
  // Replace toast.showWarning -> toast.warning
  if (content.includes("toast.showWarning")) {
    content = content.replace(/toast\.showWarning/g, 'toast.warning');
    modified = true;
  }
  
  if (modified) {
    writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Updated: ${filePath.replace(process.cwd(), '.')}`);
    return true;
  }
  
  return false;
}

const files = getAllFiles(srcDir);
let count = 0;

files.forEach(file => {
  if (replaceToast(file)) {
    count++;
  }
});

console.log(`\n✓ Replaced toast in ${count} files`);
