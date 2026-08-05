import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { loadConfig } from "./config";
import { findMarkedFiles } from "./scanner";


// <pi*> add documentation here please
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

      // <pi*> I'm gonna guess, you're only getting the first file here.
      // that's perfect.
      const target = files[0];

      // <pi*> yeah... make this more understandable, this is a messy line, you can
      // divide in multiple lines.
      const fileContent = "[File: " + target.path + "]\n```\n" + target.content + "\n```";

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
