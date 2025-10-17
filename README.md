# test_todo_app

SupabaseをDBとして使用する看板ボード付きToDoタスクWebアプリ

## プロジェクト概要

このプロジェクトは、Claude Code Spec-Driven Development (cc-sdd) を使用して開発されたToDoアプリケーションです。

## 技術スタック

- **データベース**: Supabase
- **開発手法**: Spec-Driven Development (SDD)
- **IDE**: Claude Code / VSCode Extension

## Supabaseセットアップ

### 1. Supabaseプロジェクトの作成

1. [Supabase](https://app.supabase.com/)にアクセスし、アカウントを作成またはログイン
2. 「New Project」をクリックして新しいプロジェクトを作成
3. プロジェクト名、データベースパスワード、リージョンを設定

### 2. 環境変数の設定

1. Supabaseダッシュボードの「Settings」→「API」から以下の情報を取得:
   - Project URL
   - API Key (anon/public)

2. プロジェクトルートの `.env.local` ファイルに以下を設定:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. データベーススキーマのセットアップ

Supabase SQLエディタで以下のスキーマを実行してください（タスク1.3で実装予定）。

## 開発ステータス

プロジェクトの詳細な仕様とタスクは `.kiro/specs/kanban-todo-app/` ディレクトリを参照してください。

### 完了したタスク

- [x] 1.1 Next.js 15プロジェクトの初期化とTypeScript設定
- [x] 1.2 Supabaseプロジェクトのセットアップと接続
