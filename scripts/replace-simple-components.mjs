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

// Replace SimplePageHeader imports
const simplePageHeaderImport = /import\s*{\s*([^}]*)\s*SimplePageHeader\s*([^}]*)\s*}\s*from\s*["']@\/components\/custom["'];?/g;
const simplePageHeaderUsage = /<SimplePageHeader\s+title=["']([^"']+)["'](?:\s+description=["']([^"']+)["'])?(?:\s+className=["']([^"']+)["'])?\s*\/>/g;

// Replace PageContainer imports and usage
const pageContainerImport = /import\s*{\s*([^}]*)\s*PageContainer\s*([^}]*)\s*}\s*from\s*["']@\/components\/custom["'];?/g;
const pageContainerOpen = /<PageContainer(?:\s+maxWidth=["']([^"']+)["'])?(?:\s+className=["']([^"']+)["'])?\s*>/g;
const pageContainerClose = /<\/PageContainer>/g;

for (const d of DIRS) {
  const files = walk(path.join(ROOT, d));
  for (const f of files) {
    let content = fs.readFileSync(f, "utf8");
    let original = content;
    
    // Replace SimplePageHeader imports (remove from import list)
    content = content.replace(simplePageHeaderImport, (match, before, after) => {
      const parts = [];
      if (before.trim()) {
        const items = before.split(",").filter(x => x.trim() && !x.includes("SimplePageHeader"));
        if (items.length) parts.push(items.join(","));
      }
      if (after.trim()) {
        const items = after.split(",").filter(x => x.trim() && !x.includes("SimplePageHeader"));
        if (items.length) parts.push(items.join(","));
      }
      return parts.length ? `import { ${parts.join(", ")} } from "@/components/custom";` : "";
    });
    
    // Replace SimplePageHeader usage
    content = content.replace(simplePageHeaderUsage, (match, title, description, className) => {
      const classNameAttr = className ? ` className="${className}"` : "";
      const desc = description ? `\n            <p className="text-xs text-muted-foreground sm:text-sm">${description}</p>` : "";
      return `<header className="flex flex-col gap-1"${classNameAttr}>
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">${title}</h1>${desc}
        </header>`;
    });
    
    // Replace PageContainer imports
    content = content.replace(pageContainerImport, (match, before, after) => {
      const parts = [];
      if (before.trim()) {
        const items = before.split(",").filter(x => x.trim() && !x.includes("PageContainer"));
        if (items.length) parts.push(items.join(","));
      }
      if (after.trim()) {
        const items = after.split(",").filter(x => x.trim() && !x.includes("PageContainer"));
        if (items.length) parts.push(items.join(","));
      }
      return parts.length ? `import { ${parts.join(", ")} } from "@/components/custom";` : "";
    });
    
    // Replace PageContainer open tag
    content = content.replace(pageContainerOpen, (match, maxWidth = "2xl", className = "") => {
      const maxWidthClass = {
        sm: "max-w-screen-sm",
        md: "max-w-screen-md",
        lg: "max-w-screen-lg",
        xl: "max-w-screen-xl",
        "2xl": "max-w-screen-2xl",
        full: "max-w-full",
      }[maxWidth] || "max-w-screen-2xl";
      const classAttr = `mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 ${maxWidthClass}${className ? ` ${className}` : ""}`;
      return `<div className="${classAttr}">`;
    });
    
    // Replace PageContainer close tag
    content = content.replace(pageContainerClose, "</div>");
    
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
