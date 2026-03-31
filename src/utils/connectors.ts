import * as fs from "fs";
import * as path from "path";

/**
 * Reads connector names from swallowkit.config.js or swallowkit.config.json.
 * Returns an empty array if no config or connectors are found.
 */
export function listConnectorNames(workspaceRoot: string): string[] {
  // Try JSON config first
  const jsonPath = path.join(workspaceRoot, "swallowkit.config.json");
  if (fs.existsSync(jsonPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
      if (config.connectors && typeof config.connectors === "object") {
        return Object.keys(config.connectors).sort();
      }
    } catch {
      // ignore parse errors
    }
    return [];
  }

  // Try JS config — parse connectors keys with a simple regex
  const jsPath = path.join(workspaceRoot, "swallowkit.config.js");
  if (fs.existsSync(jsPath)) {
    try {
      const content = fs.readFileSync(jsPath, "utf-8");
      return parseConnectorNamesFromJS(content);
    } catch {
      // ignore read errors
    }
  }

  return [];
}

/**
 * Extracts connector names from a JS config file's connectors block.
 * Uses a simple regex approach to avoid eval.
 */
function parseConnectorNamesFromJS(content: string): string[] {
  const connectorsMatch = content.match(/connectors\s*:\s*\{([\s\S]*?)\n\s*\}/);
  if (!connectorsMatch) {
    return [];
  }

  const block = connectorsMatch[1];
  const names: string[] = [];
  const keyRegex = /^\s*(\w[\w-]*)\s*:/gm;
  let match: RegExpExecArray | null;
  while ((match = keyRegex.exec(block)) !== null) {
    names.push(match[1]);
  }
  return names.sort();
}
