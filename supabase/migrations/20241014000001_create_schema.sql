-- カンバンToDoアプリのデータベーススキーマ作成
-- 作成日: 2024-10-14

-- columnsテーブルの作成
CREATE TABLE IF NOT EXISTS public.columns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    position INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- 制約: 列名は空でない
    CONSTRAINT columns_name_not_empty CHECK (length(trim(name)) > 0)
);

-- columnsテーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_columns_user_id ON public.columns(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_columns_user_position ON public.columns(user_id, position);

-- tasksテーブルの作成
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    column_id UUID NOT NULL REFERENCES public.columns(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority VARCHAR(10) NOT NULL DEFAULT 'medium',
    position INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- 制約: タイトルは空でない
    CONSTRAINT tasks_title_not_empty CHECK (length(trim(title)) > 0),
    -- 制約: 優先度は定義された値のみ
    CONSTRAINT tasks_priority_check CHECK (priority IN ('low', 'medium', 'high'))
);

-- tasksテーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_column_id ON public.tasks(column_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tasks_column_position ON public.tasks(column_id, position);

-- updated_at自動更新関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- columnsテーブルのupdated_atトリガー
DROP TRIGGER IF EXISTS update_columns_updated_at ON public.columns;
CREATE TRIGGER update_columns_updated_at
    BEFORE UPDATE ON public.columns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- tasksテーブルのupdated_atトリガー
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) の有効化
ALTER TABLE public.columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- columnsテーブルのRLSポリシー

-- ユーザーは自分の列のみ参照可能
DROP POLICY IF EXISTS "Users can view their own columns" ON public.columns;
CREATE POLICY "Users can view their own columns"
    ON public.columns
    FOR SELECT
    USING (auth.uid() = user_id);

-- ユーザーは自分の列のみ作成可能
DROP POLICY IF EXISTS "Users can create their own columns" ON public.columns;
CREATE POLICY "Users can create their own columns"
    ON public.columns
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分の列のみ更新可能
DROP POLICY IF EXISTS "Users can update their own columns" ON public.columns;
CREATE POLICY "Users can update their own columns"
    ON public.columns
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分の列のみ削除可能
DROP POLICY IF EXISTS "Users can delete their own columns" ON public.columns;
CREATE POLICY "Users can delete their own columns"
    ON public.columns
    FOR DELETE
    USING (auth.uid() = user_id);

-- tasksテーブルのRLSポリシー

-- ユーザーは自分のタスクのみ参照可能
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
CREATE POLICY "Users can view their own tasks"
    ON public.tasks
    FOR SELECT
    USING (auth.uid() = user_id);

-- ユーザーは自分のタスクのみ作成可能
DROP POLICY IF EXISTS "Users can create their own tasks" ON public.tasks;
CREATE POLICY "Users can create their own tasks"
    ON public.tasks
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のタスクのみ更新可能
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
CREATE POLICY "Users can update their own tasks"
    ON public.tasks
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のタスクのみ削除可能
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;
CREATE POLICY "Users can delete their own tasks"
    ON public.tasks
    FOR DELETE
    USING (auth.uid() = user_id);
