# SwallowKit VS Code 拡張機能

[English README](README.md)

[SwallowKit](https://github.com/himanago/swallowkit) 用の VS Code 拡張機能 — **Next.js + Azure Functions + Cosmos DB + Zod スキーマ共有** でフルスタック Azure アプリを構築する CLI ツールキット。

<!-- screenshots placeholder -->

## 機能

### 🚀 コマンドパレット統合

`Ctrl+Shift+P` からすべての SwallowKit コマンドにアクセスできます:

| コマンド | 説明 |
|---|---|
| `SwallowKit: Initialize New Project` | ガイド付きウィザード: フォルダ → プロジェクト名 → CI/CD → バックエンド言語 → Cosmos DB モード → VNet → Static Web Apps プランを選択し、プロジェクトを開く |
| `SwallowKit: Create Model` | モデル名を入力し、`swallowkit create-model` を実行、新規ファイルを自動で開く |
| `SwallowKit: Create Dev Seed Templates` | モデルからシードテンプレートを生成、または `--from-emulator` でエミュレータの現在データをエクスポート |
| `SwallowKit: Scaffold CRUD from Model` | モデルファイルを選択 → `swallowkit scaffold <path>` を実行 |
| `SwallowKit: Scaffold CRUD (API Only)` | 上記と同様、`--api-only` フラグ付き |
| `SwallowKit: Scaffold Preview (Dry Run)` | ファイルを書き込まずに変更予定と競合を表示（`--dry-run`） |
| `SwallowKit: Start Dev Server` | 専用ターミナルで `swallowkit dev` を開始。`dev-seeds/*` があれば `--seed-env`、コネクタ設定があれば `--mock-connectors` も選択可能 |
| `SwallowKit: Stop Dev Server` | 開発サーバーのターミナルを停止 |
| `SwallowKit: Add Authentication` | ガイド付き `swallowkit add-auth`: プロバイダー（Custom JWT / SWA / External Token / SWA + Custom / None）、任意のスキーム名と SWA identity provider |
| `SwallowKit: Add External Connector` | ガイド付き `swallowkit add-connector`: 名前 → 種類（RDB / API）→ RDB プロバイダー（MySQL / PostgreSQL / SQL Server） |
| `SwallowKit: Show Project Status` | `swallowkit status`（任意で `--artifacts`）で生成アーティファクトの状態とドリフトを表示 |
| `SwallowKit: Verify Project` | `swallowkit verify` をチェック選択付き（structure / drift / typecheck）で実行 |
| `SwallowKit: Provision Azure Resources` | Azure 設定を入力後、CLI のリージョン選択をターミナルで進める |
| `SwallowKit: Open Documentation` | https://himanago.github.io/swallowkit/ をブラウザで開く |

### 🖱️ コンテキストメニュー統合

- **エクスプローラー**: `shared/models/*.ts` または `lib/models/*.ts` ファイルを右クリック → Scaffold CRUD / API Only / Dry Run
- **エクスプローラー**: `shared/models/` または `lib/models/` フォルダを右クリック → Create Model
- **エディタ**: モデルファイル編集中に右クリック → Scaffold CRUD

### 📊 開発サーバー ステータスバー

- **停止中**: `○ SwallowKit` — クリックで開始
- **実行中**: `▶ SwallowKit: Running`（警告背景色）— クリックで停止

### ✂️ TypeScript スニペット

| プレフィックス | 説明 |
|---|---|
| `skmodel` | SwallowKit Zod モデルテンプレート |
| `skfield-string` | min/max 付き String フィールド |
| `skfield-number` | min 付き Number フィールド |
| `skfield-boolean` | デフォルト値付き Boolean フィールド |
| `skfield-enum` | Enum フィールド |
| `skfield-array` | Array フィールド |
| `sknested` | ネストされたスキーマ参照 |
| `skpartitionkey` | Cosmos DB パーティションキー宣言 |
| `skauthpolicy` | ロールベースアクセス制御宣言 |
| `skconnector-rdb` | RDB コネクタ設定（MySQL / PostgreSQL / SQL Server） |
| `skconnector-api` | REST API コネクタ設定 |

## 必要条件

- **Node.js** 22.x
- **SwallowKit CLI**: インストール不要 — 拡張機能が `npx swallowkit` でオンデマンド実行します（推奨の利用方法）
- **pnpm**（推奨）: インストールされている場合、拡張機能は自動的に `pnpm dlx` を使用し、より高速に動作します。未インストールの場合は `npx` にフォールバックします。

## 多言語対応

UI は既定で英語です。VS Code の表示言語に応じて以下の言語に切り替わります: 日本語、簡体中国語、韓国語、フランス語、ドイツ語、スペイン語、ポルトガル語（ブラジル）。

## 使い方

### 新しいプロジェクトの初期化

1. コマンドパレットから `SwallowKit: Initialize New Project` を実行
2. プロジェクトの作成先フォルダを選択
3. プロジェクト名を入力
4. CI/CD プロバイダを選択（GitHub Actions / Azure Pipelines / スキップ）
5. Azure Functions のバックエンド言語を選択（TypeScript / C# / Python）
6. Cosmos DB モードを選択（Free Tier / Serverless）
7. ネットワークセキュリティを選択（VNet 統合 / なし）
8. Static Web Apps プランを選択（Free / Standard）
9. 初期化の完了を待つ（通知で進捗を表示）
10. 現在のウィンドウまたは新しいウィンドウでプロジェクトを開く

### モデルの作成

1. コマンドパレットから `SwallowKit: Create Model` を実行（またはモデルフォルダを右クリック）
2. モデル名を入力（カンマ区切りで複数指定可、例: `User, Product`）
3. ファイルが作成され、自動的にエディタで開かれます

### CRUD のスキャフォールド

1. コマンドパレットから `SwallowKit: Scaffold CRUD from Model` を実行
2. QuickPick リストからモデルファイルを選択
3. CRUD コード（Azure Functions + Next.js BFF + UI コンポーネント）が生成されます

   エクスプローラーでモデルファイルを直接右クリックすることもできます。

### 開発サーバー

ステータスバーの `○ SwallowKit` をクリックして開発サーバーの開始/停止を切り替えます。
ターミナル `🐦 SwallowKit Dev` が自動的に作成されます。

プロジェクトに `dev-seeds/<environment>/` フォルダがある場合、起動前に seed 環境を選べます。選択すると `swallowkit dev --seed-env <environment>` が実行されます。
`swallowkit.config` にコネクタが定義されている場合は、モックコネクタサーバー（`--mock-connectors`）の起動も選択できます。

### Dev Seeds ワークフロー

1. `SwallowKit: Create Dev Seed Templates` を実行
2. モデルからテンプレートを生成するか、Cosmos DB Emulator の現在データをエクスポート（`--from-emulator`）するかを選択
3. `local` などの環境名を入力
4. `dev-seeds/<environment>/` に生成された JSON を編集
5. `SwallowKit: Start Dev Server` 実行時に同じ環境を選び、起動前に Cosmos DB Emulator へ seed を投入

補足:

- `shared/models/todo.ts` は `dev-seeds/local/todo.json` に対応します
- 各 JSON ファイルは単一オブジェクトまたはオブジェクト配列を含めます
- すべての seed ドキュメントに空でない文字列 `id` が必要です
- `--seed-env` を付けない場合、または選んだ環境が存在しない場合は、既存のエミュレータデータが保持されます

### Azure リソースのプロビジョニング

1. `SwallowKit: Provision Azure Resources` を実行
2. リソースグループ名を入力
3. 任意でサブスクリプション ID を入力
4. プロビジョニングコマンドがターミナルで実行されます
5. ターミナルでプライマリ Azure リージョンと Static Web App のリージョンを選択します
6. ターミナルでデプロイを確認します

### 認証の追加

1. `SwallowKit: Add Authentication` を実行
2. 認証プロバイダーを選択（Custom JWT / Static Web Apps / External Token / SWA + Custom / None）
3. 任意でスキーム名を入力。SWA 系プロバイダーの場合は許可する identity provider も入力
4. `swallowkit add-auth` がターミナルで実行されます

### 外部コネクタの追加

1. `SwallowKit: Add External Connector` を実行
2. コネクタ名を入力し、種類（RDB / API）と RDB の場合はプロバイダーを選択
3. `swallowkit add-connector` がターミナルで実行されます。その後 `create-model --connector <name>` でコネクタ対応モデルを作成できます

### プロジェクトの健全性チェック

- `SwallowKit: Show Project Status` — 生成アーティファクトの状態とドリフトを表示（`swallowkit status`）
- `SwallowKit: Verify Project` — structure / drift / typecheck の検証を実行（`swallowkit verify`）

## 拡張機能の設定

このバージョンでは設定項目はありません。

## リンク

- [SwallowKit Documentation](https://himanago.github.io/swallowkit/)
- [SwallowKit CLI](https://github.com/himanago/swallowkit)
- [問題の報告](https://github.com/himanago/swallowkit-vscode/issues)
