import * as vscode from "vscode";
import { detectPackageManager, getRunPrefix } from "../utils/packageManager";
import { runInTerminal } from "../utils/terminal";

interface StatusModeQuickPickItem extends vscode.QuickPickItem {
  artifacts: boolean;
}

export function registerStatusCommand(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand("swallowkit.status", async () => {
    const modePick = await vscode.window.showQuickPick<StatusModeQuickPickItem>(
      [
        { label: vscode.l10n.t("Summary"), description: vscode.l10n.t("Show generated artifact status and drift"), artifacts: false },
        { label: vscode.l10n.t("With artifact list"), description: vscode.l10n.t("Use --artifacts to list all artifacts with ownership"), artifacts: true },
      ],
      { placeHolder: vscode.l10n.t("Select what to display") }
    );
    if (!modePick) {
      return;
    }

    const pm = detectPackageManager();
    const prefix = getRunPrefix(pm);
    const flags = modePick.artifacts ? " --artifacts" : "";
    runInTerminal("🐦 SwallowKit", `${prefix} swallowkit status${flags}`);
  });

  context.subscriptions.push(disposable);
}
