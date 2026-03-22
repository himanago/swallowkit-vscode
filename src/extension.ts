import * as vscode from "vscode";
import * as cp from "child_process";
import { registerInitCommand } from "./commands/init";
import { registerCreateModelCommand } from "./commands/createModel";
import { registerCreateDevSeedsCommand } from "./commands/createDevSeeds";
import { registerScaffoldCommands } from "./commands/scaffold";
import { registerDevCommands } from "./commands/dev";
import { registerProvisionCommand } from "./commands/provision";
import { registerOpenDocsCommand } from "./commands/openDocs";
import { DevServerManager } from "./features/devServerManager";
import { isSwallowKitProject } from "./features/projectDetector";
import { detectPackageManager, getRunPrefix } from "./utils/packageManager";

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
  const pm = detectPackageManager();
  const prefix = getRunPrefix(pm);
  const cmd = pm === "pnpm" ? "pnpm dlx swallowkit --version" : "npx --yes swallowkit --version";
  cp.exec(cmd, { timeout: 15000 }, (error) => {
    if (error) {
      const installCmd = pm === "pnpm" ? "pnpm add -g swallowkit" : "npm install -g swallowkit";
      vscode.window
        .showWarningMessage(
          `SwallowKit CLI が見つかりません。\`${installCmd}\` でグローバルインストールするか、${prefix} 経由で利用可能にしてください。`,
          "Open Documentation"
        )
        .then((choice) => {
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
