import * as vscode from "vscode";
import { detectPackageManager, getRunPrefix } from "../utils/packageManager";
import { runInTerminal } from "../utils/terminal";

type ConnectorType = "rdb" | "api";
type RdbProvider = "mysql" | "postgres" | "sqlserver";

interface ConnectorTypeQuickPickItem extends vscode.QuickPickItem {
  type: ConnectorType;
}

interface RdbProviderQuickPickItem extends vscode.QuickPickItem {
  provider: RdbProvider;
}

export function registerAddConnectorCommand(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand("swallowkit.addConnector", async () => {
    const name = await vscode.window.showInputBox({
      prompt: vscode.l10n.t("Enter connector name"),
      placeHolder: "e.g. mysql, backlog",
      validateInput: (value) => {
        if (!value || value.trim() === "") {
          return vscode.l10n.t("Connector name cannot be empty");
        }
        if (/[^a-zA-Z0-9-_]/.test(value.trim())) {
          return vscode.l10n.t("Connector name can only contain letters, numbers, hyphens, and underscores");
        }
        return undefined;
      },
    });
    if (!name) {
      return;
    }

    const typePick = await vscode.window.showQuickPick<ConnectorTypeQuickPickItem>(
      [
        { label: "RDB", description: vscode.l10n.t("Relational database (MySQL / PostgreSQL / SQL Server)"), type: "rdb" },
        { label: "API", description: vscode.l10n.t("External HTTP API"), type: "api" },
      ],
      { placeHolder: vscode.l10n.t("Select the connector type") }
    );
    if (!typePick) {
      return;
    }

    let provider: RdbProvider | undefined;
    if (typePick.type === "rdb") {
      const providerPick = await vscode.window.showQuickPick<RdbProviderQuickPickItem>(
        [
          { label: "MySQL", provider: "mysql" },
          { label: "PostgreSQL", provider: "postgres" },
          { label: "SQL Server", provider: "sqlserver" },
        ],
        { placeHolder: vscode.l10n.t("Select the RDB provider") }
      );
      if (!providerPick) {
        return;
      }
      provider = providerPick.provider;
    }

    const pm = detectPackageManager();
    const prefix = getRunPrefix(pm);
    let command = `${prefix} swallowkit add-connector ${name.trim()} --type ${typePick.type}`;
    if (provider) {
      command += ` --provider ${provider}`;
    }

    runInTerminal("🐦 SwallowKit", command);
  });

  context.subscriptions.push(disposable);
}
