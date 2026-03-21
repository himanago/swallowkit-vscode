import * as vscode from "vscode";

export class DevServerManager {
  private statusBarItem: vscode.StatusBarItem;
  private running: boolean = false;

  constructor(context: vscode.ExtensionContext) {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    this.statusBarItem.command = "swallowkit.toggleDev";
    context.subscriptions.push(this.statusBarItem);

    // Register toggle command
    const toggleDisposable = vscode.commands.registerCommand(
      "swallowkit.toggleDev",
      () => {
        if (this.running) {
          vscode.commands.executeCommand("swallowkit.stopDev");
        } else {
          vscode.commands.executeCommand("swallowkit.startDev");
        }
      }
    );
    context.subscriptions.push(toggleDisposable);
  }

  show(): void {
    this.updateStatusBar();
    this.statusBarItem.show();
  }

  hide(): void {
    this.statusBarItem.hide();
  }

  setRunning(running: boolean): void {
    this.running = running;
    this.updateStatusBar();
  }

  private updateStatusBar(): void {
    if (this.running) {
      this.statusBarItem.text = "$(play-circle) SwallowKit: Running";
      this.statusBarItem.tooltip = "Click to stop dev server";
      this.statusBarItem.backgroundColor = new vscode.ThemeColor(
        "statusBarItem.warningBackground"
      );
    } else {
      this.statusBarItem.text = "$(circle-outline) SwallowKit";
      this.statusBarItem.tooltip = "Click to start dev server";
      this.statusBarItem.backgroundColor = undefined;
    }
  }
}
