import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import type { FocusConfig } from "./config";

export interface MarkedFile {
  path: string;
  line: number;
  content: string;
}

export function findMarkedFiles(
  dir: string,
  config: FocusConfig,
  maxDepth: number = 10
): MarkedFile[] {
  const results: MarkedFile[] = [];
  walk(dir, config, maxDepth, 0, results, new Set());
  return results;
}

function walk(
  dir: string,
  config: FocusConfig,
  maxDepth: number,
  depth: number,
  results: MarkedFile[],
  visited: Set<string>
): void {
  if (depth > maxDepth) return;

  let entries: ReturnType<typeof readdirSync>;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;

    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      const realPath = realpath(fullPath);
      if (visited.has(realPath)) continue;
      visited.add(realPath);
      walk(fullPath, config, maxDepth, depth + 1, results, visited);
    } else if (entry.isFile()) {
      scanFile(fullPath, config, results);
    }
  }
}

function realpath(path: string): string {
  try {
    const { realpathSync } = require("node:fs");
    return realpathSync(path);
  } catch {
    return path;
  }
}

function scanFile(filePath: string, config: FocusConfig, results: MarkedFile[]): void {
  let content: string;
  try {
    content = readFileSync(filePath, "utf-8");
  } catch {
    return;
  }

  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(config.marker)) {
      results.push({
        path: filePath,
        line: i + 1,
        content,
      });
      return; // One match per file
    }
  }
}
