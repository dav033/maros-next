import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DIRS = ["src"];
const EXT = new Set([".ts", ".tsx"]);

const MAP = [
  ["bg-theme-dark", "bg-background"],
  ["bg-theme-primary", "bg-primary"],
  ["border-theme-gray-subtle", "border-border"],
  ["text-theme-light/70", "text-muted-foreground"],
  ["text-theme-light", "text-foreground"],
  ["text-theme-muted", "text-muted-foreground"],
  ["text-theme-primary", "text-primary"],
  ["text-theme-accent", "text-primary"],
  // Gray variants - most should map to muted-foreground or foreground
  ["text-gray-400", "text-muted-foreground"],
  ["text-gray-500", "text-muted-foreground"],
  ["text-gray-300", "text-foreground"],
  ["text-gray-200", "text-foreground"],
  ["text-gray-600", "text-muted-foreground"],
  ["text-gray-700", "text-foreground"],
  ["text-gray-900", "text-foreground"],
];

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (EXT.has(path.extname(ent.name))) out.push(p);
  }
  return out;
}

const dry = process.argv.includes("--dry-run");

for (const d of DIRS) {
  const files = walk(path.join(ROOT, d));
  for (const f of files) {
    const orig = fs.readFileSync(f, "utf8");
    let next = orig;
    for (const [from, to] of MAP) next = next.split(from).join(to);
    if (next !== orig) {
      console.log(`UPDATED: ${path.relative(ROOT, f)}`);
      if (!dry) fs.writeFileSync(f, next, "utf8");
    }
  }
}

console.log(dry ? "DRY RUN OK" : "WRITE OK");
