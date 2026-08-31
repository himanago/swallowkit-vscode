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

interface SeedSourceChoice extends vscode.QuickPickItem {
  fromEmulator: boolean;
}

export function registerCreateDevSeedsCommand(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand(
    "swallowkit.createDevSeeds",
    async () => {
      const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!workspaceRoot) {
        vscode.window.showErrorMessage(vscode.l10n.t("No workspace folder open."));
        return;
      }

      const sourceChoice = await vscode.window.showQuickPick<SeedSourceChoice>(
        [
          {
            label: vscode.l10n.t("Generate templates from models"),
            description: vscode.l10n.t("Create seed JSON stubs from the schemas in shared/models"),
            fromEmulator: false,
          },
          {
            label: vscode.l10n.t("Export from the Cosmos DB Emulator"),
            description: vscode.l10n.t("Save the local emulator's current data as seeds (--from-emulator)"),
            fromEmulator: true,
          },
        ],
        { placeHolder: vscode.l10n.t("Choose how to create seed data") }
      );
      if (!sourceChoice) {
        return;
      }

      const environment = await vscode.window.showInputBox({
        prompt: vscode.l10n.t("Enter dev seed environment name"),
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
              label: vscode.l10n.t("Keep existing JSON files"),
              description: vscode.l10n.t("Run create-dev-seeds without --force"),
              overwrite: false,
            },
            {
              label: vscode.l10n.t("Overwrite existing JSON files"),
              description: vscode.l10n.t("Run create-dev-seeds with --force"),
              overwrite: true,
            },
          ],
          {
            placeHolder: vscode.l10n.t('Environment "{0}" already exists. How should existing seed files be handled?', environmentName),
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
      const fromEmulatorFlag = sourceChoice.fromEmulator ? " --from-emulator" : "";

      runInTerminal(
        "🐦 SwallowKit",
        `${prefix} swallowkit create-dev-seeds ${environmentName}${fromEmulatorFlag}${forceFlag}`
      );

      vscode.window.showInformationMessage(
        sourceChoice.fromEmulator
          ? vscode.l10n.t("Exporting emulator data to dev-seeds/{0}/. Start the dev server with the same seed environment to restore it.", environmentName)
          : vscode.l10n.t("Generating dev seed templates in dev-seeds/{0}/. Edit the JSON files, then start the dev server with the same seed environment.", environmentName)
      );
    }
  );

  context.subscriptions.push(disposable);
}
