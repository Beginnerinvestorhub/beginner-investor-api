// File: tools/check_project_structure.ts
// Run with: npx ts-node tools/check_project_structure.ts

import fs from "fs";
import path from "path";

const ROOT_DIR = process.cwd();
const MAX_DEPTH = 4; // avoid massive recursion
const IGNORE = ["node_modules", ".git", ".next", ".venv", "__pycache__"];

function scanDir(dir: string, depth = 0): string[] {
  if (depth > MAX_DEPTH) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results: string[] = [];

  for (const entry of entries) {
    if (IGNORE.includes(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(ROOT_DIR, fullPath);

    try {
      const stats = fs.lstatSync(fullPath);
      const type = stats.isSymbolicLink()
        ? "🔗 symlink"
        : stats.isDirectory()
        ? "📁 dir"
        : "📄 file";
      results.push(`${"  ".repeat(depth)}${type} ${relativePath}`);
      if (stats.isDirectory() && !stats.isSymbolicLink()) {
        results.push(...scanDir(fullPath, depth + 1));
      }
    } catch (e) {
      results.push(`${"  ".repeat(depth)}⚠️ ERROR reading ${relativePath}`);
    }
  }
  return results;
}

console.log("📦 Scanning project structure from:", ROOT_DIR);
console.log("-------------------------------------------\n");
scanDir(ROOT_DIR).forEach((line) => console.log(line));
