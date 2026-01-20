import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TARGET_DIRS = ["src"];
const EXT = new Set([".ts", ".tsx", ".css"]);

const PATTERNS = [
  { name: "class:bg-theme-*", re: /\bbg-theme-[\w\-/:]+/g },
  { name: "class:text-theme-*", re: /\btext-theme-[\w\-/:]+/g },
  { name: "class:border-theme-*", re: /\bborder-theme-[\w\-/:]+/g },
  { name: "css:--color-*", re: /--color-[a-zA-Z0-9\-]+/g },
  { name: "hardcode:text-gray-*", re: /\btext-gray-\d{2,3}\b/g },
  { name: "hardcode:bg-[#...]", re: /bg-\[#[0-9A-Fa-f]{3,6}\]/g },
];

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (EXT.has(path.extname(ent.name))) out.push(p);
  }
  return out;
}

function main() {
  const files = TARGET_DIRS.flatMap((d) => walk(path.join(ROOT, d)));
  const results = [];

  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    for (const pat of PATTERNS) {
      const matches = text.match(pat.re) || [];
      if (matches.length) {
        results.push({
          file: path.relative(ROOT, file),
          pattern: pat.name,
          count: matches.length,
          samples: [...new Set(matches)].slice(0, 10),
        });
      }
    }
  }

  fs.mkdirSync(path.join(ROOT, "reports"), { recursive: true });
  fs.writeFileSync(
    path.join(ROOT, "reports", "ui-legacy-report.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2),
    "utf8"
  );

  const lines = ["# UI Legacy Report", ""]; 
  for (const r of results) {
    lines.push(`- ${r.file} | ${r.pattern} | ${r.count}`);
    if (r.samples?.length) lines.push(`  samples: ${r.samples.join(", ")}`);
  }
  fs.writeFileSync(path.join(ROOT, "reports", "ui-legacy-report.md"), lines.join("\n"), "utf8");

  const total = results.reduce((acc, r) => acc + r.count, 0);
  console.log(`Legacy matches: ${total}`);

  if (process.argv.includes("--fail") && total > 0) process.exit(2);
}

main();
