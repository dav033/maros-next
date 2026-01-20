import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DIRS = ["src"];

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory() && !ent.name.includes("node_modules")) {
      walk(p, out);
    } else if (p.endsWith(".tsx") || p.endsWith(".ts")) {
      out.push(p);
    }
  }
  return out;
}

const dry = process.argv.includes("--dry-run");
let changedFiles = 0;

// Replace TableToolbar imports
const tableToolbarImport = /import\s*{\s*([^}]*)\s*TableToolbar\s*([^}]*)\s*}\s*from\s*["']@\/components\/custom["'];?/g;

// Replace TableToolbar usage
const tableToolbarUsage = /<TableToolbar\s+search=\{([^}]+)\}\s+onCreate=\{([^}]+)\}(?:\s+createLabel=["']([^"']+)["'])?(?:\s+createIcon=\{([^}]+)\})?(?:\s+createAriaLabel=["']([^"']+)["'])?(?:\s+rightSlot=\{([^}]+)\})?(?:\s+className=["']([^"']+)["'])?\s*\/>/g;

for (const d of DIRS) {
  const files = walk(path.join(ROOT, d));
  for (const f of files) {
    let content = fs.readFileSync(f, "utf8");
    let original = content;
    
    // Skip if doesn't use TableToolbar
    if (!content.includes("TableToolbar")) continue;
    
    // Add imports if using TableToolbar
    if (content.includes("TableToolbar") && !content.includes("from \"@/components/ui/button\"")) {
      const imports = [];
      if (!content.includes("from \"@/components/ui/button\"")) {
        imports.push('import { Button } from "@/components/ui/button";');
      }
      if (!content.includes("from \"@/components/ui/input\"")) {
        imports.push('import { Input } from "@/components/ui/input";');
      }
      if (!content.includes("from \"@/components/ui/select\"")) {
        imports.push('import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";');
      }
      
      if (imports.length > 0) {
        // Find last import statement
        const lastImportMatch = content.match(/^import .*$/gm);
        if (lastImportMatch) {
          const lastImport = lastImportMatch[lastImportMatch.length - 1];
          const lastImportIndex = content.lastIndexOf(lastImport);
          const insertIndex = lastImportIndex + lastImport.length;
          content = content.slice(0, insertIndex) + "\n" + imports.join("\n") + content.slice(insertIndex);
        }
      }
    }
    
    // Remove TableToolbar from imports
    content = content.replace(tableToolbarImport, (match, before, after) => {
      const parts = [];
      if (before.trim()) {
        const items = before.split(",").filter(x => x.trim() && !x.includes("TableToolbar"));
        if (items.length) parts.push(items.join(","));
      }
      if (after.trim()) {
        const items = after.split(",").filter(x => x.trim() && !x.includes("TableToolbar"));
        if (items.length) parts.push(items.join(","));
      }
      return parts.length ? `import { ${parts.join(", ")} } from "@/components/custom";` : "";
    });
    
    if (content !== original) {
      console.log(`UPDATED: ${path.relative(ROOT, f)}`);
      if (!dry) {
        fs.writeFileSync(f, content, "utf8");
      }
      changedFiles++;
    }
  }
}

console.log(dry ? `DRY RUN: ${changedFiles} files would be updated` : `UPDATED: ${changedFiles} files`);
