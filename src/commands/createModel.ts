import * as vscode from "vscode";
import * as path from "path";
import { runInTerminal } from "../utils/terminal";
import { detectPackageManager, getRunPrefix } from "../utils/packageManager";

export function registerCreateModelCommand(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand(
    "swallowkit.createModel",
    async (folderUri?: vscode.Uri) => {
      const input = await vscode.window.showInputBox({
        prompt: "Enter model name(s) (comma-separated for multiple)",
        placeHolder: "User, Product, Order",
        validateInput: (value) => {
          if (!value || value.trim() === "") {
            return "Model name cannot be empty";
          }
          return undefined;
        },
      });

      if (!input) {
        return;
      }

      const names = input
        .split(",")
        .map((n) => n.trim())
        .filter((n) => n.length > 0);

      if (names.length === 0) {
        return;
      }

      // Determine workspace folder — prefer folderUri from context menu, fall back to first workspace
      let workspaceRoot: string | undefined;
      if (folderUri) {
        const folder = vscode.workspace.getWorkspaceFolder(folderUri);
        workspaceRoot = folder?.uri.fsPath;
      }
      if (!workspaceRoot) {
        workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      }
      if (!workspaceRoot) {
        vscode.window.showErrorMessage("No workspace folder open.");
        return;
      }

      const pm = detectPackageManager();
      const prefix = getRunPrefix(pm);
      const terminal = runInTerminal(
        "🐦 SwallowKit",
        `${prefix} swallowkit create-model ${names.join(" ")}`
      );

      // Watch for newly created model files and auto-open them
      const modelsDir = path.join(workspaceRoot, "shared", "models");
      const watcher = vscode.workspace.createFileSystemWatcher(
        new vscode.RelativePattern(modelsDir, "*.ts")
      );

      const openedFiles = new Set<string>();
      const disposeWatcher = () => {
        watcher.dispose();
      };

      watcher.onDidCreate(async (uri) => {
        if (!openedFiles.has(uri.fsPath)) {
          openedFiles.add(uri.fsPath);
          const doc = await vscode.workspace.openTextDocument(uri);
          await vscode.window.showTextDocument(doc, { preview: false });
        }
      });

      // Stop watching after a reasonable timeout (30 seconds)
      setTimeout(disposeWatcher, 30000);

      context.subscriptions.push(watcher);
    }
  );

  context.subscriptions.push(disposable);
}
