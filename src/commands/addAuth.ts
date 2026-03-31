import * as vscode from "vscode";
import { runInTerminal } from "../utils/terminal";
import { detectPackageManager, getRunPrefix } from "../utils/packageManager";

interface ValueQuickPickItem<T> extends vscode.QuickPickItem {
  value: T;
}

type AuthProvider = "custom-jwt" | "swa" | "swa-custom" | "none";

export function registerAddAuthCommand(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand(
    "swallowkit.addAuth",
    async () => {
      const providerPick = await vscode.window.showQuickPick<ValueQuickPickItem<AuthProvider>>(
        [
          {
            label: "Custom JWT（推奨）",
            description: "外部 RDB ユーザーストア + JWT トークン認証",
            value: "custom-jwt",
          },
          {
            label: "Static Web Apps 認証",
            description: "Azure Static Web Apps 組み込み認証",
            value: "swa",
          },
          {
            label: "Static Web Apps + カスタム",
            description: "SWA 認証 + カスタムロール拡張",
            value: "swa-custom",
          },
          {
            label: "なし",
            description: "認証を追加しない",
            value: "none",
          },
        ],
        { placeHolder: "認証プロバイダーを選択" }
      );
      if (!providerPick) {
        return;
      }

      const pm = detectPackageManager();
      const prefix = getRunPrefix(pm);

      runInTerminal(
        "🐦 SwallowKit",
        `${prefix} swallowkit add-auth --provider ${providerPick.value}`
      );

      if (providerPick.value !== "none") {
        void vscode.window.showInformationMessage(
          `認証プロバイダー "${providerPick.label}" をプロジェクトに追加中です。`
        );
      }
    }
  );

  context.subscriptions.push(disposable);
}
