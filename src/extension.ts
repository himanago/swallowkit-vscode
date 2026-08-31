import * as vscode from "vscode";
import { registerInitCommand } from "./commands/init";
import { registerCreateModelCommand } from "./commands/createModel";
import { registerCreateDevSeedsCommand } from "./commands/createDevSeeds";
import { registerScaffoldCommands } from "./commands/scaffold";
import { registerDevCommands } from "./commands/dev";
import { registerProvisionCommand } from "./commands/provision";
import { registerOpenDocsCommand } from "./commands/openDocs";
import { registerAddAuthCommand } from "./commands/addAuth";
import { registerAddConnectorCommand } from "./commands/addConnector";
import { registerStatusCommand } from "./commands/status";
import { registerVerifyCommand } from "./commands/verify";
import { DevServerManager } from "./features/devServerManager";
import { isSwallowKitProject } from "./features/projectDetector";

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  // Initialize dev server manager (status bar)
  const devServerManager = new DevServerManager(context);

  // Register all commands
  registerInitCommand(context);
  registerCreateModelCommand(context);
  registerCreateDevSeedsCommand(context);
  registerScaffoldCommands(context);
  registerDevCommands(context, (running) => {
    devServerManager.setRunning(running);
  });
  registerProvisionCommand(context);
  registerOpenDocsCommand(context);
  registerAddAuthCommand(context);
  registerAddConnectorCommand(context);
  registerStatusCommand(context);
  registerVerifyCommand(context);

  // Show status bar if this is a SwallowKit project
  const detected = await isSwallowKitProject();
  if (detected) {
    devServerManager.show();
  }

  // Also watch for config files appearing later
  const watcher = vscode.workspace.createFileSystemWatcher(
    "**/{swallowkit.config.*,shared/models/*.ts,functions/host.json,.swallowkit/*}"
  );
  watcher.onDidCreate(async () => {
    if (await isSwallowKitProject()) {
      devServerManager.show();
    }
  });
  context.subscriptions.push(watcher);
}

export function deactivate(): void {
  // Cleanup handled by subscriptions
}
