import { getSupabaseClient } from '../supabase';
import type {
  Task,
  CreateTaskInput,
  TaskUpdate,
  TaskFilters,
  Result,
  ServiceError,
} from '../store/types';

/**
 * TaskService
 *
 * タスクのCRUD操作、タスクの列間・列内移動、タスク検索・フィルタリングを管理するサービスクラス
 */
export class TaskService {
  private supabase = getSupabaseClient();

  /**
   * タスクを取得
   *
   * @param userId - ユーザーID
   * @param filters - フィルター条件
   * @returns タスクの配列またはエラー
   */
  async getTasks(
    userId: string,
    filters?: TaskFilters
  ): Promise<Result<Task[], ServiceError>> {
    try {
      let query = this.supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId);

      // 検索クエリフィルター
      if (filters?.searchQuery) {
        const searchPattern = `%${filters.searchQuery}%`;
        query = query.or(
          `title.ilike.${searchPattern},description.ilike.${searchPattern}`
        );
      }

      // 優先度フィルター
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }

      const { data, error } = await query.order('position', {
        ascending: true,
      });

      if (error || !data) {
        return {
          success: false,
          error: {
            code: error?.code || 'FETCH_ERROR',
            message: error?.message || 'Failed to fetch tasks',
          },
        };
      }

      // データベースのスネークケースをキャメルケースに変換
      const tasks: Task[] = (data as any[]).map((task: any) => ({
        id: task.id,
        userId: task.user_id,
        columnId: task.column_id,
        title: task.title,
        description: task.description,
        priority: task.priority as 'low' | 'medium' | 'high',
        position: task.position,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
      }));

      return {
        success: true,
        data: tasks,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * 新しいタスクを作成
   *
   * @param task - 作成するタスク
   * @returns 作成されたタスクまたはエラー
   */
  async createTask(
    task: CreateTaskInput
  ): Promise<Result<Task, ServiceError>> {
    try {
      // 同じ列内の既存タスクの最大position値を取得
      const { data: existingTasks, error: fetchError } = await this.supabase
        .from('tasks')
        .select('position')
        .eq('column_id', task.columnId)
        .order('position', { ascending: false })
        .limit(1);

      if (fetchError) {
        return {
          success: false,
          error: {
            code: fetchError.code || 'FETCH_ERROR',
            message: fetchError.message || 'Failed to fetch existing tasks',
          },
        };
      }

      // 新しいタスクのposition値を計算（最大値+1、存在しない場合は0）
      const maxPosition =
        existingTasks && existingTasks.length > 0
          ? (existingTasks[0] as any).position
          : -1;
      const position = maxPosition + 1;

      const { data, error } = await this.supabase
        .from('tasks')
        .insert({
          user_id: task.userId,
          column_id: task.columnId,
          title: task.title,
          description: task.description || null,
          priority: task.priority,
          position,
        } as any)
        .select()
        .single();

      if (error || !data) {
        return {
          success: false,
          error: {
            code: error?.code || 'INSERT_ERROR',
            message: error?.message || 'Failed to create task',
          },
        };
      }

      // データベースのスネークケースをキャメルケースに変換
      const taskData = data as any;
      const createdTask: Task = {
        id: taskData.id,
        userId: taskData.user_id,
        columnId: taskData.column_id,
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority as 'low' | 'medium' | 'high',
        position: taskData.position,
        createdAt: taskData.created_at,
        updatedAt: taskData.updated_at,
      };

      return {
        success: true,
        data: createdTask,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * タスクを更新
   *
   * @param taskId - タスクID
   * @param updates - 更新内容
   * @returns 更新されたタスクまたはエラー
   */
  async updateTask(
    taskId: string,
    updates: Partial<TaskUpdate>
  ): Promise<Result<Task, ServiceError>> {
    try {
      // キャメルケースをスネークケースに変換
      const dbUpdates: Record<string, any> = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined)
        dbUpdates.description = updates.description;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
      if (updates.columnId !== undefined)
        dbUpdates.column_id = updates.columnId;
      if (updates.position !== undefined) dbUpdates.position = updates.position;

      const result = await (this.supabase
        .from('tasks') as any)
        .update(dbUpdates)
        .eq('id', taskId)
        .select()
        .single();

      const { data, error } = result as any;

      if (error || !data) {
        return {
          success: false,
          error: {
            code: error?.code || 'UPDATE_ERROR',
            message: error?.message || 'Failed to update task',
          },
        };
      }

      // データベースのスネークケースをキャメルケースに変換
      const taskData = data as any;
      const updatedTask: Task = {
        id: taskData.id,
        userId: taskData.user_id,
        columnId: taskData.column_id,
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority as 'low' | 'medium' | 'high',
        position: taskData.position,
        createdAt: taskData.created_at,
        updatedAt: taskData.updated_at,
      };

      return {
        success: true,
        data: updatedTask,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * タスクを削除
   *
   * @param taskId - タスクID
   * @returns 成功またはエラー
   */
  async deleteTask(taskId: string): Promise<Result<void, ServiceError>> {
    try {
      const { error } = await this.supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        return {
          success: false,
          error: {
            code: error.code || 'DELETE_ERROR',
            message: error.message,
          },
        };
      }

      return {
        success: true,
        data: undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * タスクを移動（列間または列内）
   *
   * @param taskId - タスクID
   * @param targetColumnId - 移動先の列ID
   * @param targetPosition - 移動先の位置
   * @returns 更新されたタスクまたはエラー
   */
  async moveTask(
    taskId: string,
    targetColumnId: string,
    targetPosition: number
  ): Promise<Result<Task, ServiceError>> {
    try {
      const result = await (this.supabase
        .from('tasks') as any)
        .update({
          column_id: targetColumnId,
          position: targetPosition,
        })
        .eq('id', taskId)
        .select()
        .single();

      const { data, error } = result as any;

      if (error || !data) {
        return {
          success: false,
          error: {
            code: error?.code || 'MOVE_ERROR',
            message: error?.message || 'Failed to move task',
          },
        };
      }

      // データベースのスネークケースをキャメルケースに変換
      const taskData = data as any;
      const movedTask: Task = {
        id: taskData.id,
        userId: taskData.user_id,
        columnId: taskData.column_id,
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority as 'low' | 'medium' | 'high',
        position: taskData.position,
        createdAt: taskData.created_at,
        updatedAt: taskData.updated_at,
      };

      return {
        success: true,
        data: movedTask,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
}
