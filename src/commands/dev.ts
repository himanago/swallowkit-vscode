import * as vscode from "vscode";
import { detectPackageManager, getRunPrefix } from "../utils/packageManager";

const DEV_TERMINAL_NAME = "🐦 SwallowKit Dev";

let devRunning = false;

export function registerDevCommands(
  context: vscode.ExtensionContext,
  onStatusChange: (running: boolean) => void
): void {
  const setRunning = (running: boolean) => {
    devRunning = running;
    onStatusChange(running);
  };

  const startDisposable = vscode.commands.registerCommand(
    "swallowkit.startDev",
    () => {
      // Prevent double-start
      const existing = vscode.window.terminals.find(
        (t) => t.name === DEV_TERMINAL_NAME
      );
      if (existing && devRunning) {
        existing.show();
        vscode.window.showInformationMessage(
          "SwallowKit dev server is already running."
        );
        return;
      }

      const pm = detectPackageManager();
      const prefix = getRunPrefix(pm);
      const terminal = existing ?? vscode.window.createTerminal(DEV_TERMINAL_NAME);
      terminal.show();
      terminal.sendText(`${prefix} swallowkit dev`);
      setRunning(true);
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
      setRunning(false);
    }
  );

  // Track terminal disposal to update status
  const onClose = vscode.window.onDidCloseTerminal((terminal) => {
    if (terminal.name === DEV_TERMINAL_NAME) {
      setRunning(false);
    }
  });

  context.subscriptions.push(startDisposable, stopDisposable, onClose);
}
