# Supabase データベース設定

このディレクトリには、カンバンToDoアプリのデータベーススキーマとマイグレーションファイルが含まれています。

## マイグレーションファイル

1. **20241014000001_create_schema.sql**
   - columnsテーブルとtasksテーブルの作成
   - インデックスの作成
   - Row Level Security (RLS)ポリシーの設定
   - updated_at自動更新トリガーの作成

2. **20241014000002_create_realtime_triggers.sql**
   - タスクと列の変更をリアルタイムで通知するトリガー関数
   - PostgreSQL NOTIFYを使用したリアルタイムブロードキャスト

## マイグレーションの適用方法

### オプション1: Supabase CLI を使用（推奨）

```bash
# Supabase CLIのインストール（未インストールの場合）
npm install -g supabase

# Supabaseプロジェクトにリンク
supabase link --project-ref dvcmnmhwcjsplxuurhqh

# マイグレーションの適用
supabase db push
```

### オプション2: Supabase SQL Editor を使用

1. [Supabase ダッシュボード](https://app.supabase.com/project/dvcmnmhwcjsplxuurhqh/editor) にアクセス
2. SQL Editor を開く
3. 以下の順序でマイグレーションファイルの内容をコピー&ペーストして実行:
   - `20241014000001_create_schema.sql`
   - `20241014000002_create_realtime_triggers.sql`

## リアルタイム機能の有効化

マイグレーション適用後、Supabaseダッシュボードでリアルタイム機能を有効化してください:

1. [Database > Replication](https://app.supabase.com/project/dvcmnmhwcjsplxuurhqh/database/replication) にアクセス
2. 以下のテーブルのReplicationを有効化:
   - `public.columns`
   - `public.tasks`

## データベーススキーマ

### columnsテーブル

| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|-----|------|
| id | UUID | PRIMARY KEY | 列ID |
| user_id | UUID | NOT NULL, FK to auth.users | 所有ユーザーID |
| name | VARCHAR(100) | NOT NULL | 列名 |
| position | INTEGER | NOT NULL | 表示順序 |
| created_at | TIMESTAMPTZ | NOT NULL | 作成日時 |
| updated_at | TIMESTAMPTZ | NOT NULL | 更新日時 |

**インデックス**:
- `idx_columns_user_id` ON (user_id)
- `idx_columns_user_position` ON (user_id, position) UNIQUE

### tasksテーブル

| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|-----|------|
| id | UUID | PRIMARY KEY | タスクID |
| user_id | UUID | NOT NULL, FK to auth.users | 所有ユーザーID |
| column_id | UUID | NOT NULL, FK to columns | 所属列ID |
| title | VARCHAR(200) | NOT NULL | タスクタイトル |
| description | TEXT | NULL | タスク説明 |
| priority | VARCHAR(10) | NOT NULL | 優先度 (low/medium/high) |
| position | INTEGER | NOT NULL | 列内での表示順序 |
| created_at | TIMESTAMPTZ | NOT NULL | 作成日時 |
| updated_at | TIMESTAMPTZ | NOT NULL | 更新日時 |

**インデックス**:
- `idx_tasks_user_id` ON (user_id)
- `idx_tasks_column_id` ON (column_id)
- `idx_tasks_column_position` ON (column_id, position) UNIQUE

## Row Level Security (RLS)

すべてのテーブルでRLSが有効化されており、ユーザーは自分のデータのみにアクセスできます:

- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`
- UPDATE: `auth.uid() = user_id`
- DELETE: `auth.uid() = user_id`

## リアルタイム通知

タスクと列の変更（INSERT、UPDATE、DELETE）が発生すると、以下の形式で通知が送信されます:

**チャネル名**: `board:{user_id}:changes`

**イベントタイプ**:
- `task_created` - タスク作成
- `task_updated` - タスク更新
- `task_deleted` - タスク削除
- `column_created` - 列作成
- `column_updated` - 列更新
- `column_deleted` - 列削除

**ペイロード形式**:
```json
{
  "type": "task_created",
  "payload": {
    "id": "uuid",
    "user_id": "uuid",
    "column_id": "uuid",
    "title": "タスクタイトル",
    "description": "タスク説明",
    "priority": "medium",
    "position": 0,
    "created_at": "2024-10-14T00:00:00Z",
    "updated_at": "2024-10-14T00:00:00Z"
  },
  "timestamp": 1697260800.123
}
```

## トラブルシューティング

### マイグレーションが失敗する場合

1. Supabaseプロジェクトが正しくリンクされているか確認
2. データベース接続情報が正しいか確認
3. 既存のテーブルやポリシーと競合していないか確認

### リアルタイム通知が届かない場合

1. Database > Replication でテーブルのレプリケーションが有効化されているか確認
2. Supabaseクライアントの初期化時にリアルタイム機能が有効になっているか確認
3. ブラウザのコンソールでWebSocket接続エラーがないか確認

## 次のステップ

マイグレーション適用後、以下のタスクに進んでください:
- タスク2.1: 認証システムの実装
- タスク3.1: Zustand Storeの基盤構築
