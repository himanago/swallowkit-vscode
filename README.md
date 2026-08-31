# SwallowKit VS Code Extension

[日本語版 README はこちら](README.ja.md)

VS Code extension for [SwallowKit](https://github.com/himanago/swallowkit) — a CLI toolkit for building full-stack Azure apps with **Next.js + Azure Functions + Cosmos DB + Zod schema sharing**.

<!-- screenshots placeholder -->

## Features

### 🚀 Command Palette Integration

Access all SwallowKit commands via `Ctrl+Shift+P`:

| Command | Description |
|---|---|
| `SwallowKit: Initialize New Project` | Guided wizard: folder → project name → CI/CD → backend language → Cosmos DB mode → VNet → Static Web Apps plan, then opens the project |
| `SwallowKit: Create Model` | Prompts for model name(s), runs `swallowkit create-model`, auto-opens new files |
| `SwallowKit: Create Dev Seed Templates` | Generates seed templates from models, or exports current emulator data with `--from-emulator` |
| `SwallowKit: Scaffold CRUD from Model` | Pick model file → runs `swallowkit scaffold <path>` |
| `SwallowKit: Scaffold CRUD (API Only)` | Same as above with `--api-only` flag |
| `SwallowKit: Scaffold Preview (Dry Run)` | Shows planned file changes and conflicts without writing anything (`--dry-run`) |
| `SwallowKit: Start Dev Server` | Starts `swallowkit dev` in a dedicated terminal; offers `--seed-env` when `dev-seeds/*` exists and `--mock-connectors` when connectors are configured |
| `SwallowKit: Stop Dev Server` | Stops the dev server terminal |
| `SwallowKit: Add Authentication` | Guided `swallowkit add-auth`: provider (Custom JWT / SWA / External Token / SWA + Custom / None), optional scheme and SWA identity providers |
| `SwallowKit: Add External Connector` | Guided `swallowkit add-connector`: name → type (RDB / API) → RDB provider (MySQL / PostgreSQL / SQL Server) |
| `SwallowKit: Show Project Status` | Runs `swallowkit status` (optionally with `--artifacts`) to show generated artifact status and drift |
| `SwallowKit: Verify Project` | Runs `swallowkit verify` with selectable checks (structure / drift / typecheck) |
| `SwallowKit: Provision Azure Resources` | Collects Azure settings, then lets the CLI guide region selection in the terminal |
| `SwallowKit: Open Documentation` | Opens https://himanago.github.io/swallowkit/ in browser |

### 🖱️ Context Menu Integration

- **Explorer**: Right-click on `shared/models/*.ts` or `lib/models/*.ts` files → Scaffold CRUD / API Only / Dry Run
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
| `skpartitionkey` | Cosmos DB partition key declaration |
| `skauthpolicy` | Role-based access control declaration |
| `skconnector-rdb` | RDB connector config (MySQL / PostgreSQL / SQL Server) |
| `skconnector-api` | REST API connector config |

## Requirements

- **Node.js** 22.x
- **SwallowKit CLI**: No installation needed — the extension runs it on demand via `npx swallowkit` (recommended usage)
- **pnpm** (recommended): If installed, the extension automatically uses `pnpm dlx` for faster execution. Falls back to `npx` when pnpm is not available.

## Localization

The UI is in English by default and follows the VS Code display language when available: 日本語, 简体中文, 한국어, Français, Deutsch, Español, Português (Brasil).

## Usage

### Initialize a New Project

1. Run `SwallowKit: Initialize New Project` from the command palette
2. Select a target folder for the new project
3. Enter your project name
4. Choose CI/CD provider (GitHub Actions / Azure Pipelines / Skip)
5. Choose backend language (TypeScript / C# / Python)
6. Choose Cosmos DB mode (Free Tier / Serverless)
7. Choose network security (VNet Integration / None)
8. Choose Static Web Apps plan (Free / Standard)
9. Wait for initialization to complete (progress shown in notification)
10. Choose to open the project in the current or a new window

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

If your project already has `dev-seeds/<environment>/` folders, the extension will offer them before startup and run `swallowkit dev --seed-env <environment>`.
When `swallowkit.config` declares connectors, the extension also offers to start the mock connector server (`--mock-connectors`).

### Dev Seeds Workflow

1. Run `SwallowKit: Create Dev Seed Templates`
2. Choose whether to generate templates from models or export current data from the Cosmos DB Emulator (`--from-emulator`)
3. Enter an environment name such as `local`
4. Edit the generated JSON files under `dev-seeds/<environment>/`
5. Run `SwallowKit: Start Dev Server` and choose that environment to seed the Cosmos DB Emulator before startup

Notes:

- `shared/models/todo.ts` maps to `dev-seeds/local/todo.json`
- Each JSON file can contain a single object or an array of objects
- Every seed document must include a non-empty string `id`
- If `--seed-env` is omitted, or the selected environment does not exist, current emulator data is preserved

### Provision Azure Resources

1. Run `SwallowKit: Provision Azure Resources`
2. Enter resource group name
3. Optionally enter a subscription ID
4. The provision command starts in the terminal
5. Follow the CLI prompts to choose the primary Azure location and the Static Web App location
6. Confirm the deployment in the terminal

### Add Authentication

1. Run `SwallowKit: Add Authentication`
2. Choose an auth provider (Custom JWT / Static Web Apps / External Token / SWA + Custom / None)
3. Optionally enter a named scheme, and for SWA-based providers the allowed identity providers
4. `swallowkit add-auth` runs in the terminal

### Add an External Connector

1. Run `SwallowKit: Add External Connector`
2. Enter a connector name, choose its type (RDB / API), and for RDB a provider
3. `swallowkit add-connector` runs in the terminal; then create connector-aware models with `create-model --connector <name>`

### Check Project Health

- `SwallowKit: Show Project Status` — shows generated artifact status and drift (`swallowkit status`)
- `SwallowKit: Verify Project` — runs structure / drift / typecheck verification (`swallowkit verify`)

## Extension Settings

No configurable settings in this version.

## Links

- [SwallowKit Documentation](https://himanago.github.io/swallowkit/)
- [SwallowKit CLI](https://github.com/himanago/swallowkit)
- [Report issues](https://github.com/himanago/swallowkit-vscode/issues)
