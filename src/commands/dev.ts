import * as vscode from "vscode";
import { getOrCreateTerminal } from "../utils/terminal";

const DEV_TERMINAL_NAME = "🐦 SwallowKit Dev";

export function registerDevCommands(
  context: vscode.ExtensionContext,
  onStatusChange: (running: boolean) => void
): void {
  const startDisposable = vscode.commands.registerCommand(
    "swallowkit.startDev",
    () => {
      const terminal = getOrCreateTerminal(DEV_TERMINAL_NAME);
      terminal.show();
      terminal.sendText("npx swallowkit dev");
      onStatusChange(true);
    }
  );

  const stopDisposable = vscode.commands.registerCommand(
    "swallowkit.stopDev",
    () => {
      const terminal = vscode.window.terminals.find(
        (t) => t.name === DEV_TERMINAL_NAME
      );
      if (terminal) {
        terminal.dispose();
      }
      onStatusChange(false);
    }
  );

  // Track terminal disposal to update status
  const onClose = vscode.window.onDidCloseTerminal((terminal) => {
    if (terminal.name === DEV_TERMINAL_NAME) {
      onStatusChange(false);
    }
  });

  context.subscriptions.push(startDisposable, stopDisposable, onClose);
}

export function isDevServerRunning(): boolean {
  return vscode.window.terminals.some((t) => t.name === DEV_TERMINAL_NAME);
}
