import * as vscode from "vscode";

const SWALLOWKIT_DOCS_URL = "https://himanago.github.io/swallowkit/";

export function registerOpenDocsCommand(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand(
    "swallowkit.openDocs",
    () => {
      vscode.env.openExternal(vscode.Uri.parse(SWALLOWKIT_DOCS_URL));
    }
  );

  context.subscriptions.push(disposable);
}
