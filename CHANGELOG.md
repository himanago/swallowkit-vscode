# Changelog

All notable changes to the SwallowKit VS Code Extension will be documented in this file.

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
