import * as vscode from "vscode";
import { runInTerminal } from "../utils/terminal";
import { detectPackageManager, getRunPrefix } from "../utils/packageManager";

interface ValueQuickPickItem<T> extends vscode.QuickPickItem {
  value: T;
}

type ConnectorType = "rdb" | "api";
type RdbProvider = "mysql" | "postgres" | "sqlserver";

export function registerAddConnectorCommand(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand(
    "swallowkit.addConnector",
    async () => {
      // 1. Enter connector name
      const connectorName = await vscode.window.showInputBox({
        prompt: "Enter connector name",
        placeHolder: "mysql",
        validateInput: (value) => {
          if (!value || value.trim() === "") {
            return "Connector name cannot be empty";
          }
          if (/[^a-zA-Z0-9-_]/.test(value.trim())) {
            return "Connector name can only contain letters, numbers, hyphens, and underscores";
          }
          return undefined;
        },
      });
      if (!connectorName) {
        return;
      }

      // 2. Select connector type
      const typePick = await vscode.window.showQuickPick<ValueQuickPickItem<ConnectorType>>(
        [
          {
            label: "RDB（リレーショナルデータベース）",
            description: "MySQL / PostgreSQL / SQL Server",
            value: "rdb",
          },
          {
            label: "API（REST API）",
            description: "外部 REST API エンドポイント",
            value: "api",
          },
        ],
        { placeHolder: "コネクタの種類を選択" }
      );
      if (!typePick) {
        return;
      }

      // 3. If RDB, select provider
      let providerFlag = "";
      if (typePick.value === "rdb") {
        const providerPick = await vscode.window.showQuickPick<ValueQuickPickItem<RdbProvider>>(
          [
            { label: "MySQL", value: "mysql" },
            { label: "PostgreSQL", value: "postgres" },
            { label: "SQL Server", value: "sqlserver" },
          ],
          { placeHolder: "RDB プロバイダーを選択" }
        );
        if (!providerPick) {
          return;
        }
        providerFlag = ` --provider ${providerPick.value}`;
      }

      const pm = detectPackageManager();
      const prefix = getRunPrefix(pm);
      const name = connectorName.trim();

      runInTerminal(
        "🐦 SwallowKit",
        `${prefix} swallowkit add-connector ${name} --type ${typePick.value}${providerFlag}`
      );

      void vscode.window.showInformationMessage(
        `コネクタ "${name}" を追加中です。完了後、swallowkit create-model <name> --connector=${name} でモデルを作成できます。`
      );
    }
  );

  context.subscriptions.push(disposable);
}
