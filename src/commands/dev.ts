import * as vscode from "vscode";
import { detectPackageManager, getRunPrefix } from "../utils/packageManager";
import {
  listDevSeedEnvironments,
  validateDevSeedEnvironmentName,
} from "../utils/devSeeds";
import { listConnectorNames } from "../utils/connectors";

const DEV_TERMINAL_NAME = "🐦 SwallowKit Dev";

let devRunning = false;

interface SeedEnvironmentQuickPickItem extends vscode.QuickPickItem {
  environment?: string;
  manualEntry?: boolean;
}

async function promptForSeedEnvironment(): Promise<string | undefined | null> {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    return undefined;
  }

  const environments = listDevSeedEnvironments(workspaceRoot);
  if (environments.length === 0) {
    return undefined;
  }

  const selection = await vscode.window.showQuickPick<SeedEnvironmentQuickPickItem>(
    [
      {
        label: vscode.l10n.t("Start without seed data"),
        description: vscode.l10n.t("Run swallowkit dev without --seed-env"),
      },
      ...environments.map((environment) => ({
        label: environment,
        description: vscode.l10n.t("Apply dev-seeds/{0} before startup", environment),
        environment,
      })),
      {
        label: vscode.l10n.t("Enter environment name..."),
        description: vscode.l10n.t("Use a custom seed environment manually"),
        manualEntry: true,
      },
    ],
    {
      placeHolder: vscode.l10n.t("Choose a dev seed environment (optional)"),
    }
  );

  if (!selection) {
    return null;
  }

  if (selection.manualEntry) {
    const input = await vscode.window.showInputBox({
      prompt: vscode.l10n.t("Enter dev seed environment name"),
      placeHolder: environments[0],
      validateInput: validateDevSeedEnvironmentName,
    });

    if (input === undefined) {
      return null;
    }

    return input.trim();
  }

  return selection.environment;
}

async function promptForMockConnectors(): Promise<boolean | null> {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    return false;
  }

  const connectorNames = listConnectorNames(workspaceRoot);
  if (connectorNames.length === 0) {
    return false;
  }

  const namesLabel = connectorNames.join(", ");
  const selection = await vscode.window.showQuickPick(
    [
      {
        label: vscode.l10n.t("Do not use mock connectors"),
        description: vscode.l10n.t("Connect to the real external data sources"),
        mock: false,
      },
      {
        label: vscode.l10n.t("Start mock connectors (--mock-connectors)"),
        description: vscode.l10n.t("Serve {0} from a mock server instead", namesLabel),
        mock: true,
      },
    ],
    { placeHolder: vscode.l10n.t("Choose how connectors ({0}) run", namesLabel) }
  );

  if (!selection) {
    return null;
  }

  return selection.mock;
}

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
    async () => {
      // Prevent double-start
      const existing = vscode.window.terminals.find(
        (t) => t.name === DEV_TERMINAL_NAME
      );
      if (existing && devRunning) {
        existing.show();
        vscode.window.showInformationMessage(
          vscode.l10n.t("SwallowKit dev server is already running.")
        );
        return;
      }

      const seedEnvironment = await promptForSeedEnvironment();
      if (seedEnvironment === null) {
        return;
      }

      const mockConnectors = await promptForMockConnectors();
      if (mockConnectors === null) {
        return;
      }

      const pm = detectPackageManager();
      const prefix = getRunPrefix(pm);
      const terminal = existing ?? vscode.window.createTerminal(DEV_TERMINAL_NAME);
      terminal.show();

      let command = `${prefix} swallowkit dev`;
      if (seedEnvironment) {
        command += ` --seed-env ${seedEnvironment}`;
      }
      if (mockConnectors) {
        command += " --mock-connectors";
      }

      terminal.sendText(command);
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
