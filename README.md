# SwallowKit VS Code Extension

[日本語版 README はこちら](README.ja.md)

VS Code extension for [SwallowKit](https://github.com/himanago/swallowkit) — a CLI toolkit for building full-stack Azure apps with **Next.js + Azure Functions + Cosmos DB + Zod schema sharing**.

<!-- screenshots placeholder -->

## Features

### 🚀 Command Palette Integration

Access all SwallowKit commands via `Ctrl+Shift+P`:

| Command | Description |
|---|---|
| `SwallowKit: Initialize New Project` | Guided wizard: folder → project name → CI/CD → Cosmos DB mode → VNet, then opens the project |
| `SwallowKit: Create Model` | Prompts for model name(s), runs `swallowkit create-model`, auto-opens new files |
| `SwallowKit: Scaffold CRUD from Model` | Pick model file → runs `swallowkit scaffold <path>` |
| `SwallowKit: Scaffold CRUD (API Only)` | Same as above with `--api-only` flag |
| `SwallowKit: Start Dev Server` | Starts `swallowkit dev` in a dedicated terminal |
| `SwallowKit: Stop Dev Server` | Stops the dev server terminal |
| `SwallowKit: Provision Azure Resources` | Multi-step wizard → runs `swallowkit provision` |
| `SwallowKit: Open Documentation` | Opens https://github.com/himanago/swallowkit in browser |

### 🖱️ Context Menu Integration

- **Explorer**: Right-click on `shared/models/*.ts` or `lib/models/*.ts` files → Scaffold CRUD
- **Explorer**: Right-click on `shared/models/` or `lib/models/` folder → Create Model
- **Editor**: Right-click when editing a model file → Scaffold CRUD

### 📊 Dev Server Status Bar

- **Stopped**: `○ SwallowKit` — click to start
- **Running**: `▶ SwallowKit: Running` (warning background) — click to stop

### ✂️ TypeScript Snippets

| Prefix | Description |
|---|---|
| `skmodel` | Full SwallowKit Zod model template |
| `skfield-string` | String field with min/max |
| `skfield-number` | Number field with min |
| `skfield-boolean` | Boolean field with default |
| `skfield-enum` | Enum field |
| `skfield-array` | Array field |
| `sknested` | Nested schema reference |

## Requirements

- **Node.js** 18+
- **SwallowKit CLI**: Available via `npx swallowkit` (or install globally: `npm install -g swallowkit`)
- **pnpm** (recommended): If installed, the extension automatically uses `pnpm dlx` for faster execution. Falls back to `npx` when pnpm is not available.

## Usage

### Initialize a New Project

1. Run `SwallowKit: Initialize New Project` from the command palette
2. Select a target folder for the new project
3. Enter your project name
4. Choose CI/CD provider (GitHub Actions / Azure Pipelines / Skip)
5. Choose Cosmos DB mode (Free Tier / Serverless)
6. Choose network security (VNet Integration / None)
7. Wait for initialization to complete (progress shown in notification)
8. Choose to open the project in the current or a new window

### Create a Model

1. Run `SwallowKit: Create Model` from the command palette (or right-click a models folder)
2. Enter model name(s), comma-separated for multiple (e.g. `User, Product`)
3. The files will be created and automatically opened in the editor

### Scaffold CRUD

1. Run `SwallowKit: Scaffold CRUD from Model` from the command palette
2. Select a model file from the QuickPick list
3. CRUD code (Azure Functions + Next.js BFF + UI components) will be generated

   *Or* right-click directly on a model file in the explorer.

### Dev Server

Click the `○ SwallowKit` item in the status bar to start/stop the dev server.
The terminal `🐦 SwallowKit Dev` will be created automatically.

### Provision Azure Resources

1. Run `SwallowKit: Provision Azure Resources`
2. Enter resource group name
3. Select Azure location
4. Optionally enter a subscription ID
5. The provision command runs in the terminal

## Extension Settings

No configurable settings in this version.

## Links

- [SwallowKit CLI](https://github.com/himanago/swallowkit)
- [Report issues](https://github.com/himanago/swallowkit-vscode/issues)