import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { loadConfig } from "./config";
import { findMarkedFiles } from "./scanner";


/**
 * Returns the system-level focus instructions injected into the agent session.
 * These instructions tell the agent to make minimal changes and only follow
 * markers matching the configured pattern.
 */
function getFocusInstructions(marker: string): string {
  return `You have been given a file to work on. Rules:
1. Edit as few files as possible
2. Only follow instructions marked with ${marker} in the code
3. Make minimal, targeted changes
4. Do not refactor or modify unrelated code`;
}

export default function (pi: ExtensionAPI) {
  pi.registerCommand("focus", {
    description: "Scan for marked files and inject into session",
    handler: async (args, ctx) => {
      const config = loadConfig(ctx);

      const files = findMarkedFiles(ctx.cwd, config);

      ctx.ui.notify(`Marker: "${config.marker}" | Found ${files.length} file(s)`, "info");

      if (files.length === 0) {
        return;
      }

      // Use only the first marked file — the extension is designed for
      // single-file focus mode, not batch editing.
      const target = files[0];

      const fileContent = [
        `[File: ${target.path}]`,
        "```",
        target.content,
        "```",
      ].join("\n");

      // Inject file content
      pi.sendMessage(
        {
          customType: "pi-focus",
          content: fileContent,
          display: true,
        },
        { triggerTurn: false }
      );

      // Trigger agent with instructions
      pi.sendUserMessage(getFocusInstructions(config.marker), { deliverAs: "followUp" });

      ctx.ui.notify(`Focused: ${target.path}`, "info");
    },
  });
}
