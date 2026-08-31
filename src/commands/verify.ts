import * as vscode from "vscode";
import { detectPackageManager, getRunPrefix } from "../utils/packageManager";
import { runInTerminal } from "../utils/terminal";

interface VerifyCheckQuickPickItem extends vscode.QuickPickItem {
  checkId: string;
}

export function registerVerifyCommand(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand("swallowkit.verify", async () => {
    const picks = await vscode.window.showQuickPick<VerifyCheckQuickPickItem>(
      [
        { label: "structure", description: vscode.l10n.t("Validate the project structure"), checkId: "structure", picked: true },
        { label: "drift", description: vscode.l10n.t("Detect drift against generated artifacts"), checkId: "drift", picked: true },
        { label: "typecheck", description: vscode.l10n.t("Run the TypeScript type check"), checkId: "typecheck", picked: true },
      ],
      {
        placeHolder: vscode.l10n.t("Select checks to run (empty selection runs all)"),
        canPickMany: true,
      }
    );
    if (!picks) {
      return;
    }

    const pm = detectPackageManager();
    const prefix = getRunPrefix(pm);
    // Empty or full selection means default (all checks)
    const flags =
      picks.length > 0 && picks.length < 3
        ? ` --checks ${picks.map((p) => p.checkId).join(",")}`
        : "";
    runInTerminal("🐦 SwallowKit", `${prefix} swallowkit verify${flags}`);
  });

  context.subscriptions.push(disposable);
}
