import * as fs from "fs";
import * as vscode from "vscode";
import { detectPackageManager, getRunPrefix } from "../utils/packageManager";
import { runInTerminal } from "../utils/terminal";
import {
  getDevSeedEnvironmentDir,
  validateDevSeedEnvironmentName,
} from "../utils/devSeeds";

interface ExistingSeedFilesChoice extends vscode.QuickPickItem {
  overwrite: boolean;
}

export function registerCreateDevSeedsCommand(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand(
    "swallowkit.createDevSeeds",
    async () => {
      const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!workspaceRoot) {
        vscode.window.showErrorMessage("No workspace folder open.");
        return;
      }

      const environment = await vscode.window.showInputBox({
        prompt: "Enter dev seed environment name",
        placeHolder: "local",
        validateInput: validateDevSeedEnvironmentName,
      });
      if (!environment) {
        return;
      }

      const environmentName = environment.trim();
      const environmentDir = getDevSeedEnvironmentDir(workspaceRoot, environmentName);
      let overwriteExisting = false;

      if (fs.existsSync(environmentDir)) {
        const choice = await vscode.window.showQuickPick<ExistingSeedFilesChoice>(
          [
            {
              label: "Keep existing JSON files",
              description: "Run create-dev-seeds without --force",
              overwrite: false,
            },
            {
              label: "Overwrite existing JSON files",
              description: "Run create-dev-seeds with --force",
              overwrite: true,
            },
          ],
          {
            placeHolder: `Environment "${environmentName}" already exists. How should existing seed files be handled?`,
          }
        );

        if (!choice) {
          return;
        }

        overwriteExisting = choice.overwrite;
      }

      const pm = detectPackageManager();
      const prefix = getRunPrefix(pm);
      const forceFlag = overwriteExisting ? " --force" : "";

      runInTerminal(
        "🐦 SwallowKit",
        `${prefix} swallowkit create-dev-seeds ${environmentName}${forceFlag}`
      );

      vscode.window.showInformationMessage(
        `Generating dev seed templates in dev-seeds/${environmentName}/. Edit the JSON files, then start the dev server with the same seed environment.`
      );
    }
  );

  context.subscriptions.push(disposable);
}
