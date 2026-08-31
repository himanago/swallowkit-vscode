import * as vscode from "vscode";
import * as path from "path";
import * as cp from "child_process";
import { detectPackageManager } from "../utils/packageManager";

// ── Types matching CLI prompt choices ──────────────────────────

type CiCdProvider = "github" | "azure" | "skip";
type BackendLanguage = "typescript" | "csharp" | "python";
type CosmosDbMode = "freetier" | "serverless";
type VNetOption = "none" | "outbound";
type SwaPlan = "free" | "standard";

interface InitConfig {
  targetDir: string;
  projectName: string;
  cicd: CiCdProvider;
  backendLanguage: BackendLanguage;
  cosmosDbMode: CosmosDbMode;
  vnetOption: VNetOption;
  swaPlan: SwaPlan;
}

interface ValueQuickPickItem<T> extends vscode.QuickPickItem {
  value: T;
}

// ── Command registration ──────────────────────────────────────

export function registerInitCommand(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand("swallowkit.init", async () => {
    // 1. Select target folder
    const folderUri = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: vscode.l10n.t("Select folder to create project in"),
      title: vscode.l10n.t("SwallowKit: Select project location"),
    });
    if (!folderUri || folderUri.length === 0) {
      return;
    }

    // 2. Enter project name
    const projectName = await vscode.window.showInputBox({
      prompt: vscode.l10n.t("Enter project name"),
      placeHolder: "my-swallowkit-app",
      validateInput: (value) => {
        if (!value || value.trim() === "") {
          return vscode.l10n.t("Project name cannot be empty");
        }
        if (/[^a-zA-Z0-9-_]/.test(value.trim())) {
          return vscode.l10n.t("Project name can only contain letters, numbers, hyphens, and underscores");
        }
        return undefined;
      },
    });
    if (!projectName) {
      return;
    }

    // 3. Select CI/CD provider
    const cicdPick = await vscode.window.showQuickPick<ValueQuickPickItem<CiCdProvider>>(
      [
        { label: "GitHub Actions", description: vscode.l10n.t("Automate deployment with GitHub Actions"), value: "github" },
        { label: "Azure Pipelines", description: vscode.l10n.t("Automate deployment with Azure Pipelines"), value: "azure" },
        { label: vscode.l10n.t("Skip (manual deployment)"), description: vscode.l10n.t("Do not configure CI/CD"), value: "skip" },
      ],
      { placeHolder: vscode.l10n.t("CI/CD setup (choose deployment automation)") },
    );
    if (!cicdPick) {
      return;
    }

    // 4. Select Azure Functions backend language
    const backendLanguagePick = await vscode.window.showQuickPick<ValueQuickPickItem<BackendLanguage>>(
      [
        { label: "TypeScript", description: vscode.l10n.t("Build Azure Functions in TypeScript with shared Zod schemas"), value: "typescript" },
        { label: "C#", description: vscode.l10n.t("Build Azure Functions in C# via the OpenAPI bridge"), value: "csharp" },
        { label: "Python", description: vscode.l10n.t("Build Azure Functions in Python via the OpenAPI bridge"), value: "python" },
      ],
      { placeHolder: vscode.l10n.t("Azure Functions backend language") },
    );
    if (!backendLanguagePick) {
      return;
    }

    // 5. Select Cosmos DB mode
    const cosmosDbPick = await vscode.window.showQuickPick<ValueQuickPickItem<CosmosDbMode>>(
      [
        { label: vscode.l10n.t("Free Tier (1000 RU/s free)"), description: vscode.l10n.t("Best for your first project"), value: "freetier" },
        { label: vscode.l10n.t("Serverless (pay per use)"), description: vscode.l10n.t("Flexible consumption-based plan"), value: "serverless" },
      ],
      { placeHolder: vscode.l10n.t("Cosmos DB mode (affects cost)") },
    );
    if (!cosmosDbPick) {
      return;
    }

    // 6. Select network security
    const vnetPick = await vscode.window.showQuickPick<ValueQuickPickItem<VNetOption>>(
      [
        { label: vscode.l10n.t("VNet integration (recommended)"), description: vscode.l10n.t("Connect to Cosmos DB via Private Endpoint"), value: "outbound" },
        { label: vscode.l10n.t("None"), description: vscode.l10n.t("Public endpoint (simpler but less secure)"), value: "none" },
      ],
      { placeHolder: vscode.l10n.t("Network security") },
    );
    if (!vnetPick) {
      return;
    }

    // 7. Select Static Web Apps plan
    const swaPlanPick = await vscode.window.showQuickPick<ValueQuickPickItem<SwaPlan>>(
      [
        { label: "Free", description: vscode.l10n.t("Free plan for personal and small projects"), value: "free" },
        { label: "Standard", description: vscode.l10n.t("Choose when you need SLA or custom authentication"), value: "standard" },
      ],
      { placeHolder: vscode.l10n.t("Azure Static Web Apps plan") },
    );
    if (!swaPlanPick) {
      return;
    }

    const config: InitConfig = {
      targetDir: folderUri[0].fsPath,
      projectName: projectName.trim(),
      cicd: cicdPick.value,
      backendLanguage: backendLanguagePick.value,
      cosmosDbMode: cosmosDbPick.value,
      vnetOption: vnetPick.value,
      swaPlan: swaPlanPick.value,
    };

    // 8. Run init with progress
    let success = false;
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "SwallowKit",
        cancellable: true,
      },
      async (progress, token) => {
        try {
          progress.report({ message: vscode.l10n.t("Initializing project...") });
          await runInitProcess(config, progress, token);
          success = true;
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          vscode.window.showErrorMessage(vscode.l10n.t("SwallowKit init failed:\n{0}", message));
        }
      },
    );

    // 9. Open the created project
    if (success) {
      const projectPath = path.join(config.targetDir, config.projectName);
      const openCurrentWindow = vscode.l10n.t("Open in Current Window");
      const openNewWindow = vscode.l10n.t("Open in New Window");
      const openChoice = await vscode.window.showInformationMessage(
        vscode.l10n.t('Project "{0}" initialized successfully!', config.projectName),
        openCurrentWindow,
        openNewWindow,
      );
      if (openChoice === openCurrentWindow) {
        await vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(projectPath), false);
      } else if (openChoice === openNewWindow) {
        await vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(projectPath), true);
      }
    }
  });

  context.subscriptions.push(disposable);
}

// ── Helpers ───────────────────────────────────────────────────

/** Strip ANSI escape codes */
function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, "").replace(/\x1B\][^\x07]*\x07/g, "");
}

// ── Process runner ────────────────────────────────────────────

function runInitProcess(
  config: InitConfig,
  progress: vscode.Progress<{ message?: string; increment?: number }>,
  token: vscode.CancellationToken,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const pm = detectPackageManager();
    const initArgs = [
      "init",
      config.projectName,
      "--cicd",
      config.cicd,
      "--backend-language",
      config.backendLanguage,
      "--cosmos-db-mode",
      config.cosmosDbMode,
      "--vnet",
      config.vnetOption,
      "--swa-plan",
      config.swaPlan,
    ];
    const args =
      pm === "pnpm"
        ? ["dlx", "swallowkit", ...initArgs]
        : ["--yes", "swallowkit", ...initArgs];
    // All values are validated/enum literals, so joining is shell-safe.
    // Avoids DEP0190 (args array combined with shell: true).
    const commandLine = [pm === "pnpm" ? "pnpm" : "npx", ...args].join(" ");
    const proc = cp.spawn(commandLine, {
      cwd: config.targetDir,
      shell: true,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let resolved = false;

    // Progress messages keyed off CLI output text
    const progressPatterns = [
      { pattern: "Creating Next.js project", message: vscode.l10n.t("Creating Next.js project...") },
      { pattern: "Adding SwallowKit files", message: vscode.l10n.t("Adding SwallowKit files...") },
      { pattern: "Creating shared", message: vscode.l10n.t("Creating shared package...") },
      { pattern: "Creating Azure Functions", message: vscode.l10n.t("Creating Azure Functions project...") },
      { pattern: "Creating BFF", message: vscode.l10n.t("Creating BFF API routes...") },
      { pattern: "Installing", message: vscode.l10n.t("Installing dependencies...") },
      { pattern: "Creating infrastructure", message: vscode.l10n.t("Creating infrastructure files...") },
      { pattern: "Git repository", message: vscode.l10n.t("Initializing Git repository...") },
    ];
    let lastProgressIdx = -1;

    token.onCancellationRequested(() => {
      if (!resolved) {
        resolved = true;
        proc.kill();
        reject(new Error(vscode.l10n.t("Cancelled by user.")));
      }
    });

    proc.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
      const clean = stripAnsi(stdout);

      // Update progress notification
      for (let i = lastProgressIdx + 1; i < progressPatterns.length; i++) {
        if (clean.includes(progressPatterns[i].pattern)) {
          progress.report({ message: progressPatterns[i].message });
          lastProgressIdx = i;
        }
      }
    });

    proc.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      if (resolved) {
        return;
      }
      resolved = true;

      if (code === 0) {
        resolve();
      } else {
        const cleanStderr = stderr.trim();
        const cleanStdout = stripAnsi(stdout).trim();
        const lastLine = cleanStdout.split("\n").filter((l) => l.trim()).pop() || "";
        reject(new Error(cleanStderr || lastLine || `Process exited with code ${code}`));
      }
    });

    proc.on("error", (error) => {
      if (resolved) {
        return;
      }
      resolved = true;
      reject(error);
    });
  });
}
