import * as vscode from "vscode";
import * as path from "path";
import { runInTerminal } from "../utils/terminal";

async function pickModelFile(): Promise<vscode.Uri | undefined> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showErrorMessage("No workspace folder open.");
    return undefined;
  }

  const modelFiles = await vscode.workspace.findFiles(
    "{shared/models/*.ts,lib/models/*.ts}",
    "**/node_modules/**"
  );

  if (modelFiles.length === 0) {
    vscode.window.showErrorMessage(
      "No model files found in shared/models/ or lib/models/."
    );
    return undefined;
  }

  const items = modelFiles.map((uri) => ({
    label: path.basename(uri.fsPath),
    description: vscode.workspace.asRelativePath(uri),
    uri,
  }));

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: "Select a model file to scaffold",
  });

  return selected?.uri;
}

function runScaffold(fileUri: vscode.Uri, apiOnly: boolean): void {
  const filePath = vscode.workspace.asRelativePath(fileUri);
  const flags = apiOnly ? " --api-only" : "";
  runInTerminal("🐦 SwallowKit", `npx swallowkit scaffold ${filePath}${flags}`);
}

export function registerScaffoldCommands(context: vscode.ExtensionContext): void {
  const scaffoldDisposable = vscode.commands.registerCommand(
    "swallowkit.scaffold",
    async (fileUri?: vscode.Uri) => {
      const uri = fileUri ?? (await pickModelFile());
      if (!uri) {
        return;
      }
      runScaffold(uri, false);
    }
  );

  const scaffoldApiOnlyDisposable = vscode.commands.registerCommand(
    "swallowkit.scaffoldApiOnly",
    async (fileUri?: vscode.Uri) => {
      const uri = fileUri ?? (await pickModelFile());
      if (!uri) {
        return;
      }
      runScaffold(uri, true);
    }
  );

  context.subscriptions.push(scaffoldDisposable, scaffoldApiOnlyDisposable);
}
