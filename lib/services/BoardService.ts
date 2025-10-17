import { getSupabaseClient } from '../supabase';
import type { Database } from '../database.types';
import type {
  Board,
  Column,
  ColumnUpdate,
  Result,
  ServiceError,
} from '../store/types';

type ColumnRow = Database['public']['Tables']['columns']['Row'];

/**
 * BoardService
 *
 * カンバンボードおよび列（Column）のCRUD操作を管理するサービスクラス
 */
export class BoardService {
  private supabase = getSupabaseClient();

  /**
   * ユーザーのボード（列のリスト）を取得
   *
   * @param userId - ユーザーID
   * @returns ボードデータまたはエラー
   */
  async getBoard(userId: string): Promise<Result<Board, ServiceError>> {
    try {
      const { data, error } = await this.supabase
        .from('columns')
        .select('*')
        .eq('user_id', userId)
        .order('position', { ascending: true });

      if (error || !data) {
        return {
          success: false,
          error: {
            code: error?.code || 'FETCH_ERROR',
            message: error?.message || 'No data returned',
          },
        };
      }

      // データベースのスネークケースをキャメルケースに変換
      const columns: Column[] = (data as ColumnRow[]).map((col) => ({
        id: col.id,
        userId: col.user_id,
        name: col.name,
        position: col.position,
        createdAt: col.created_at,
      }));

      return {
        success: true,
        data: {
          userId,
          columns,
        },
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
   * 新しい列を作成
   *
   * @param userId - ユーザーID
   * @param name - 列名
   * @param position - 表示順序
   * @returns 作成された列またはエラー
   */
  async createColumn(
    userId: string,
    name: string,
    position: number
  ): Promise<Result<Column, ServiceError>> {
    try {
      const insertData = {
        user_id: userId,
        name,
        position,
      };

      const { data, error } = (await this.supabase
        .from('columns')
        .insert(insertData as any)
        .select()
        .single()) as { data: Column | null; error: any | null };

      if (error || !data) {
        return {
          success: false,
          error: {
            code: error?.code || 'INSERT_ERROR',
            message: error?.message || 'No data returned',
          },
        };
      }

      // データベースのスネークケースをキャメルケースに変換
      const columnRow = data as unknown as ColumnRow;
      const column: Column = {
        id: columnRow.id,
        userId: columnRow.user_id,
        name: columnRow.name,
        position: columnRow.position,
        createdAt: columnRow.created_at,
      };

      return {
        success: true,
        data: column,
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
   * 列を更新
   *
   * @param columnId - 列ID
   * @param updates - 更新内容
   * @returns 更新された列またはエラー
   */
  async updateColumn(
    columnId: string,
    updates: Partial<ColumnUpdate>
  ): Promise<Result<Column, ServiceError>> {
    try {
      // データベース更新用のオブジェクトを構築
      const updateData: Record<string, any> = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.position !== undefined) updateData.position = updates.position;

      const result = await this.supabase
        .from('columns')
        .update(updateData as never)
        .eq('id', columnId)
        .select()
        .single();

      const { data, error } = result;

      if (error || !data) {
        return {
          success: false,
          error: {
            code: error?.code || 'UPDATE_ERROR',
            message: error?.message || 'No data returned',
          },
        };
      }

      // データベースのスネークケースをキャメルケースに変換
      const columnRow = data as unknown as ColumnRow;
      const column: Column = {
        id: columnRow.id,
        userId: columnRow.user_id,
        name: columnRow.name,
        position: columnRow.position,
        createdAt: columnRow.created_at,
      };

      return {
        success: true,
        data: column,
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
   * 列を削除
   *
   * @param columnId - 列ID
   * @returns 成功またはエラー
   */
  async deleteColumn(columnId: string): Promise<Result<void, ServiceError>> {
    try {
      const { error } = await this.supabase
        .from('columns')
        .delete()
        .eq('id', columnId);

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
   * 列の並び順を更新
   *
   * @param userId - ユーザーID
   * @param columnIds - 新しい順序での列IDの配列
   * @returns 更新された列の配列またはエラー
   */
  async reorderColumns(
    userId: string,
    columnIds: string[]
  ): Promise<Result<Column[], ServiceError>> {
    try {
      // 各列のposition値を更新
      for (let i = 0; i < columnIds.length; i++) {
        const columnId = columnIds[i];
        if (!columnId) continue;

        const updateData: Record<string, any> = { position: i };
        const { error } = await this.supabase
          .from('columns')
          .update(updateData as never)
          .eq('id', columnId);

        if (error) {
          return {
            success: false,
            error: {
              code: error.code || 'REORDER_ERROR',
              message: error.message,
            },
          };
        }
      }

      // 更新後の列を取得
      const { data, error } = await this.supabase
        .from('columns')
        .select('*')
        .eq('user_id', userId)
        .order('position', { ascending: true });

      if (error || !data) {
        return {
          success: false,
          error: {
            code: error?.code || 'FETCH_ERROR',
            message: error?.message || 'No data returned',
          },
        };
      }

      // データベースのスネークケースをキャメルケースに変換
      const columns: Column[] = (data as ColumnRow[]).map((col) => ({
        id: col.id,
        userId: col.user_id,
        name: col.name,
        position: col.position,
        createdAt: col.created_at,
      }));

      return {
        success: true,
        data: columns,
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
