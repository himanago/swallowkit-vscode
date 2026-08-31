import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

export const DEV_SEEDS_DIR_NAME = "dev-seeds";

const DEV_SEED_ENVIRONMENT_PATTERN = /^[A-Za-z0-9_-]+$/;

export function validateDevSeedEnvironmentName(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return vscode.l10n.t("Environment name cannot be empty");
  }

  if (!DEV_SEED_ENVIRONMENT_PATTERN.test(trimmed)) {
    return vscode.l10n.t("Environment name can only contain letters, numbers, hyphens, and underscores");
  }

  return undefined;
}

export function getDevSeedEnvironmentDir(workspaceRoot: string, environment: string): string {
  return path.join(workspaceRoot, DEV_SEEDS_DIR_NAME, environment);
}

export function listDevSeedEnvironments(workspaceRoot: string): string[] {
  const seedsRoot = path.join(workspaceRoot, DEV_SEEDS_DIR_NAME);
  if (!fs.existsSync(seedsRoot)) {
    return [];
  }

  return fs
    .readdirSync(seedsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}
