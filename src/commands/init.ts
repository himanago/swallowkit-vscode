import * as vscode from "vscode";
import * as path from "path";
import * as cp from "child_process";
import { detectPackageManager, getRunPrefix } from "../utils/packageManager";

// ── Types matching CLI prompt choices ──────────────────────────

type CiCdProvider = "github" | "azure" | "skip";
type CosmosDbMode = "freetier" | "serverless";
type VNetOption = "none" | "outbound";

interface InitConfig {
  targetDir: string;
  projectName: string;
  cicd: CiCdProvider;
  cosmosDbMode: CosmosDbMode;
  vnetOption: VNetOption;
}

interface ValueQuickPickItem<T> extends vscode.QuickPickItem {
  value: T;
}

// ── Prompt‑index maps (must match CLI prompt order) ────────────

const CICD_INDEX: Record<CiCdProvider, number> = { github: 0, azure: 1, skip: 2 };
const COSMOS_INDEX: Record<CosmosDbMode, number> = { freetier: 0, serverless: 1 };
const VNET_INDEX: Record<VNetOption, number> = { outbound: 0, none: 1 };

// ── Command registration ──────────────────────────────────────

export function registerInitCommand(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand("swallowkit.init", async () => {
    // 1. Select target folder
    const folderUri = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: "Select folder to create project in",
      title: "SwallowKit: Select project location",
    });
    if (!folderUri || folderUri.length === 0) {
      return;
    }

    // 2. Enter project name
    const projectName = await vscode.window.showInputBox({
      prompt: "Enter project name",
      placeHolder: "my-swallowkit-app",
      validateInput: (value) => {
        if (!value || value.trim() === "") {
          return "Project name cannot be empty";
        }
        if (/[^a-zA-Z0-9-_]/.test(value.trim())) {
          return "Project name can only contain letters, numbers, hyphens, and underscores";
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
        { label: "GitHub Actions", description: "GitHub Actions でデプロイ自動化", value: "github" },
        { label: "Azure Pipelines", description: "Azure Pipelines でデプロイ自動化", value: "azure" },
        { label: "スキップ（手動デプロイ）", description: "CI/CD を設定しない", value: "skip" },
      ],
      { placeHolder: "CI/CD セットアップ（デプロイ自動化を選択）" },
    );
    if (!cicdPick) {
      return;
    }

    // 4. Select Cosmos DB mode
    const cosmosDbPick = await vscode.window.showQuickPick<ValueQuickPickItem<CosmosDbMode>>(
      [
        { label: "Free Tier (1000 RU/s 無料)", description: "最初のプロジェクトに最適", value: "freetier" },
        { label: "Serverless（従量課金）", description: "柔軟な従量課金プラン", value: "serverless" },
      ],
      { placeHolder: "Cosmos DB モード（コストに影響）" },
    );
    if (!cosmosDbPick) {
      return;
    }

    // 5. Select network security
    const vnetPick = await vscode.window.showQuickPick<ValueQuickPickItem<VNetOption>>(
      [
        { label: "VNet 統合（推奨）", description: "Cosmos DB を Private Endpoint 経由で接続", value: "outbound" },
        { label: "なし", description: "パブリックエンドポイント（シンプルだがセキュリティは低い）", value: "none" },
      ],
      { placeHolder: "ネットワークセキュリティ" },
    );
    if (!vnetPick) {
      return;
    }

    const config: InitConfig = {
      targetDir: folderUri[0].fsPath,
      projectName: projectName.trim(),
      cicd: cicdPick.value,
      cosmosDbMode: cosmosDbPick.value,
      vnetOption: vnetPick.value,
    };

    // 6. Run init with progress
    let success = false;
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "SwallowKit",
        cancellable: true,
      },
      async (progress, token) => {
        try {
          progress.report({ message: "プロジェクトを初期化中..." });
          await runInitProcess(config, progress, token);
          success = true;
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          vscode.window.showErrorMessage(`SwallowKit init failed:\n${message}`);
        }
      },
    );

    // 7. Open the created project
    if (success) {
      const projectPath = path.join(config.targetDir, config.projectName);
      const openChoice = await vscode.window.showInformationMessage(
        `プロジェクト "${config.projectName}" の初期化が完了しました！`,
        "現在のウィンドウで開く",
        "新しいウィンドウで開く",
      );
      if (openChoice === "現在のウィンドウで開く") {
        await vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(projectPath), false);
      } else if (openChoice === "新しいウィンドウで開く") {
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

/**
 * Generate a key sequence for a prompts `select` prompt.
 * Index 0 → just Enter (default), index N → N × ↓ then Enter.
 */
function selectKeySequence(index: number): string {
  return "\x1B[B".repeat(index) + "\r";
}

// ── Process runner ────────────────────────────────────────────

function runInitProcess(
  config: InitConfig,
  progress: vscode.Progress<{ message?: string; increment?: number }>,
  token: vscode.CancellationToken,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const pm = detectPackageManager();
    const args =
      pm === "pnpm"
        ? ["dlx", "swallowkit", "init", config.projectName]
        : ["--yes", "swallowkit", "init", config.projectName];
    const proc = cp.spawn(pm === "pnpm" ? "pnpm" : "npx", args, {
      cwd: config.targetDir,
      shell: true,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let promptsAnswered = 0;
    let resolved = false;

    // Patterns for detecting each CLI prompt, and the keys to respond with
    const promptHandlers = [
      { pattern: "CI/CD", keys: selectKeySequence(CICD_INDEX[config.cicd]) },
      { pattern: "Cosmos DB", keys: selectKeySequence(COSMOS_INDEX[config.cosmosDbMode]) },
      { pattern: "Network security", keys: selectKeySequence(VNET_INDEX[config.vnetOption]) },
    ];

    // Progress messages keyed off CLI output text
    const progressPatterns = [
      { pattern: "Creating Next.js project", message: "Next.js プロジェクトを作成中..." },
      { pattern: "Adding SwallowKit files", message: "SwallowKit ファイルを追加中..." },
      { pattern: "Creating shared", message: "共有パッケージを作成中..." },
      { pattern: "Creating Azure Functions", message: "Azure Functions プロジェクトを作成中..." },
      { pattern: "Creating BFF", message: "BFF API ルートを作成中..." },
      { pattern: "Installing", message: "依存関係をインストール中..." },
      { pattern: "Creating infrastructure", message: "インフラストラクチャファイルを作成中..." },
      { pattern: "Git repository", message: "Git リポジトリを初期化中..." },
    ];
    let lastProgressIdx = -1;

    token.onCancellationRequested(() => {
      if (!resolved) {
        resolved = true;
        proc.kill();
        reject(new Error("Cancelled by user."));
      }
    });

    proc.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
      const clean = stripAnsi(stdout);

      // Answer CLI prompts by sending keystrokes via stdin
      while (promptsAnswered < promptHandlers.length) {
        const h = promptHandlers[promptsAnswered];
        if (clean.includes(h.pattern)) {
          proc.stdin.write(h.keys);
          promptsAnswered++;
        } else {
          break;
        }
      }

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
