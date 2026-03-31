# Changelog

All notable changes to the SwallowKit VS Code Extension will be documented in this file.

## [0.3.0] - 2026-03-31

### Added
- **Add Connector command**: New `SwallowKit: Add Connector` command to register external data source connectors (MySQL, PostgreSQL, SQL Server, REST API) via GUI wizard
- **Add Authentication command**: New `SwallowKit: Add Authentication` command to set up authentication providers (Custom JWT, Static Web Apps, SWA + Custom, None)
- **Create Model with connector**: When connectors are defined in `swallowkit.config.js`, `Create Model` now offers to associate the model with a connector via `--connector` flag
- **Dev server mock connectors**: When connectors exist, `Start Dev Server` prompts whether to use `--mock-connectors` for local development without real external data sources
- **New snippets**: `skpartitionkey` (custom Cosmos DB partition key), `skconnector-rdb` (RDB connector config), `skconnector-api` (REST API connector config)

### Changed
- Updated to align with SwallowKit CLI v1.0.0-beta.18 features (connectors, auth, custom partition keys)

## [0.2.3] - 2026-03-22

### Fixed
- **Context menu path matching on Windows**: Updated the explorer/editor `when` regexes so right-click actions correctly match both `/` and `\\` path separators

## [0.2.2] - 2026-03-22

### Changed
- **Optimized extension icon asset**: Replaced `resources/logo.png` with a smaller 256x256 PNG to keep the published VSIX lightweight while preserving the official branding

## [0.2.1] - 2026-03-22

### Added
- **Dev seeds support**: Added `Create Dev Seed Templates` and optional `--seed-env` selection when starting the dev server

### Changed
- **Official extension logo**: Switched the extension icon to `resources/logo.png`

## [0.2.0] - 2026-03-21

### Changed
- **Init wizard updated for latest SwallowKit**: Added Azure Functions backend language selection and pass all init options as flags to match the latest CLI flow reliably
- **Provision command aligned with latest CLI**: Removed obsolete location flag handling and now guides users through interactive Azure region selection in the terminal
- **Documentation links refreshed**: `Open Documentation` now opens the published SwallowKit documentation site
- **Snippets refreshed**: Model snippet now matches the latest SwallowKit `create-model` template (`zod/v4`, direct schema export, `displayName`)

### Documentation
- Updated English and Japanese READMEs for the latest init/provision flows and current SwallowKit prerequisites

## [0.1.0] - 2026-02-25

### Added
- **Command Palette Commands**: Initialize project, create model, scaffold CRUD, dev server control, provision Azure resources, open documentation
- **Context Menu Integration**: Right-click on model files and folders to run scaffold/create-model
- **Editor Context Menu**: Scaffold from model files directly in the editor
- **Dev Server Status Bar**: Visual indicator showing dev server state with click-to-toggle
- **TypeScript Snippets**: `skmodel`, `skfield-string`, `skfield-number`, `skfield-boolean`, `skfield-enum`, `skfield-array`, `sknested`
- **Auto-open created model files**: After running `create-model`, newly created files open automatically
- **SwallowKit project detection**: Status bar only shown for SwallowKit projects
- **CLI availability check**: Warning shown if SwallowKit CLI is not available
