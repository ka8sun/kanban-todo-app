/**
 * カンバンボードコンポーネント
 * カンバンボード全体のレイアウト表示とドラッグ&ドロップコンテキストの提供
 *
 * パフォーマンス最適化:
 * - useMemoでフィルタリング済みタスクをメモ化
 * - useCallbackでドラッグハンドラーをメモ化
 * - 不要な再レンダリングを防止
 */

'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useBoardStore } from '@/lib/store/useBoardStore';
import { ColumnList } from '@/components/board/column-list';
import { useRealtimeSubscription } from '@/lib/hooks/useRealtimeSubscription';
import { showErrorToast } from '@/lib/toast/toast';
import { TutorialModal } from '@/components/onboarding';
import { useTutorial } from '@/hooks/use-tutorial';

interface KanbanBoardProps {
  userId: string;
}

export function KanbanBoard({ userId }: KanbanBoardProps) {
  const { columns, tasks, loading, error, fetchBoard, handleRealtimeEvent, moveTask, getFilteredTasks } =
    useBoardStore();
  const [isDragging, setIsDragging] = useState(false);
  const { showTutorial, completeTutorial, skipTutorial } = useTutorial();
  const hasFetchedRef = useRef(false);

  // フィルタリングされたタスクをメモ化（パフォーマンス最適化）
  const filteredTasks = useMemo(() => getFilteredTasks(), [tasks, getFilteredTasks]);

  // ボードデータを初回ロード時に取得（1回のみ）
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchBoard(userId);
    }
  }, [userId, fetchBoard]);

  // リアルタイムサブスクリプションの設定
  useRealtimeSubscription({
    userId,
    onEvent: handleRealtimeEvent,
    enabled: !!userId,
  });

  // デバッグ: データ取得状況をログ出力
  useEffect(() => {
    console.log('🔍 KanbanBoard Debug:', {
      columnsCount: columns.length,
      rawTasksCount: tasks.length,
      filteredTasksCount: filteredTasks.length,
      columns,
      rawTasks: tasks,
      filteredTasks: filteredTasks,
      loading,
      error,
    });
  }, [columns, tasks, filteredTasks, loading, error]);

  // ドラッグ&ドロップハンドラー（useCallbackでメモ化）
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      setIsDragging(false);

      // ドロップ先が無効な場合は何もしない
      if (!result.destination) {
        return;
      }

      const { source, destination, draggableId } = result;

      // 同じ位置にドロップした場合は何もしない
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      ) {
        return;
      }

      try {
        // タスクを移動
        await moveTask(draggableId, destination.droppableId, destination.index);

        // エラーがある場合はトースト通知
        if (error) {
          showErrorToast(`タスクの移動に失敗しました: ${error.message}`);
        }
      } catch (err) {
        showErrorToast(
          `タスクの移動中にエラーが発生しました: ${err instanceof Error ? err.message : '不明なエラー'}`
        );
      }
    },
    [moveTask, error]
  );

  // ローディング状態
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto" />
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  // エラー状態
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 font-semibold">エラーが発生しました</p>
          <p className="mt-2 text-gray-600">{error.message}</p>
          <button
            onClick={() => fetchBoard(userId)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <TutorialModal
        open={showTutorial}
        onComplete={completeTutorial}
        onSkip={skipTutorial}
      />
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="h-full">
          {/* デスクトップ: 横並び、モバイル: 縦スタック */}
          <div className="flex gap-6 overflow-x-auto pb-4 md:flex-row flex-col">
            {columns.length === 0 ? (
              <div className="flex items-center justify-center w-full h-64">
                <p className="text-gray-500 text-center">
                  まだ列がありません。
                  <br />
                  「新しい列を追加」ボタンから最初の列を作成しましょう。
                </p>
              </div>
            ) : (
              <ColumnList
                columns={columns}
                tasks={filteredTasks}
                isDragging={isDragging}
              />
            )}
          </div>
        </div>
      </DragDropContext>
    </>
  );
}
