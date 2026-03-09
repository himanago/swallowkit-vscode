import * as vscode from "vscode";
import { runInTerminal } from "../utils/terminal";
import { detectPackageManager, getRunPrefix } from "../utils/packageManager";

const LOCATION_OPTIONS = [
  { label: "Japan East", value: "japaneast" },
  { label: "Japan West", value: "japanwest" },
  { label: "East US 2", value: "eastus2" },
  { label: "West Europe", value: "westeurope" },
];

export function registerProvisionCommand(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand(
    "swallowkit.provision",
    async () => {
      const resourceGroup = await vscode.window.showInputBox({
        prompt: "Enter resource group name",
        placeHolder: "my-resource-group",
        validateInput: (value) => {
          if (!value || value.trim() === "") {
            return "Resource group name cannot be empty";
          }
          return undefined;
        },
      });

      if (!resourceGroup) {
        return;
      }

      const locationItem = await vscode.window.showQuickPick(
        LOCATION_OPTIONS.map((l) => ({ label: l.label, description: l.value })),
        { placeHolder: "Select Azure location" }
      );

      if (!locationItem) {
        return;
      }

      const location = locationItem.description!;

      const subscription = await vscode.window.showInputBox({
        prompt: "Enter subscription ID (optional, press Enter to skip)",
        placeHolder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      });

      const pm = detectPackageManager();
      const prefix = getRunPrefix(pm);
      let command = `${prefix} swallowkit provision -g ${resourceGroup.trim()} -l ${location}`;
      if (subscription && subscription.trim() !== "") {
        command += ` --subscription ${subscription.trim()}`;
      }

      runInTerminal("🐦 SwallowKit", command);
    }
  );

  context.subscriptions.push(disposable);
}
