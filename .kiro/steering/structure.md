# Project Structure

## Root Directory Organization

```
/
├── .claude/                    # Claude Code設定
│   └── commands/               # スラッシュコマンド定義
│       └── kiro/               # cc-sddコマンド群（11ファイル）
├── .kiro/                      # cc-sdd作業ディレクトリ
│   ├── steering/               # ステアリングドキュメント
│   │   ├── product.md          # プロダクト概要（Always included）
│   │   ├── tech.md             # 技術スタック（Always included）
│   │   └── structure.md        # プロジェクト構造（Always included）
│   └── specs/                  # 機能別スペック
│       └── <feature-name>/     # 機能名ごとのディレクトリ
│           ├── spec.json       # メタデータと承認状況
│           ├── requirements.md # 要件定義書
│           ├── design.md       # 設計書
│           └── tasks.md        # タスクリスト
├── CLAUDE.md                   # プロジェクト全体のコンテキスト
├── cc-sdd.md                   # cc-sdd導入ガイド
├── claudecode-bestpractice.md  # ベストプラクティス
└── orchestaror.md              # オーケストレーター関連
```

## Subdirectory Structures

### .claude/commands/kiro/
cc-sddのスラッシュコマンド定義（全11ファイル）:
- `steering.md` - ステアリングドキュメント管理
- `steering-custom.md` - カスタムステアリング作成
- `spec-init.md` - 仕様初期化
- `spec-requirements.md` - 要件定義生成
- `spec-design.md` - 設計生成
- `spec-tasks.md` - タスク生成
- `spec-impl.md` - 実装実行
- `spec-status.md` - 進捗確認
- `validate-design.md` - 設計検証
- `validate-gap.md` - ギャップ検証

### .kiro/steering/
プロジェクト全体のルールとコンテキスト:
- **Always Included**: 全てのAIインタラクションで読み込まれる
- **3つのコアファイル**: product.md, tech.md, structure.md
- **カスタムファイル**: 専門的なコンテキスト用（Conditional/Manual）

### .kiro/specs/<feature-name>/
機能ごとの開発プロセスドキュメント:
- **spec.json**: メタデータと承認フラグ
- **requirements.md**: 要件定義（フェーズ1）
- **design.md**: 設計書（フェーズ2）
- **tasks.md**: 実装タスクリスト（フェーズ3）

## Code Organization Patterns

### Steering Files (Always Included)
ステアリングファイルは全てのAIセッションで自動的にロードされ、一貫したプロジェクトコンテキストを提供します。

### Specification Files (Feature-Specific)
スペックファイルは機能ごとに独立して管理され、段階的な承認プロセスを経て実装に進みます。

### Inclusion Modes
- **Always**: 常に読み込まれる（コアステアリングファイル）
- **Conditional**: 特定のファイルパターンにマッチした時のみ読み込まれる
- **Manual**: `@filename.md` 構文で明示的に参照

## File Naming Conventions

### Steering Files
- 小文字で単一単語または2単語をハイフン区切り: `product.md`, `tech.md`, `structure.md`
- カスタムファイルは目的を明確に: `api-guidelines.md`, `security-policy.md`

### Spec Directories
- 機能名をケバブケースで: `user-authentication`, `payment-integration`
- ファイル名は固定: `spec.json`, `requirements.md`, `design.md`, `tasks.md`

## Import Organization

### Document References
- ドキュメント内で他のドキュメントを参照する場合は相対パス使用
- ステアリングからスペックへの参照: `../specs/<feature-name>/`
- スペックからステアリングへの参照: `../../steering/`

## Key Architectural Principles

### Separation of Concerns
- **Steering**: プロジェクト全体のルールとコンテキスト
- **Specs**: 個別機能の開発プロセス

### Progressive Disclosure
要件 → 設計 → タスク → 実装という段階的な詳細化

### Human-in-the-Loop
各フェーズで人間のレビューと承認を要求

### Living Documentation
ドキュメントは実装と共に進化し、常に最新状態を維持

### Context Management
AIセッション間での一貫性を保つため、ステアリングファイルを常時ロード
