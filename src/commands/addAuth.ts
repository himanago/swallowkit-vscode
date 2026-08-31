import * as vscode from "vscode";
import { detectPackageManager, getRunPrefix } from "../utils/packageManager";
import { runInTerminal } from "../utils/terminal";

type AuthProvider = "custom-jwt" | "swa" | "external-token" | "swa-custom" | "none";

interface AuthProviderQuickPickItem extends vscode.QuickPickItem {
  provider: AuthProvider;
}

export function registerAddAuthCommand(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand("swallowkit.addAuth", async () => {
    const providerPick = await vscode.window.showQuickPick<AuthProviderQuickPickItem>(
      [
        { label: "Custom JWT", description: vscode.l10n.t("Custom login with JWT authentication (default)"), provider: "custom-jwt" },
        { label: "Static Web Apps", description: vscode.l10n.t("SWA built-in authentication (Entra ID, etc.)"), provider: "swa" },
        { label: "External Token", description: vscode.l10n.t("Validate tokens from an external identity provider"), provider: "external-token" },
        { label: "SWA + Custom", description: vscode.l10n.t("Combine SWA authentication with custom authorization"), provider: "swa-custom" },
        { label: vscode.l10n.t("None"), description: vscode.l10n.t("Do not generate auth code (configuration only)"), provider: "none" },
      ],
      { placeHolder: vscode.l10n.t("Select an authentication provider") }
    );
    if (!providerPick) {
      return;
    }

    const scheme = await vscode.window.showInputBox({
      prompt: vscode.l10n.t("Authentication scheme name (optional; leave empty for the default scheme)"),
      placeHolder: "e.g. admin",
      validateInput: (value) => {
        if (value && /[^a-zA-Z0-9-_]/.test(value.trim())) {
          return vscode.l10n.t("Scheme name can only contain letters, numbers, hyphens, and underscores");
        }
        return undefined;
      },
    });
    if (scheme === undefined) {
      return;
    }

    // SWA identity providers are only relevant for SWA-based auth
    let allowedProviders: string | undefined;
    if (providerPick.provider === "swa" || providerPick.provider === "swa-custom") {
      const input = await vscode.window.showInputBox({
        prompt: vscode.l10n.t("Allowed SWA identity providers, comma-separated (optional; defaults to aad)"),
        placeHolder: "e.g. aad,github",
        validateInput: (value) => {
          if (value && /[^a-zA-Z0-9,_-]/.test(value.trim())) {
            return vscode.l10n.t("Comma-separated provider names only (e.g. aad,github)");
          }
          return undefined;
        },
      });
      if (input === undefined) {
        return;
      }
      allowedProviders = input.trim() || undefined;
    }

    const pm = detectPackageManager();
    const prefix = getRunPrefix(pm);
    let command = `${prefix} swallowkit add-auth --provider ${providerPick.provider}`;
    if (scheme.trim()) {
      command += ` --scheme ${scheme.trim()}`;
    }
    if (allowedProviders) {
      command += ` --allowed-providers ${allowedProviders}`;
    }

    runInTerminal("🐦 SwallowKit", command);
  });

  context.subscriptions.push(disposable);
}
