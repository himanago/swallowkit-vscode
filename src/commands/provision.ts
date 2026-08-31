import * as vscode from "vscode";
import { runInTerminal } from "../utils/terminal";
import { detectPackageManager, getRunPrefix } from "../utils/packageManager";

export function registerProvisionCommand(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand(
    "swallowkit.provision",
    async () => {
      const resourceGroup = await vscode.window.showInputBox({
        prompt: vscode.l10n.t("Enter resource group name"),
        placeHolder: "my-resource-group",
        validateInput: (value) => {
          if (!value || value.trim() === "") {
            return vscode.l10n.t("Resource group name cannot be empty");
          }
          return undefined;
        },
      });

      if (!resourceGroup) {
        return;
      }

      const subscription = await vscode.window.showInputBox({
        prompt: vscode.l10n.t("Enter subscription ID if you want to switch subscriptions before provisioning (optional)"),
        placeHolder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      });

      const pm = detectPackageManager();
      const prefix = getRunPrefix(pm);
      let command = `${prefix} swallowkit provision -g ${resourceGroup.trim()}`;
      if (subscription && subscription.trim() !== "") {
        command += ` --subscription ${subscription.trim()}`;
      }

      runInTerminal("🐦 SwallowKit", command);
      void vscode.window.showInformationMessage(
        vscode.l10n.t("SwallowKit CLI will ask for the primary Azure location, the Static Web App location, and a final confirmation in the terminal."),
      );
    }
  );

  context.subscriptions.push(disposable);
}
