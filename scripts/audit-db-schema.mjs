#!/usr/bin/env node
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const migrationsDir = "supabase/migrations";
const appDirs = ["apps/web/src", "apps/mobile/src"];

const migrationFiles = readdirSync(migrationsDir)
  .filter((name) => name.endsWith(".sql"))
  .sort();

const duplicateVersions = new Map();
for (const file of migrationFiles) {
  const [version] = file.split("_");
  if (!duplicateVersions.has(version)) duplicateVersions.set(version, []);
  duplicateVersions.get(version).push(file);
}

const duplicates = [...duplicateVersions.entries()].filter(([, files]) => files.length > 1);

const sql = migrationFiles
  .map((file) => readFileSync(join(migrationsDir, file), "utf8"))
  .join("\n\n");

const createTableRegex = /create table(?: if not exists)?\s+public\.([a-zA-Z0-9_]+)/gi;
const createdTables = new Set();
for (const match of sql.matchAll(createTableRegex)) {
  createdTables.add(match[1]);
}

const createFunctionRegex = /create\s+or\s+replace\s+function\s+public\.([a-zA-Z0-9_]+)/gi;
const createdFunctions = new Set();
for (const match of sql.matchAll(createFunctionRegex)) {
  createdFunctions.add(match[1]);
}

const appFilePaths = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (/\.(ts|tsx)$/.test(entry.name)) appFilePaths.push(fullPath);
  }
};
for (const dir of appDirs) walk(dir);

const fromRegex = /\.from\(\s*["']([a-zA-Z0-9_]+)["']\s*\)/g;
const rpcRegex = /\.rpc\(\s*["']([a-zA-Z0-9_]+)["']/g;

const usedTables = new Set();
const usedRpcs = new Set();
for (const file of appFilePaths) {
  const content = readFileSync(file, "utf8");
  for (const match of content.matchAll(fromRegex)) usedTables.add(match[1]);
  for (const match of content.matchAll(rpcRegex)) usedRpcs.add(match[1]);
}

const missingTables = [...usedTables].filter((table) => !createdTables.has(table)).sort();
const missingRpcs = [...usedRpcs].filter((fn) => !createdFunctions.has(fn)).sort();

const report = {
  migration_files: migrationFiles.length,
  duplicate_versions: duplicates.map(([version, files]) => ({ version, files })),
  code_tables: [...usedTables].sort(),
  missing_tables_in_migrations: missingTables,
  code_rpcs: [...usedRpcs].sort(),
  missing_rpcs_in_migrations: missingRpcs,
};

console.log(JSON.stringify(report, null, 2));

if (duplicates.length > 0 || missingTables.length > 0 || missingRpcs.length > 0) {
  process.exitCode = 1;
}
