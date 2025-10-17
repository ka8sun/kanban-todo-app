-- リアルタイム通知トリガーの作成
-- 作成日: 2024-10-14

-- tasksテーブルのリアルタイム通知関数
CREATE OR REPLACE FUNCTION notify_task_changes()
RETURNS TRIGGER AS $$
DECLARE
    event_type TEXT;
    payload JSONB;
BEGIN
    -- イベントタイプの決定
    IF TG_OP = 'INSERT' THEN
        event_type := 'task_created';
        payload := row_to_json(NEW)::jsonb;
    ELSIF TG_OP = 'UPDATE' THEN
        event_type := 'task_updated';
        payload := row_to_json(NEW)::jsonb;
    ELSIF TG_OP = 'DELETE' THEN
        event_type := 'task_deleted';
        payload := jsonb_build_object(
            'id', OLD.id,
            'column_id', OLD.column_id,
            'user_id', OLD.user_id
        );
    END IF;

    -- リアルタイムチャネルにブロードキャスト
    -- チャネル名パターン: board:{user_id}:changes
    PERFORM pg_notify(
        'board:' || COALESCE(NEW.user_id, OLD.user_id)::text || ':changes',
        json_build_object(
            'type', event_type,
            'payload', payload,
            'timestamp', extract(epoch from now())
        )::text
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- columnsテーブルのリアルタイム通知関数
CREATE OR REPLACE FUNCTION notify_column_changes()
RETURNS TRIGGER AS $$
DECLARE
    event_type TEXT;
    payload JSONB;
BEGIN
    -- イベントタイプの決定
    IF TG_OP = 'INSERT' THEN
        event_type := 'column_created';
        payload := row_to_json(NEW)::jsonb;
    ELSIF TG_OP = 'UPDATE' THEN
        event_type := 'column_updated';
        payload := row_to_json(NEW)::jsonb;
    ELSIF TG_OP = 'DELETE' THEN
        event_type := 'column_deleted';
        payload := jsonb_build_object(
            'id', OLD.id,
            'user_id', OLD.user_id
        );
    END IF;

    -- リアルタイムチャネルにブロードキャスト
    -- チャネル名パターン: board:{user_id}:changes
    PERFORM pg_notify(
        'board:' || COALESCE(NEW.user_id, OLD.user_id)::text || ':changes',
        json_build_object(
            'type', event_type,
            'payload', payload,
            'timestamp', extract(epoch from now())
        )::text
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- tasksテーブルのリアルタイム通知トリガー
DROP TRIGGER IF EXISTS notify_task_changes_trigger ON public.tasks;
CREATE TRIGGER notify_task_changes_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION notify_task_changes();

-- columnsテーブルのリアルタイム通知トリガー
DROP TRIGGER IF EXISTS notify_column_changes_trigger ON public.columns;
CREATE TRIGGER notify_column_changes_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.columns
    FOR EACH ROW
    EXECUTE FUNCTION notify_column_changes();

-- Supabaseリアルタイムの有効化
-- Note: Supabase管理画面で手動で有効化する必要がある場合があります
-- Database > Replication でテーブルを有効化してください
