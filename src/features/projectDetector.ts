import * as vscode from "vscode";

/**
 * Detects whether the current workspace is a SwallowKit project.
 */
export async function isSwallowKitProject(): Promise<boolean> {
  const [modelFiles, configFiles, hostFiles, metadataFiles] = await Promise.all([
    vscode.workspace.findFiles("**/shared/models/*.ts", "**/node_modules/**", 1),
    vscode.workspace.findFiles("**/swallowkit.config.*", "**/node_modules/**", 1),
    vscode.workspace.findFiles("**/functions/host.json", "**/node_modules/**", 1),
    vscode.workspace.findFiles("**/.swallowkit/*", "**/node_modules/**", 1),
  ]);

  return (
    modelFiles.length > 0 ||
    configFiles.length > 0 ||
    hostFiles.length > 0 ||
    metadataFiles.length > 0
  );
}
