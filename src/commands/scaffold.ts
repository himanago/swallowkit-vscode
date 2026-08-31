import * as vscode from "vscode";
import * as path from "path";
import { runInTerminal } from "../utils/terminal";
import { detectPackageManager, getRunPrefix } from "../utils/packageManager";

async function pickModelFile(): Promise<vscode.Uri | undefined> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showErrorMessage(vscode.l10n.t("No workspace folder open."));
    return undefined;
  }

  const modelFiles = await vscode.workspace.findFiles(
    "{shared/models/*.ts,lib/models/*.ts}",
    "**/node_modules/**"
  );

  if (modelFiles.length === 0) {
    vscode.window.showErrorMessage(
      vscode.l10n.t("No model files found in shared/models/ or lib/models/.")
    );
    return undefined;
  }

  const items = modelFiles.map((uri) => ({
    label: path.basename(uri.fsPath),
    description: vscode.workspace.asRelativePath(uri),
    uri,
  }));

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: vscode.l10n.t("Select a model file to scaffold"),
  });

  return selected?.uri;
}

function runScaffold(fileUri: vscode.Uri, options: { apiOnly?: boolean; dryRun?: boolean } = {}): void {
  const pm = detectPackageManager();
  const prefix = getRunPrefix(pm);
  const filePath = vscode.workspace.asRelativePath(fileUri);
  let flags = "";
  if (options.apiOnly) {
    flags += " --api-only";
  }
  if (options.dryRun) {
    flags += " --dry-run";
  }
  runInTerminal("🐦 SwallowKit", `${prefix} swallowkit scaffold ${filePath}${flags}`);
}

export function registerScaffoldCommands(context: vscode.ExtensionContext): void {
  const scaffoldDisposable = vscode.commands.registerCommand(
    "swallowkit.scaffold",
    async (fileUri?: vscode.Uri) => {
      const uri = fileUri ?? (await pickModelFile());
      if (!uri) {
        return;
      }
      runScaffold(uri);
    }
  );

  const scaffoldApiOnlyDisposable = vscode.commands.registerCommand(
    "swallowkit.scaffoldApiOnly",
    async (fileUri?: vscode.Uri) => {
      const uri = fileUri ?? (await pickModelFile());
      if (!uri) {
        return;
      }
      runScaffold(uri, { apiOnly: true });
    }
  );

  const scaffoldDryRunDisposable = vscode.commands.registerCommand(
    "swallowkit.scaffoldDryRun",
    async (fileUri?: vscode.Uri) => {
      const uri = fileUri ?? (await pickModelFile());
      if (!uri) {
        return;
      }
      runScaffold(uri, { dryRun: true });
    }
  );

  context.subscriptions.push(scaffoldDisposable, scaffoldApiOnlyDisposable, scaffoldDryRunDisposable);
}
