import * as vscode from "vscode";

/**
 * Gets or creates a named terminal.
 */
export function getOrCreateTerminal(name: string): vscode.Terminal {
  const existing = vscode.window.terminals.find((t) => t.name === name);
  if (existing) {
    return existing;
  }
  return vscode.window.createTerminal(name);
}

/**
 * Sends a command to a named terminal, creating it if needed.
 */
export function runInTerminal(terminalName: string, command: string): vscode.Terminal {
  const terminal = getOrCreateTerminal(terminalName);
  terminal.show();
  terminal.sendText(command);
  return terminal;
}
