import { execSync } from "child_process";

export type PackageManager = "npm" | "pnpm";

/**
 * Detects whether pnpm is available on the system.
 * Returns "pnpm" if found, otherwise "npm".
 */
export function detectPackageManager(): PackageManager {
  try {
    execSync("pnpm --version", { stdio: "ignore" });
    return "pnpm";
  } catch {
    return "npm";
  }
}

/**
 * Returns the command prefix for running a package binary.
 * - pnpm → "pnpm dlx"
 * - npm  → "npx"
 */
export function getRunPrefix(pm: PackageManager): string {
  return pm === "pnpm" ? "pnpm dlx" : "npx";
}
