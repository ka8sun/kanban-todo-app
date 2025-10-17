# cc-sdd実装ガイド: プロジェクトの進め方の詳細解説

このドキュメントでは、cc-sdd (Claude Code Spec-Driven Development)を使用したプロジェクトの実装方法を、実際のカンバンToDoアプリケーションの開発プロセスを例に、詳細に解説します。

## 目次

1. [プロジェクト概要と目的](#1-プロジェクト概要と目的)
2. [初期セットアップ](#2-初期セットアップ)
3. [Phase 0: ステアリングドキュメントの作成](#3-phase-0-ステアリングドキュメントの作成)
4. [Phase 1: 仕様の段階的作成](#4-phase-1-仕様の段階的作成)
5. [Phase 2: 実装の実行](#5-phase-2-実装の実行)
6. [品質保証と検証](#6-品質保証と検証)
7. [デプロイメント](#7-デプロイメント)
8. [ベストプラクティスとトラブルシューティング](#8-ベストプラクティスとトラブルシューティング)

---

## 1. プロジェクト概要と目的

### 1.1 cc-sddとは何か

cc-sdd (Claude Code Spec-Driven Development)は、AI支援開発における以下の課題を解決するためのフレームワークです：

- **課題1**: いきなり実装して「最適化されていないコード」が生成される
- **課題2**: 大規模な実装で「どうなっているんだっけ?」という不安
- **課題3**: セッションをまたいだ時の一貫性の欠如
- **課題4**: 設計の壁打ち相手がいない

### 1.2 解決アプローチ

cc-sddは人間が開発する際の流れと同じように、以下の段階的なプロセスを採用します：

```
要件定義 → 設計 → タスク分解 → 実装
   ↓         ↓        ↓          ↓
 [承認]   [承認]   [承認]    [実行]
```

各フェーズで**人間のレビューと承認**を要求することで、納得感のある品質の高い実装を実現します。

### 1.3 プロジェクト例: カンバンToDoアプリ

本ガイドでは、以下の仕様を持つカンバンToDoアプリケーションの実装を例に説明します：

- **技術スタック**: Next.js 15, React 19, TypeScript, Supabase, Tailwind CSS, shadcn/ui
- **主要機能**: ユーザー認証、カンバンボード、タスク管理、ドラッグ&ドロップ、リアルタイム同期
- **開発期間**: 仕様策定から実装完了まで約2-3日（AI支援）

---

## 2. 初期セットアップ

### 2.1 cc-sddのインストール

プロジェクトディレクトリで以下のコマンドを実行します：

```bash
# Claude Code向けインストール（日本語対応）
npx cc-sdd@latest --lang ja

# Cursor向けインストール
npx cc-sdd@latest --cursor --lang ja
```

### 2.2 インストールされる内容

インストールすると、以下のディレクトリ構造が作成されます：

```
/
├── .claude/                    # Claude Code設定
│   └── commands/               # スラッシュコマンド定義
│       └── kiro/               # cc-sddコマンド群（11ファイル）
│           ├── steering.md
│           ├── steering-custom.md
│           ├── spec-init.md
│           ├── spec-requirements.md
│           ├── spec-design.md
│           ├── spec-tasks.md
│           ├── spec-impl.md
│           ├── spec-status.md
│           ├── validate-design.md
│           └── validate-gap.md
├── .kiro/                      # cc-sdd作業ディレクトリ
│   ├── steering/               # ステアリングドキュメント
│   └── specs/                  # 機能別スペック
└── CLAUDE.md                   # プロジェクト全体のコンテキスト
```

### 2.3 CLAUDE.mdの確認

インストール後、`CLAUDE.md`が作成されます。このファイルは：

- **役割**: プロジェクト全体のコンテキストとワークフローをAIに提供
- **自動読み込み**: Claude Codeが全てのセッションで自動的に読み込む
- **カスタマイズ可能**: プロジェクト固有のルールを追加可能

**重要**: `CLAUDE.md`は全てのAI対話で読み込まれるため、プロジェクトの一貫性を保つ鍵となります。

### 2.4 Gitリポジトリの初期化（推奨）

```bash
git init
git add .
git commit -m "Initial commit: cc-sdd project setup"
```

バージョン管理により、各フェーズの変更を追跡し、必要に応じて巻き戻せます。

---

## 3. Phase 0: ステアリングドキュメントの作成

### 3.1 ステアリングとは

**ステアリングドキュメント**は、プロジェクト全体のルールとコンテキストを定義するファイルです。AIに「このプロジェクトはどういうものか」を理解させる基盤となります。

### 3.2 ステアリングの作成タイミング

以下の場合にステアリングを作成・更新します：

- ✅ 新規プロジェクトの開始時
- ✅ 大きなリファクタリングの前
- ✅ 技術スタックの変更時
- ❌ 小規模な機能追加（省略可能）

### 3.3 ステアリングの作成方法

#### ステップ1: コマンド実行

Claude Codeのチャットで以下を実行：

```bash
/kiro:steering
```

#### ステップ2: 対話形式での入力

AIが以下の質問をしてきます。具体的に回答してください：

**Q1: プロダクトの概要を教えてください**

```
例: SupabaseをDBとして使用する看板ボード付きToDoタスクWebアプリです。
ユーザーはタスクを作成し、ドラッグ&ドロップで直感的にステータスを管理できます。
リアルタイム同期により、複数デバイス間でシームレスな体験を提供します。
```

**Q2: 技術スタックを教えてください**

```
例:
- フロントエンド: Next.js 15 (App Router), React 19, TypeScript 5.x
- バックエンド: Supabase (PostgreSQL, Auth, Realtime)
- UI: Tailwind CSS 4.x, shadcn/ui
- ドラッグ&ドロップ: @hello-pangea/dnd
- 状態管理: Zustand 4.x
- テスト: Vitest, Playwright
```

**Q3: プロジェクト構造のパターンを教えてください**

```
例:
- App Routerを使用し、/app配下にルートを配置
- コンポーネントは/components配下にAtomic Designパターンで整理
- ビジネスロジックは/services配下に分離
- 型定義は/typesに集約
- Supabaseクライアントは/lib/supabaseに配置
```

#### ステップ3: 生成されるファイル

`.kiro/steering/`に以下の3つのファイルが生成されます：

1. **product.md**: プロダクトの概要、コア機能、価値提案
2. **tech.md**: 技術スタック、アーキテクチャ、コマンド一覧
3. **structure.md**: ディレクトリ構造、ファイル命名規則、インポートルール

#### ステップ4: レビューと編集

生成されたファイルをレビューし、必要に応じて手動で編集します。これらのファイルは全てのAIセッションで読み込まれるため、正確さが重要です。

### 3.4 カスタムステアリングの作成（オプション）

特定の文脈でのみ適用したいルールがある場合、カスタムステアリングを作成します：

```bash
/kiro:steering-custom
```

例えば：

- `api-guidelines.md`: API設計のルール（*.api.tsファイルでのみ適用）
- `testing-standards.md`: テスト規約（*.test.tsファイルでのみ適用）
- `security-policy.md`: セキュリティルール（常に適用）

### 3.5 実際の例: カンバンToDoアプリのステアリング

本プロジェクトでは、以下のステアリングが作成されました：

**product.md の要点**:
- cc-sddの説明と目的
- コア機能（仕様駆動開発、ステアリング管理、進捗追跡）
- 開発哲学（思考は英語、回答は日本語）

**tech.md の要点**:
- Next.js 15 + React 19を中心としたモダンスタック
- Supabaseの認証・DB・リアルタイム機能の活用
- 3フェーズ承認ワークフローの重要性

**structure.md の要点**:
- App Routerベースのディレクトリ構造
- スペックとステアリングの分離
- 段階的な詳細化のプロセス

---

## 4. Phase 1: 仕様の段階的作成

### 4.1 仕様作成の全体フロー

仕様は以下の4ステップで段階的に詳細化します：

```
1. spec-init      → スペックの初期化
2. requirements   → 要件定義の作成
3. design         → 技術設計の作成
4. tasks          → 実装タスクの分解
```

各ステップで人間の承認を得てから次に進みます。

### 4.2 Step 1: スペックの初期化 (`spec-init`)

#### 目的
新しい機能やプロジェクトの開発を開始するための土台を作ります。

#### コマンド実行

```bash
/kiro:spec-init DBにはSupabaseを使用し、看板ボードのあるTo DoタスクWebアプリを作成したい。
```

**ポイント**:
- できるだけ詳細に機能を説明する
- 技術的な制約があれば明記する
- ユーザーストーリー形式も有効

#### 生成される内容

`.kiro/specs/kanban-todo-app/`ディレクトリが作成され、以下のファイルが生成されます：

```json
// spec.json
{
  "feature_name": "kanban-todo-app",
  "created_at": "2025-10-14T06:27:22Z",
  "updated_at": "2025-10-14T06:27:22Z",
  "language": "ja",
  "phase": "initialized",
  "approvals": {
    "requirements": {
      "generated": false,
      "approved": false
    },
    "design": {
      "generated": false,
      "approved": false
    },
    "tasks": {
      "generated": false,
      "approved": false
    }
  },
  "ready_for_implementation": false
}
```

#### 確認事項
- `feature_name`がプロジェクトに適しているか
- `language`が正しく設定されているか（日本語なら`ja`）

### 4.3 Step 2: 要件定義の作成 (`spec-requirements`)

#### 目的
機能の**何を**実装するかを明確にします。技術的な詳細には踏み込まず、ユーザー視点で要求事項を定義します。

#### コマンド実行

```bash
/kiro:spec-requirements kanban-todo-app
```

#### 生成される内容

`.kiro/specs/kanban-todo-app/requirements.md`が生成されます。内容は以下の構造を持ちます：

```markdown
# Requirements Document

## Introduction
[プロジェクトの概要とビジネス価値]

## Requirements

### Requirement 1: ユーザー認証とアカウント管理
**Objective:** [要件の目的]

#### Acceptance Criteria
1. WHEN [条件] THEN [期待する動作] SHALL [システム名] [実行内容]
2. WHERE [場所] THE [システム名] SHALL [実行内容]
3. IF [条件] THEN [システム名] SHALL [実行内容]
...
```

#### 実際の例: カンバンToDoアプリの要件定義

**Requirement 1: ユーザー認証とアカウント管理**
- Objective: 安全にアカウントを作成・ログインし、個人のタスク管理環境にアクセス
- Acceptance Criteria:
  1. WHEN ユーザーが新規登録フォームでメールアドレスとパスワードを入力し送信する THEN カンバンToDoアプリ SHALL Supabase Authを使用してアカウントを作成し、確認メールを送信する
  2. WHEN ユーザーがログアウトボタンをクリックする THEN カンバンToDoアプリ SHALL セッションを終了し、ログイン画面にリダイレクトする

**Requirement 2: カンバンボードの表示と管理**
**Requirement 3: タスクの作成と編集**
**Requirement 4: ドラッグ&ドロップによるタスク移動**
**Requirement 5: タスクのフィルタリングと検索**
**Requirement 6: データの永続化とリアルタイム同期**
**Requirement 7: レスポンシブデザインとユーザビリティ**

#### レビューのポイント

以下を確認して、必要に応じて`requirements.md`を手動編集します：

- ✅ 全ての主要機能が網羅されているか
- ✅ 要件が具体的で測定可能か（Acceptance Criteriaが明確）
- ✅ 技術的な実装詳細ではなく、ユーザー視点で記述されているか
- ✅ 非機能要件（パフォーマンス、セキュリティ等）が含まれているか
- ✅ 優先順位が暗黙的に示されているか

#### 承認方法

`spec.json`を編集して承認します：

```json
{
  "approvals": {
    "requirements": {
      "generated": true,
      "approved": true  // ← falseからtrueに変更
    }
  }
}
```

または、次のステップの`spec-design`コマンドを実行すると、対話形式で承認を求められます。

### 4.4 Step 3: 技術設計の作成 (`spec-design`)

#### 目的
要件を**どのように**実装するかを技術的に設計します。アーキテクチャ、技術選定、データモデル、API設計を詳細化します。

#### コマンド実行

```bash
# 対話形式（要件を承認したかAIが確認）
/kiro:spec-design kanban-todo-app

# 自動承認（-y フラグ）
/kiro:spec-design kanban-todo-app -y
```

#### 前提条件チェック

AIは以下を確認します：

```
要件定義(requirements.md)をレビューしましたか? [y/N]
```

- `y`と入力: 設計の生成を開始
- `N`と入力: 要件定義を先に確認するよう促す

#### 生成される内容

`.kiro/specs/kanban-todo-app/design.md`が生成されます。構造は以下の通り：

```markdown
# 技術設計書

## Overview
[機能の概要、目的、ユーザー、成功基準、Non-Goals]

## Architecture
### High-Level Architecture
[Mermaidダイアグラム]

### Technology Stack and Design Decisions
[各技術の選定理由、代替案、選定根拠]

## Data Model
### Database Schema
[テーブル定義、リレーション、インデックス]

### Entity Relationship Diagram
[Mermaidダイアグラム]

## API Design
[エンドポイント、リクエスト/レスポンス形式]

## Component Architecture
[コンポーネント構成、責務]

## State Management
[状態管理戦略、データフロー]

## Security Considerations
[認証、認可、セキュリティ対策]

## Performance Optimization
[最適化戦略、計測方法]

## Error Handling
[エラー処理方針、ロギング]

## Testing Strategy
[テスト種別、カバレッジ目標]
```

#### 実際の例: カンバンToDoアプリの設計

**High-Level Architecture**:
```
クライアント層（Next.js + React）
  ↓
API層（Next.js API Routes + 認証ミドルウェア）
  ↓
Supabaseサービス（Auth + PostgreSQL + Realtime）
```

**Technology Stack の選定理由**:
- Next.js 15: React 19完全サポート、Turbopack成熟、SSR/SSG/ISRの柔軟性
- shadcn/ui: Radix UIベースの高品質コンポーネント、Tailwindとの統合
- @hello-pangea/dnd: カンバンボードに最適化、アクセシビリティ完備
- Zustand: 軽量な状態管理、React Contextより高パフォーマンス

**Database Schema**:
```sql
-- columnsテーブル
CREATE TABLE columns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- tasksテーブル
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  column_id UUID NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Component Architecture**:
- `BoardPage`: カンバンボード全体のコンテナ
- `Column`: 列コンポーネント（タスクリストを含む）
- `TaskCard`: 個別タスクカード
- `TaskModal`: タスク詳細編集モーダル
- `AuthProvider`: 認証コンテキストプロバイダー

#### レビューのポイント

以下を確認して、必要に応じて`design.md`を手動編集します：

- ✅ アーキテクチャが要件を満たしているか
- ✅ 技術選定の理由が明確か
- ✅ データモデルが正規化され、適切なインデックスが設定されているか
- ✅ APIエンドポイントが RESTful か、適切なHTTPメソッドを使用しているか
- ✅ セキュリティ対策（認証、認可、RLS）が考慮されているか
- ✅ パフォーマンス最適化戦略が含まれているか
- ✅ エラーハンドリングとロギング方針が定義されているか

#### 設計品質の検証（オプション）

設計の品質をAIにレビューさせることができます：

```bash
/kiro:validate-design kanban-todo-app
```

AIは以下をチェックします：
- アーキテクチャの整合性
- 技術選定の妥当性
- セキュリティ考慮事項の網羅性
- スケーラビリティの懸念
- テスト可能性

#### 承認方法

`spec.json`を編集：

```json
{
  "approvals": {
    "design": {
      "generated": true,
      "approved": true  // ← falseからtrueに変更
    }
  },
  "phase": "design-approved"  // ← phaseも更新される
}
```

### 4.5 Step 4: タスクの分解 (`spec-tasks`)

#### 目的
設計を実装可能な**具体的なタスク**に分解します。各タスクは1-2時間で完了できる粒度が理想です。

#### コマンド実行

```bash
# 対話形式（要件と設計の両方を承認したかAIが確認）
/kiro:spec-tasks kanban-todo-app

# 自動承認（-y フラグ）
/kiro:spec-tasks kanban-todo-app -y
```

#### 前提条件チェック

AIは以下を確認します：

```
要件定義(requirements.md)と設計書(design.md)の両方をレビューしましたか? [y/N]
```

#### 生成される内容

`.kiro/specs/kanban-todo-app/tasks.md`が生成されます。構造は以下の通り：

```markdown
# 実装計画

- [ ] 1. プロジェクト基盤とSupabase環境の構築
- [ ] 1.1 Next.js 15プロジェクトの初期化とTypeScript設定
  - Next.js 15とReact 19をインストール
  - TypeScript 5.xの設定ファイルを作成
  - Tailwind CSS 4.xをインストール
  - shadcn/uiを初期化
  - ESLintとPrettierの設定を追加
  - _Requirements: 全要件に共通する基盤_

- [ ] 1.2 Supabaseプロジェクトのセットアップと接続
  - Supabaseプロジェクトを作成
  - Supabase JavaScriptクライアントをインストール
  - 環境変数を設定
  - Supabaseクライアントユーティリティを作成
  - _Requirements: 全要件に共通するバックエンド接続_

- [ ] 2. 認証システムの実装
- [ ] 2.1 Supabase Auth統合と認証サービスの作成
  ...
```

#### タスクの構造

各タスクは以下の要素を持ちます：

- **チェックボックス**: 進捗状況を表示
- **番号**: 階層的なタスクID（例: 1.1, 1.2, 2.1）
- **タイトル**: タスクの概要
- **詳細**: 具体的な実装内容（箇条書き）
- **Requirements**: 関連する要件番号

#### 実際の例: カンバンToDoアプリのタスク分解

```markdown
- [ ] 1. プロジェクト基盤とSupabase環境の構築
- [ ] 1.1 Next.js 15プロジェクトの初期化とTypeScript設定
- [ ] 1.2 Supabaseプロジェクトのセットアップと接続
- [ ] 1.3 データベーススキーマの作成とRLSポリシー設定
- [ ] 1.4 リアルタイム通知トリガーの実装

- [ ] 2. 認証システムの実装
- [ ] 2.1 Supabase Auth統合と認証サービスの作成
- [ ] 2.2 認証ミドルウェアとセッション管理の実装
- [ ] 2.3 認証UIコンポーネントの作成
- [ ] 2.4 ログアウト機能とルーティング保護の実装

- [ ] 3. 状態管理とデータ層の構築
- [ ] 3.1 Zustand Storeの基盤構築
- [ ] 3.2 BoardServiceの実装とボード・列管理アクション
- [ ] 3.3 TaskServiceの実装とタスク管理アクション
- [ ] 3.4 RealtimeServiceの実装とリアルタイム同期

- [ ] 4. カンバンボードUIの構築
- [ ] 4.1 カンバンボードレイアウトとヘッダーの作成
- [ ] 4.2 列コンポーネントの実装
- [ ] 4.3 タスクカードコンポーネントの実装
- [ ] 4.4 ドラッグ&ドロップ機能の実装

- [ ] 5. タスク操作機能の実装
- [ ] 5.1 タスク作成モーダルの実装
- [ ] 5.2 タスク編集モーダルの実装
- [ ] 5.3 タスク削除機能の実装

- [ ] 6. フィルタリングと検索機能の実装
- [ ] 6.1 検索バーコンポーネントの作成
- [ ] 6.2 フィルタリングロジックの実装

- [ ] 7. レスポンシブ対応とユーザビリティ向上
- [ ] 7.1 モバイルレイアウトの実装
- [ ] 7.2 ローディング状態とエラー表示の改善
- [ ] 7.3 アニメーションとフィードバックの追加

- [ ] 8. テストとCI/CD
- [ ] 8.1 ユニットテストの実装
- [ ] 8.2 統合テストの実装
- [ ] 8.3 E2Eテストの実装
- [ ] 8.4 GitHub Actions CI/CDパイプラインの設定

- [ ] 9. デプロイメント準備
- [ ] 9.1 環境変数の設定と検証
- [ ] 9.2 Vercelへのデプロイ設定
- [ ] 9.3 パフォーマンス計測とLighthouse監査
```

**合計**: 大カテゴリ9個、タスク30個

#### レビューのポイント

以下を確認して、必要に応じて`tasks.md`を手動編集します：

- ✅ タスクが論理的な順序で並んでいるか
- ✅ 各タスクの粒度が適切か（1-2時間で完了可能）
- ✅ タスク間の依存関係が明確か
- ✅ 全ての要件がタスクにマッピングされているか
- ✅ テストとデプロイメントが含まれているか

#### タスクのカスタマイズ

プロジェクトの状況に応じて、タスクを追加・削除・並び替えできます：

- **既存プロジェクトへの追加**: 既にNext.jsプロジェクトがある場合、1.1をスキップ
- **段階的リリース**: 重要度の低いタスクを後回しにする
- **並行開発**: 依存関係のないタスクを複数人で分担

#### 承認方法

`spec.json`を編集：

```json
{
  "approvals": {
    "tasks": {
      "generated": true,
      "approved": true  // ← falseからtrueに変更
    }
  },
  "phase": "implementation-ready",
  "ready_for_implementation": true
}
```

### 4.6 進捗確認

各フェーズの進捗を確認するには：

```bash
/kiro:spec-status kanban-todo-app
```

出力例：

```
📊 スペックステータス: kanban-todo-app

フェーズ: implementation-ready

承認状況:
✅ 要件定義 (requirements.md) - 承認済み
✅ 設計 (design.md) - 承認済み
✅ タスク (tasks.md) - 承認済み

実装準備完了: ✅

次のステップ:
  /kiro:spec-impl kanban-todo-app
```

---

## 5. Phase 2: 実装の実行

### 5.1 実装フェーズの概要

タスクが承認されたら、いよいよ実装を開始します。cc-sddは以下の柔軟な実装方法をサポートします：

1. **全タスク一括実装**: 全タスクを順番に実行
2. **特定タスクの実装**: 特定のタスクのみを実行
3. **複数タスクの実装**: 選択したタスクを実行

### 5.2 全タスクの実装

#### コマンド実行

```bash
/kiro:spec-impl kanban-todo-app
```

#### 実行プロセス

AIは以下のプロセスで実装を進めます：

1. **tasks.mdの読み込み**: 全タスクリストを確認
2. **依存関係の解析**: タスクの実行順序を決定
3. **順次実行**: 各タスクを順番に実装
4. **進捗更新**: 各タスクの完了時に`tasks.md`のチェックボックスを更新
5. **エラーハンドリング**: エラー発生時に停止し、修正を促す

#### 実装中の監視

実装中、AIは以下を行います：

- ファイルの作成・編集
- 依存関係のインストール
- データベースマイグレーションの実行
- テストの実行
- ビルドの確認

#### 実装例: タスク1.1の実行

```bash
# タスク1.1: Next.js 15プロジェクトの初期化とTypeScript設定
npx create-next-app@latest . --typescript --tailwind --app --eslint

# 依存関係のインストール
npm install @supabase/supabase-js zustand @hello-pangea/dnd

# shadcn/uiの初期化
npx shadcn@latest init

# shadcn/uiコンポーネントのインストール
npx shadcn@latest add button dialog input textarea select
```

### 5.3 特定タスクの実装

#### コマンド実行

```bash
# タスク番号を指定
/kiro:spec-impl kanban-todo-app 1.1

# サブタスクを指定
/kiro:spec-impl kanban-todo-app 2.1
```

#### 使用例: 段階的な実装

```bash
# まず基盤を構築
/kiro:spec-impl kanban-todo-app 1.1
/kiro:spec-impl kanban-todo-app 1.2
/kiro:spec-impl kanban-todo-app 1.3

# 動作確認後、認証システムを実装
/kiro:spec-impl kanban-todo-app 2.1
/kiro:spec-impl kanban-todo-app 2.2
```

### 5.4 複数タスクの実装

#### コマンド実行

```bash
# カンマ区切りで複数指定
/kiro:spec-impl kanban-todo-app 1,2,3

# 範囲指定（サブタスク）
/kiro:spec-impl kanban-todo-app 2.1,2.2,2.3
```

### 5.5 実装中のベストプラクティス

#### 1. 頻繁なコミット

各タスクの完了時にコミットを作成します：

```bash
git add .
git commit -m "feat: implement task 1.1 - Next.js project initialization"
```

#### 2. 定期的なテスト実行

タスク完了時にテストを実行し、既存機能が壊れていないか確認します：

```bash
npm test
npm run test:e2e
```

#### 3. ビルドの検証

定期的にビルドが成功するか確認します：

```bash
npm run build
```

#### 4. 実装状況の記録

`tasks.md`のチェックボックスを手動または自動で更新し、進捗を可視化します：

```markdown
- [x] 1.1 Next.js 15プロジェクトの初期化とTypeScript設定
- [x] 1.2 Supabaseプロジェクトのセットアップと接続
- [ ] 1.3 データベーススキーマの作成とRLSポリシー設定
```

### 5.6 エラーハンドリング

#### エラー発生時の対処

実装中にエラーが発生した場合：

1. **エラーメッセージの確認**: ログを詳細に確認
2. **設計書の見直し**: `design.md`の関連部分を確認
3. **タスクの調整**: 必要に応じて`tasks.md`を修正
4. **再実行**: 修正後、同じタスクを再実行

#### 例: データベースエラーの対処

```bash
# エラー: RLSポリシーが設定されていない
ERROR: permission denied for table tasks

# 対処: SupabaseダッシュボードでRLSを確認
# 1. Supabase Dashboard → Authentication → Policies
# 2. tasksテーブルのRLSポリシーを確認・修正
# 3. タスクを再実行
/kiro:spec-impl kanban-todo-app 1.3
```

### 5.7 実装完了の確認

全タスクが完了したら、以下を確認します：

```bash
# ステータス確認
/kiro:spec-status kanban-todo-app

# 全テスト実行
npm test

# E2Eテスト実行
npm run test:e2e

# ビルド確認
npm run build

# 開発サーバー起動
npm run dev
```

出力例：

```
📊 スペックステータス: kanban-todo-app

フェーズ: implementation-complete

承認状況:
✅ 要件定義 (requirements.md) - 承認済み
✅ 設計 (design.md) - 承認済み
✅ タスク (tasks.md) - 承認済み

実装状況:
✅ 30/30 タスク完了

次のステップ:
  /kiro:validate-gap kanban-todo-app  # 実装と仕様のギャップ検証
```

---

## 6. 品質保証と検証

### 6.1 設計品質の検証

実装前または実装中に設計の品質をレビューします。

#### コマンド実行

```bash
/kiro:validate-design kanban-todo-app
```

#### 検証内容

AIは以下の観点で設計を評価します：

1. **アーキテクチャの整合性**
   - コンポーネント間の責務分離が適切か
   - データフローが明確か
   - 依存関係が循環していないか

2. **技術選定の妥当性**
   - 選定理由が明確か
   - 代替案が検討されているか
   - トレードオフが理解されているか

3. **セキュリティ考慮事項**
   - 認証・認可が適切か
   - SQLインジェクション対策があるか
   - XSS対策が施されているか

4. **スケーラビリティ**
   - データ量増加に対応できるか
   - ユーザー数増加に耐えられるか
   - ボトルネックが特定されているか

5. **テスト可能性**
   - ユニットテストが書きやすいか
   - 統合テストの範囲が明確か
   - E2Eテストの戦略が定義されているか

#### 出力例

```markdown
## 設計検証レポート: kanban-todo-app

### 総合評価: ⭐⭐⭐⭐☆ (4/5)

### 強み
✅ Supabase RLSによる堅牢なセキュリティ設計
✅ リアルタイム同期の明確な実装戦略
✅ shadcn/uiによる一貫したUI設計

### 改善推奨
⚠️ オフライン時の同期戦略が不明確
⚠️ 大量タスク（1000件以上）時のパフォーマンス対策が不足
⚠️ エラーバウンダリの配置が未定義

### 詳細フィードバック
...
```

#### 対応方法

レポートを元に`design.md`を修正し、再度レビューします。

### 6.2 実装と仕様のギャップ検証

実装完了後、仕様と実装の整合性を確認します。

#### コマンド実行

```bash
/kiro:validate-gap kanban-todo-app
```

#### 検証内容

AIは以下を確認します：

1. **要件の充足度**
   - 全てのAcceptance Criteriaが実装されているか
   - 各要件が正しく動作するか

2. **設計との一致**
   - データベーススキーマが設計通りか
   - APIエンドポイントが設計通りか
   - コンポーネント構成が設計通りか

3. **タスクの完了状況**
   - 全タスクが実装されているか
   - チェックボックスが正しく更新されているか

4. **未実装機能の洗い出し**
   - 要件に対して不足している機能
   - 設計に対して不足している実装

#### 出力例

```markdown
## ギャップ分析レポート: kanban-todo-app

### 要件充足度: 95%

### 実装済み機能
✅ Requirement 1: ユーザー認証とアカウント管理 - 完全実装
✅ Requirement 2: カンバンボードの表示と管理 - 完全実装
✅ Requirement 3: タスクの作成と編集 - 完全実装
✅ Requirement 4: ドラッグ&ドロップによるタスク移動 - 完全実装
⚠️ Requirement 5: タスクのフィルタリングと検索 - 部分実装（優先度フィルター未実装）
✅ Requirement 6: データの永続化とリアルタイム同期 - 完全実装
⚠️ Requirement 7: レスポンシブデザインとユーザビリティ - 部分実装（チュートリアル未実装）

### 未実装機能
❌ タスク優先度フィルター (Requirement 5)
❌ 初回利用時チュートリアル (Requirement 7)

### 推奨対応
1. タスク6.2の実装を見直し、優先度フィルターを追加
2. タスク7.2を追加し、チュートリアルを実装
```

#### 対応方法

1. 未実装機能を`tasks.md`に追加
2. 追加タスクを実装
3. 再度ギャップ検証を実行

### 6.3 テスト戦略

#### 6.3.1 ユニットテスト

個別の関数やコンポーネントをテストします。

**例: TaskServiceのテスト**

```typescript
// __tests__/services/task.service.test.ts
import { describe, it, expect, vi } from 'vitest'
import { TaskService } from '@/services/task.service'

describe('TaskService', () => {
  it('should create a task', async () => {
    const task = await TaskService.createTask({
      columnId: 'col-1',
      title: 'Test Task',
      description: 'Test Description'
    })
    expect(task.title).toBe('Test Task')
  })
})
```

#### 6.3.2 統合テスト

複数のモジュールが連携して動作することをテストします。

**例: カンバンボードのタスク作成フロー**

```typescript
// __tests__/integration/board.test.tsx
import { render, fireEvent, waitFor } from '@testing-library/react'
import { BoardPage } from '@/app/board/page'

describe('Board Integration', () => {
  it('should create a new task', async () => {
    const { getByText, getByPlaceholderText } = render(<BoardPage />)

    fireEvent.click(getByText('+ タスクを追加'))
    fireEvent.change(getByPlaceholderText('タスクタイトル'), {
      target: { value: 'New Task' }
    })
    fireEvent.click(getByText('保存'))

    await waitFor(() => {
      expect(getByText('New Task')).toBeInTheDocument()
    })
  })
})
```

#### 6.3.3 E2Eテスト

実際のブラウザでユーザーフローをテストします。

**例: 認証からタスク作成までのフロー**

```typescript
// e2e/auth-and-task-creation.spec.ts
import { test, expect } from '@playwright/test'

test('user can sign up and create a task', async ({ page }) => {
  // サインアップ
  await page.goto('/signup')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'password123')
  await page.click('button[type="submit"]')

  // カンバンボードに遷移
  await expect(page).toHaveURL('/board')

  // タスクを作成
  await page.click('text=+ タスクを追加')
  await page.fill('input[name="title"]', 'My First Task')
  await page.click('button:has-text("保存")')

  // タスクが表示されることを確認
  await expect(page.locator('text=My First Task')).toBeVisible()
})
```

### 6.4 CI/CDパイプラインの設定

#### GitHub Actionsワークフロー

`.github/workflows/ci.yml`を作成し、自動テストとビルドを設定します：

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  unit-and-integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
```

---

## 7. デプロイメント

### 7.1 環境変数の設定

#### ローカル開発環境

`.env.local`ファイルを作成：

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: For development
NODE_ENV=development
```

#### Vercel本番環境

Vercelダッシュボードで環境変数を設定：

1. Vercelプロジェクト画面で `Settings` → `Environment Variables`
2. 以下を追加:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 7.2 Vercelへのデプロイ

#### 方法1: Vercel CLI

```bash
# Vercel CLIをインストール
npm install -g vercel

# ログイン
vercel login

# プレビューデプロイ
vercel

# 本番デプロイ
vercel --prod
```

#### 方法2: GitHub統合

1. [Vercelダッシュボード](https://vercel.com/dashboard)にアクセス
2. `New Project` をクリック
3. GitHubリポジトリを選択
4. 環境変数を設定
5. `Deploy` をクリック

**自動化**:
- `main`ブランチへのpush → 本番環境へ自動デプロイ
- Pull Request → プレビュー環境へ自動デプロイ

### 7.3 パフォーマンス計測

#### Lighthouseによる計測

```bash
# ローカルサーバーを起動
npm run build
npm run start

# 別のターミナルでLighthouseを実行
npm run perf:lighthouse
```

#### パフォーマンス目標

設計書で定義された目標値：

- **Performance スコア**: 90以上
- **First Contentful Paint (FCP)**: 1.5秒以内
- **Largest Contentful Paint (LCP)**: 2.5秒以内
- **Time to Interactive (TTI)**: 3.8秒以内
- **Total Blocking Time (TBT)**: 200ms以内
- **Cumulative Layout Shift (CLS)**: 0.1以下

---

## 8. ベストプラクティスとトラブルシューティング

### 8.1 ベストプラクティス

#### 1. ステアリングを常に最新に保つ

プロジェクトの方向性が変わったら、ステアリングを更新します：

```bash
/kiro:steering
```

#### 2. 各フェーズで人間がレビューする

AIが生成したドキュメントは必ずレビューし、必要に応じて手動で修正します。

#### 3. 頻繁にコミットする

各タスクの完了時、または意味のある区切りでコミットを作成します。

#### 4. テストを先に書く（TDD）

可能であれば、実装前にテストを書くTDD（Test-Driven Development）を採用します。

#### 5. ドキュメントを更新し続ける

実装中に仕様が変わった場合、`requirements.md`、`design.md`、`tasks.md`を更新します。

### 8.2 よくある問題と解決策

#### 問題1: 要件定義が曖昧

**症状**: 生成された`requirements.md`が具体性に欠ける

**解決策**:
1. `spec-init`でより詳細な説明を提供
2. `requirements.md`を手動で編集し、Acceptance Criteriaを具体化
3. ユーザーストーリーを追加

#### 問題2: 設計が複雑すぎる

**症状**: 生成された`design.md`が過剰に複雑

**解決策**:
1. `/kiro:validate-design`で設計を検証
2. Non-Goalsを明確にし、スコープを絞る
3. MVP（Minimum Viable Product）を優先

#### 問題3: タスクの粒度が不適切

**症状**: タスクが大きすぎる、または小さすぎる

**解決策**:
1. `tasks.md`を手動で編集し、タスクを分割または統合
2. 1-2時間で完了できる粒度を目安にする

#### 問題4: 実装中にエラーが頻発

**症状**: タスク実行中に予期しないエラーが発生

**解決策**:
1. エラーログを詳細に確認
2. `design.md`の関連部分を見直す
3. タスクを細分化して、問題箇所を特定

#### 問題5: 仕様と実装にギャップがある

**症状**: `/kiro:validate-gap`で大量の未実装機能が検出

**解決策**:
1. 未実装機能を`tasks.md`に追加
2. 優先順位を付けて順次実装
3. 必要に応じて要件を見直し、スコープを調整

### 8.3 トラブルシューティングチェックリスト

実装中に問題が発生したら、以下を確認してください：

- [ ] `CLAUDE.md`が最新で、プロジェクトのコンテキストが正確か
- [ ] ステアリングドキュメント（`product.md`, `tech.md`, `structure.md`）が最新か
- [ ] `spec.json`の承認フラグが正しく設定されているか
- [ ] 環境変数（`.env.local`）が正しく設定されているか
- [ ] 依存関係（`package.json`）が最新か
- [ ] データベーススキーマとRLSポリシーが設計通りか
- [ ] テストが全てパスしているか
- [ ] ビルドが成功しているか

---

## 9. まとめ

### 9.1 cc-sddのメリット

1. **段階的な詳細化**: 要件 → 設計 → タスク → 実装という明確なフロー
2. **納得感のある出力**: 各フェーズでの人間のレビューにより、品質が向上
3. **一貫性の維持**: ステアリングとスペックにより、セッションをまたいでも一貫性を保つ
4. **設計の壁打ち**: AIと対話しながら、設計を洗練できる
5. **ドキュメントの自動生成**: 要件定義、設計書、タスクリストが自動生成される

### 9.2 推奨ワークフロー

```
1. プロジェクト開始
   ↓
2. /kiro:steering でステアリング作成
   ↓
3. /kiro:spec-init で仕様初期化
   ↓
4. /kiro:spec-requirements で要件定義
   ↓ (レビュー・承認)
5. /kiro:spec-design で設計
   ↓ (レビュー・承認)
6. /kiro:validate-design で設計検証
   ↓
7. /kiro:spec-tasks でタスク分解
   ↓ (レビュー・承認)
8. /kiro:spec-impl で実装
   ↓
9. /kiro:validate-gap でギャップ検証
   ↓
10. テスト・デプロイ
```

### 9.3 次のステップ

このガイドを参考に、あなた自身のプロジェクトでcc-sddを試してみてください。小さな機能から始めて、徐々に大きなプロジェクトに適用していくことをおすすめします。

**始め方**:
1. 小規模な機能で一通りのフローを体験（例: ダークモード切り替え）
2. ステアリング設定でプロジェクトのコンテキストを記録
3. 検証機能（`validate-design`、`validate-gap`）を活用して品質向上

何か質問があれば、いつでもお聞きください！

---

## 付録: 参考リンク

- [cc-sdd GitHub リポジトリ](https://github.com/your-repo/cc-sdd)
- [Claude Code ドキュメント](https://docs.claude.com/claude-code)
- [Supabase ドキュメント](https://supabase.com/docs)
- [Next.js ドキュメント](https://nextjs.org/docs)
- [Vercel デプロイメントガイド](https://vercel.com/docs)
