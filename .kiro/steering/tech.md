# Technology Stack

## Architecture
- **タイプ**: Claude Code拡張機能（スラッシュコマンド + ドキュメント管理）
- **アーキテクチャパターン**: ドキュメント駆動開発(SDD)、Kiro風実装

## Core Technologies
- **IDE**: Claude Code / VSCode Extension
- **ドキュメント形式**: Markdown
- **バージョン管理**: Git (推奨)
- **パッケージマネージャ**: npm/npx

## Directory Structure
```
.claude/
  commands/         # スラッシュコマンド定義
    kiro/           # cc-sddコマンド群
.kiro/
  steering/         # ステアリングドキュメント（プロジェクト全体のルール）
  specs/            # スペックドキュメント（機能ごとの仕様）
    <feature-name>/
      spec.json           # メタデータと承認状況
      requirements.md     # 要件定義
      design.md          # 設計
      tasks.md           # タスクリスト
```

## Development Environment

### Installation
```bash
# Claude Code向けインストール（日本語対応）
npx cc-sdd@latest --lang ja

# Cursor向けインストール
npx cc-sdd@latest --cursor --lang ja
```

### Required Tools
- Node.js and npm (npxコマンドの実行に必要)
- Git (バージョン管理と変更追跡に推奨)
- Claude Code or Cursor IDE

## Common Commands

### Steering Management
```bash
/kiro:steering              # ステアリングドキュメントの作成/更新
/kiro:steering-custom       # カスタムステアリングの作成
```

### Specification Workflow
```bash
/kiro:spec-init [description]           # 仕様の初期化
/kiro:spec-requirements [feature]       # 要件定義の生成
/kiro:spec-design [feature] -y          # 設計の生成
/kiro:spec-tasks [feature] -y           # タスクの生成
/kiro:spec-impl [feature]               # 全タスク実装
/kiro:spec-impl [feature] 1.1           # 特定タスク実装
/kiro:spec-impl [feature] 1,2,3         # 複数タスク実装
```

### Progress Tracking & Validation
```bash
/kiro:spec-status [feature]             # 進捗確認
/kiro:validate-design [feature]         # 設計の検証
/kiro:validate-gap [feature]            # 仕様と実装のギャップ検証
```

## Configuration Files

### CLAUDE.md
プロジェクトのコンテキストとワークフロー定義
- パス設定
- ステアリングとスペックの説明
- 開発ガイドライン
- アクティブなステアリングファイルのリスト

### spec.json (各機能ごと)
```json
{
  "metadata": {
    "name": "feature-name",
    "description": "...",
    "created": "timestamp"
  },
  "approvals": {
    "requirements": false,
    "design": false,
    "tasks": false
  }
}
```

## Development Principles
- **3フェーズ承認ワークフロー**: 各フェーズで人間のレビューが必要
- **フェーズのスキップ禁止**: 設計は要件承認後、タスクは設計承認後
- **ステアリングの最新性維持**: 大きな変更後は `/kiro:steering` を実行
- **思考は英語、生成は日本語**: AIの思考プロセスは英語、出力は日本語
