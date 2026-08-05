import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  pi.registerCommand("focus", {
    description: "Scan for marked files and process the first one",
    handler: async (args, ctx) => {
      ctx.ui.notify("focus: not yet implemented", "info");
    },
  });
}
