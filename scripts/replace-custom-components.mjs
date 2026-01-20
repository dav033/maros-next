import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DIRS = ["src"];
const EXT = new Set([".ts", ".tsx"]);

const REPLACEMENTS = [
  // IconButton -> Button
  {
    import: /import\s*{\s*IconButton\s*}\s*from\s*["']@\/components\/custom["'];?/g,
    replace: 'import { Button } from "@/components/ui/button";',
    usage: /<IconButton\s+/g,
    usageReplace: '<Button variant="ghost" size="icon" ',
    closing: /<\/IconButton>/g,
    closingReplace: '</Button>',
  },
  // Field -> Label (manual replacement needed, but we can update imports)
  {
    import: /import\s*{\s*Field\s*}\s*from\s*["']@\/components\/custom["'];?/g,
    replace: 'import { Label } from "@/components/ui/label";',
  },
  // Modal -> Dialog
  {
    import: /import\s*{\s*Modal\s*}\s*from\s*["']@\/components\/custom["'];?/g,
    replace: `import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";`,
  },
  // StatusBadge -> Badge
  {
    import: /import\s*{\s*StatusBadge\s*}\s*from\s*["']@\/components\/custom["'];?/g,
    replace: 'import { Badge } from "@/components/ui/badge";',
    usage: /<StatusBadge\s+/g,
    usageReplace: '<Badge ',
    closing: /<\/StatusBadge>/g,
    closingReplace: '</Badge>',
  },
];

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
    
    for (const repl of REPLACEMENTS) {
      // Replace imports
      if (repl.import) {
        content = content.replace(repl.import, repl.replace);
      }
      
      // Replace usage (if specified)
      if (repl.usage) {
        content = content.replace(repl.usage, repl.usageReplace);
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
