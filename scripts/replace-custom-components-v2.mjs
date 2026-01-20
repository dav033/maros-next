import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DIRS = ["src"];
const EXT = new Set([".ts", ".tsx"]);

// Componentes que pueden reemplazarse directamente
const COMPONENT_REPLACEMENTS = {
  // SimplePageHeader -> puede eliminarse, usar directamente
  "SimplePageHeader": {
    import: /import\s*{\s*SimplePageHeader\s*}\s*from\s*["']@\/components\/custom["'];?/g,
    replace: "",
    usage: /<SimplePageHeader\s+title=["']([^"']+)["'](?:\s+description=["']([^"']+)["'])?\s*\/>/g,
    usageReplace: (match, title, description) => {
      const desc = description ? `\n        <p className="text-xs text-muted-foreground sm:text-sm">${description}</p>` : "";
      return `<header className="flex flex-col gap-1">\n        <h1 className="text-xl font-semibold text-foreground sm:text-2xl">${title}</h1>${desc}\n      </header>`;
    },
  },
  // PageContainer -> puede eliminarse, usar div directamente
  "PageContainer": {
    import: /import\s*{\s*PageContainer\s*}\s*from\s*["']@\/components\/custom["'];?/g,
    replace: "",
    usage: /<PageContainer(?:\s+maxWidth=["']([^"']+)["'])?(?:\s+className=["']([^"']+)["'])?\s*>/g,
    usageReplace: (match, maxWidth = "2xl", className = "") => {
      const maxWidthClass = {
        sm: "max-w-screen-sm",
        md: "max-w-screen-md",
        lg: "max-w-screen-lg",
        xl: "max-w-screen-xl",
        "2xl": "max-w-screen-2xl",
        full: "max-w-full",
      }[maxWidth] || "max-w-screen-2xl";
      return `<div className="mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 ${maxWidthClass} ${className}">`;
    },
    closing: /<\/PageContainer>/g,
    closingReplace: "</div>",
  },
};

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory() && !ent.name.includes("node_modules")) {
      walk(p, out);
    } else if (EXT.has(path.extname(ent.name))) {
      out.push(p);
    }
  }
  return out;
}

const dry = process.argv.includes("--dry-run");
let changedFiles = 0;

for (const d of DIRS) {
  const files = walk(path.join(ROOT, d));
  for (const f of files) {
    let content = fs.readFileSync(f, "utf8");
    let original = content;
    
    for (const [name, repl] of Object.entries(COMPONENT_REPLACEMENTS)) {
      // Replace imports
      if (repl.import) {
        content = content.replace(repl.import, repl.replace);
      }
      
      // Replace usage (if specified)
      if (repl.usage && repl.usageReplace) {
        if (typeof repl.usageReplace === "function") {
          content = content.replace(repl.usage, repl.usageReplace);
        } else {
          content = content.replace(repl.usage, repl.usageReplace);
        }
      }
      
      // Replace closing tags (if specified)
      if (repl.closing) {
        content = content.replace(repl.closing, repl.closingReplace);
      }
    }
    
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
