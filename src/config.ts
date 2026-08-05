import { join } from "node:path";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { CONFIG_DIR_NAME, type ExtensionContext } from "@earendil-works/pi-coding-agent";

export interface FocusConfig {
  /** The marker to search for in files (default: "//<pi>") */
  marker: string;
}

const DEFAULTS: FocusConfig = {
  marker: "<pi*>",
};

export function loadConfig(ctx: ExtensionContext): FocusConfig {
  const globalPath = join(homedir(), ".pi", "pi-spot.json");
  const projectPath = join(ctx.cwd, CONFIG_DIR_NAME, "pi-spot.json");

  let config = { ...DEFAULTS };

  // Load global config
  try {
    const raw = readFileSync(globalPath, "utf-8");
    config = { ...config, ...JSON.parse(raw) };
  } catch {
    // No global config, use defaults
  }

  // Load project config (overrides global)
  if (ctx.isProjectTrusted()) {
    try {
      const raw = readFileSync(projectPath, "utf-8");
      config = { ...config, ...JSON.parse(raw) };
    } catch {
      // No project config
    }
  }

  return config;
}
