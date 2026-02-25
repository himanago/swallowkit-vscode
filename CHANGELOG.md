# Changelog

All notable changes to the SwallowKit VS Code Extension will be documented in this file.

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
