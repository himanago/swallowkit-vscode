import * as vscode from "vscode";
import { registerInitCommand } from "./commands/init";
import { registerCreateModelCommand } from "./commands/createModel";
import { registerScaffoldCommands } from "./commands/scaffold";
import { registerDevCommands } from "./commands/dev";
import { registerProvisionCommand } from "./commands/provision";
import { registerOpenDocsCommand } from "./commands/openDocs";
import { DevServerManager } from "./features/devServerManager";
import { isSwallowKitProject } from "./features/projectDetector";

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  // Initialize dev server manager (status bar)
  const devServerManager = new DevServerManager(context);

  // Register all commands
  registerInitCommand(context);
  registerCreateModelCommand(context);
  registerScaffoldCommands(context);
  registerDevCommands(context, (running) => {
    devServerManager.setRunning(running);
  });
  registerProvisionCommand(context);
  registerOpenDocsCommand(context);

  // Show status bar if this is a SwallowKit project
  const detected = await isSwallowKitProject();
  if (detected) {
    devServerManager.show();
  }

  // Also watch for config files appearing later
  const watcher = vscode.workspace.createFileSystemWatcher(
    "**/{swallowkit.config.*,shared/models/*.ts,functions/host.json}"
  );
  watcher.onDidCreate(async () => {
    if (await isSwallowKitProject()) {
      devServerManager.show();
    }
  });
  context.subscriptions.push(watcher);

  // Check if swallowkit CLI is available
  checkCliAvailability();
}

function checkCliAvailability(): void {
  const { exec } = require("child_process") as typeof import("child_process");
  exec("npx swallowkit --version", { timeout: 10000 }, (error) => {
    if (error) {
      vscode.window.showWarningMessage(
        "SwallowKit CLI not found. Run `npm install -g swallowkit` or ensure it is available via npx.",
        "Open Documentation"
      ).then((choice) => {
        if (choice === "Open Documentation") {
          vscode.commands.executeCommand("swallowkit.openDocs");
        }
      });
    }
  });
}

export function deactivate(): void {
  // Cleanup handled by subscriptions
}
