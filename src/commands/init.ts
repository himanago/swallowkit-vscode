import * as vscode from "vscode";
import { runInTerminal } from "../utils/terminal";

export function registerInitCommand(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand("swallowkit.init", async () => {
    const projectName = await vscode.window.showInputBox({
      prompt: "Enter project name",
      placeHolder: "my-swallowkit-app",
      validateInput: (value) => {
        if (!value || value.trim() === "") {
          return "Project name cannot be empty";
        }
        return undefined;
      },
    });

    if (!projectName) {
      return;
    }

    runInTerminal("🐦 SwallowKit", `npx swallowkit init ${projectName.trim()}`);
  });

  context.subscriptions.push(disposable);
}
