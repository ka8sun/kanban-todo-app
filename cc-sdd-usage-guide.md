# cc-sdd (Claude Code Spec-Driven Development) 使用ガイド

cc-sddのインストールありがとうございます！以下、具体的な使い方を説明します。

## 📋 目次

1. [基本概念](#基本概念)
2. [開発フロー](#開発フロー)
3. [コマンド一覧](#コマンド一覧)
4. [実践例](#実践例)
5. [よくある質問](#よくある質問)

---

## 基本概念

### ステアリング vs スペック

- **ステアリング** (`.kiro/steering/`)
  - プロジェクト全体のルールとコンテキスト
  - 常にAIに読み込まれる基本情報
  - 例: 技術スタック、コーディング規約、プロダクト概要

- **スペック** (`.kiro/specs/`)
  - 個別機能ごとの開発プロセス
  - 要件定義 → 設計 → タスク → 実装の流れ
  - 例: ユーザー認証機能、決済機能

### 3フェーズ承認ワークフロー

```
要件定義 → [人間の承認] → 設計 → [人間の承認] → タスク → [人間の承認] → 実装
```

各フェーズで人間がレビューし、承認してから次に進みます。

---

## 開発フロー

### Phase 0: ステアリング設定（オプション）

新規プロジェクトや大きな変更の前に実行:

```bash
/kiro:steering
```

これにより `.kiro/steering/` に以下が作成されます:
- `product.md` - プロダクト概要
- `tech.md` - 技術スタック
- `structure.md` - プロジェクト構造

### Phase 1: 仕様の作成

#### 1. 初期化

```bash
/kiro:spec-init [詳細な機能説明]
```

**例:**
```bash
/kiro:spec-init ユーザー認証機能を実装したい。メールアドレスとパスワードでのログイン、JWT認証、パスワードリセット機能を含む
```

#### 2. 要件定義の生成

```bash
/kiro:spec-requirements [feature-name]
```

**例:**
```bash
/kiro:spec-requirements user-authentication
```

生成されたら `requirements.md` をレビューし、問題なければ承認。

#### 3. 設計の生成

```bash
/kiro:spec-design [feature-name]
```

または対話なしで自動承認:
```bash
/kiro:spec-design [feature-name] -y
```

**例:**
```bash
/kiro:spec-design user-authentication
```

生成されたら `design.md` をレビューし、承認。

#### 4. タスクの生成

```bash
/kiro:spec-tasks [feature-name]
```

または自動承認:
```bash
/kiro:spec-tasks [feature-name] -y
```

**例:**
```bash
/kiro:spec-tasks user-authentication
```

生成されたら `tasks.md` をレビューし、承認。

### Phase 2: 実装

#### 全タスクの実装

```bash
/kiro:spec-impl [feature-name]
```

#### 特定タスクの実装

```bash
# タスク1.1のみ実装
/kiro:spec-impl [feature-name] 1.1

# タスク1、2、3を実装
/kiro:spec-impl [feature-name] 1,2,3
```

**例:**
```bash
# 全タスク実装
/kiro:spec-impl user-authentication

# タスク1.1のみ
/kiro:spec-impl user-authentication 1.1
```

### 進捗確認

```bash
/kiro:spec-status [feature-name]
```

これにより以下が確認できます:
- 各フェーズの承認状況
- 現在のフェーズ
- 次に実行すべきコマンド

---

## コマンド一覧

### ステアリング管理

| コマンド | 説明 | 使用タイミング |
|---------|------|--------------|
| `/kiro:steering` | ステアリングドキュメント作成/更新 | プロジェクト開始時、大きな変更時 |
| `/kiro:steering-custom` | カスタムステアリング作成 | 専門的なルールが必要な時 |

### スペック管理

| コマンド | 説明 | 前提条件 |
|---------|------|---------|
| `/kiro:spec-init [説明]` | 仕様の初期化 | なし |
| `/kiro:spec-requirements [feature]` | 要件定義生成 | spec-init完了 |
| `/kiro:spec-design [feature] [-y]` | 設計生成 | requirements承認済み |
| `/kiro:spec-tasks [feature] [-y]` | タスク生成 | design承認済み |
| `/kiro:spec-impl [feature] [tasks]` | 実装実行 | tasks承認済み |
| `/kiro:spec-status [feature]` | 進捗確認 | いつでも |

### 検証

| コマンド | 説明 | 使用タイミング |
|---------|------|--------------|
| `/kiro:validate-design [feature]` | 設計の品質レビュー | 設計承認前 |
| `/kiro:validate-gap [feature]` | 仕様と実装のギャップ分析 | 実装後 |

---

## 実践例

### 例1: シンプルな機能追加

```bash
# 1. 仕様初期化
/kiro:spec-init ダークモード切り替え機能。ユーザーがライト/ダークテーマを切り替えられる

# 2. 要件定義
/kiro:spec-requirements dark-mode
# → requirements.mdをレビュー、必要に応じて手動編集
# → spec.jsonで "requirements": true に設定

# 3. 設計（自動承認）
/kiro:spec-design dark-mode -y
# → design.mdをレビュー、承認

# 4. タスク生成（自動承認）
/kiro:spec-tasks dark-mode -y
# → tasks.mdをレビュー、承認

# 5. 実装
/kiro:spec-impl dark-mode
```

### 例2: 段階的な実装

```bash
# 1-4は同じ

# 5. まずタスク1だけ実装
/kiro:spec-impl payment-integration 1

# 6. 動作確認後、タスク2と3を実装
/kiro:spec-impl payment-integration 2,3

# 7. 進捗確認
/kiro:spec-status payment-integration

# 8. 残りを実装
/kiro:spec-impl payment-integration
```

### 例3: 検証を含むフロー

```bash
# 1. 仕様作成（省略）

# 2. 設計の検証
/kiro:validate-design api-refactoring
# → 設計の問題点を確認、修正

# 3. 実装
/kiro:spec-impl api-refactoring

# 4. 仕様と実装のギャップ確認
/kiro:validate-gap api-refactoring
# → 実装漏れや仕様との差異を確認
```

---

## よくある質問

### Q1: ステアリングは必須ですか？

A: 新規の小さな機能であれば省略可能です。ただし、以下の場合は実行を推奨:
- 新規プロジェクト開始時
- 大きなリファクタリング前
- 技術スタックの変更時

### Q2: フェーズをスキップできますか？

A: できません。各フェーズの承認が必須です:
- 設計には要件の承認が必要
- タスクには設計の承認が必要
- 実装にはタスクの承認が必要

### Q3: 承認はどうやって行いますか？

A: `.kiro/specs/[feature-name]/spec.json` を編集:

```json
{
  "approvals": {
    "requirements": true,  // ← trueに変更
    "design": false,
    "tasks": false
  }
}
```

または次のコマンド実行時に対話形式で承認できます。

### Q4: 生成されたドキュメントを修正できますか？

A: はい！以下のファイルは自由に編集可能です:
- `requirements.md`
- `design.md`
- `tasks.md`

編集後、`spec.json`で承認してください。

### Q5: 複数の機能を並行開発できますか？

A: はい。feature-name を変えて複数のスペックを作成できます:

```
.kiro/specs/
  ├── user-authentication/
  ├── payment-integration/
  └── dark-mode/
```

### Q6: 既存コードベースに導入できますか？

A: はい。新機能から段階的に導入できます:
1. `/kiro:steering` でプロジェクトコンテキストを設定
2. 新機能を `/kiro:spec-init` から開始
3. 既存機能の改修時にも使用可能

---

## ディレクトリ構造

```
/
├── .claude/                    # Claude Code設定
│   └── commands/               # スラッシュコマンド定義
│       └── kiro/               # cc-sddコマンド群
├── .kiro/                      # cc-sdd作業ディレクトリ
│   ├── steering/               # ステアリングドキュメント
│   │   ├── product.md          # プロダクト概要
│   │   ├── tech.md             # 技術スタック
│   │   └── structure.md        # プロジェクト構造
│   └── specs/                  # 機能別スペック
│       └── <feature-name>/     # 機能名ごとのディレクトリ
│           ├── spec.json       # メタデータと承認状況
│           ├── requirements.md # 要件定義書
│           ├── design.md       # 設計書
│           └── tasks.md        # タスクリスト
└── CLAUDE.md                   # プロジェクト全体のコンテキスト
```

---

## インストール方法

```bash
# Claude Code向けインストール（日本語対応）
npx cc-sdd@latest --lang ja

# Cursor向けインストール
npx cc-sdd@latest --cursor --lang ja
```

---

## 次のステップ

1. **まずは試す**: 小さな機能で一通りのフローを体験
2. **ステアリング設定**: プロジェクトのコンテキストを記録
3. **検証機能を活用**: `validate-design` と `validate-gap` で品質向上

何か質問があれば、いつでもお聞きください！
