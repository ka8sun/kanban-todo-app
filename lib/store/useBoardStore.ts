import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { BoardService } from '../services/BoardService';
import { TaskService } from '../services/TaskService';
import { showSuccessToast, showErrorToast } from '../toast';
import type {
  Column,
  Task,
  ServiceError,
  ColumnUpdate,
  CreateTaskInput,
  TaskUpdate,
  RealtimeEvent,
} from './types';

// ストアのState型定義
export interface BoardState {
  columns: Column[];
  tasks: Task[];
  loading: boolean;
  error: ServiceError | null;

  // フィルター状態
  searchQuery: string;
  selectedPriority: 'low' | 'medium' | 'high' | 'all';

  // 基本アクション
  setColumns: (columns: Column[]) => void;
  setTasks: (tasks: Task[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: ServiceError | null) => void;
  reset: () => void;

  // フィルターアクション
  setSearchQuery: (query: string) => void;
  setSelectedPriority: (priority: 'low' | 'medium' | 'high' | 'all') => void;
  clearFilters: () => void;
  getFilteredTasks: () => Task[];

  // ボード・列管理アクション（後で実装）
  fetchBoard: (userId: string) => Promise<void>;
  createColumn: (userId: string, name: string) => Promise<void>;
  updateColumn: (columnId: string, updates: Partial<ColumnUpdate>) => Promise<void>;
  deleteColumn: (columnId: string) => Promise<void>;

  // タスク管理アクション（後で実装）
  createTask: (input: CreateTaskInput) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<TaskUpdate>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  moveTask: (taskId: string, targetColumnId: string, targetPosition: number) => Promise<void>;

  // リアルタイム同期アクション（後で実装）
  handleRealtimeEvent: (event: RealtimeEvent) => void;
}

// 初期状態
const initialState = {
  columns: [],
  tasks: [],
  loading: false,
  error: null,
  searchQuery: '',
  selectedPriority: 'all' as const,
};

// Zustand Storeの作成
export const useBoardStore = create<BoardState>()(
  immer((set, get) => ({
    ...initialState,

    // 基本アクション
    setColumns: (columns: Column[]) => {
      set((state) => {
        state.columns = columns;
      });
    },

    setTasks: (tasks: Task[]) => {
      set((state) => {
        state.tasks = tasks;
      });
    },

    setLoading: (loading: boolean) => {
      set((state) => {
        state.loading = loading;
      });
    },

    setError: (error: ServiceError | null) => {
      set((state) => {
        state.error = error;
      });
    },

    reset: () => {
      set(() => initialState);
    },

    // フィルターアクション
    setSearchQuery: (query: string) => {
      set((state) => {
        state.searchQuery = query;
      });
    },

    setSelectedPriority: (priority: 'low' | 'medium' | 'high' | 'all') => {
      set((state) => {
        state.selectedPriority = priority;
      });
    },

    clearFilters: () => {
      set((state) => {
        state.searchQuery = '';
        state.selectedPriority = 'all';
      });
    },

    getFilteredTasks: () => {
      const state = get();
      console.log('🔎 getFilteredTasks called:', {
        totalTasks: state.tasks.length,
        searchQuery: state.searchQuery,
        selectedPriority: state.selectedPriority,
      });
      let filtered = state.tasks;

      // テキスト検索フィルター
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (task) =>
            task.title.toLowerCase().includes(query) ||
            task.description?.toLowerCase().includes(query)
        );
        console.log('🔎 After search filter:', filtered.length);
      }

      // 優先度フィルター
      if (state.selectedPriority !== 'all') {
        filtered = filtered.filter(
          (task) => task.priority === state.selectedPriority
        );
        console.log('🔎 After priority filter:', filtered.length);
      }

      console.log('🔎 Final filtered tasks:', filtered.length);
      return filtered;
    },

    // ボード・列管理アクション
    fetchBoard: async (userId: string) => {
      console.log('🔍 fetchBoard called with userId:', userId);

      const boardService = new BoardService();
      const taskService = new TaskService();
      set((state) => {
        state.loading = true;
        state.error = null;
      });

      try {
        // 列とタスクを並行して取得
        console.log('🚀 Starting Promise.all...');
        const [boardResult, tasksResult] = await Promise.all([
          boardService.getBoard(userId),
          taskService.getTasks(userId),
        ]);

        console.log('📊 boardResult:', boardResult);
        console.log('📋 tasksResult:', tasksResult);

        if (boardResult.success && tasksResult.success) {
          console.log('✅ Data fetched successfully:', {
            columnsCount: boardResult.data.columns.length,
            tasksCount: tasksResult.data.length,
          });
          set((state) => {
            state.columns = boardResult.data.columns;
            state.tasks = tasksResult.data;
            state.loading = false;
          });
          console.log('✅ State updated. Columns:', boardResult.data.columns.length, 'Tasks:', tasksResult.data.length);
        } else {
          // エラーハンドリング：どちらかが失敗した場合
          const error: ServiceError = !boardResult.success
            ? boardResult.error
            : !tasksResult.success
              ? tasksResult.error
              : { code: 'UNKNOWN_ERROR', message: 'Unknown error occurred' };

          console.error('❌ Data fetch failed:', error);
          set((state) => {
            state.error = error;
            state.loading = false;
          });
        }
      } catch (error) {
        console.error('💥 Fatal error in fetchBoard:', error);
        set((state) => {
          state.error = {
            code: 'FETCH_ERROR',
            message: error instanceof Error ? error.message : 'Unknown error occurred',
          };
          state.loading = false;
        });
      }
    },

    createColumn: async (userId: string, name: string) => {
      const boardService = new BoardService();
      set((state) => {
        state.error = null;
      });

      // 現在の列数から次のposition値を計算
      const position = get().columns.length;

      const result = await boardService.createColumn(userId, name, position);

      if (result.success) {
        set((state) => {
          state.columns.push(result.data);
        });
        showSuccessToast('列を作成しました');
      } else {
        set((state) => {
          state.error = result.error;
        });
        showErrorToast('列の作成に失敗しました');
      }
    },

    updateColumn: async (columnId: string, updates: Partial<ColumnUpdate>) => {
      const boardService = new BoardService();
      set((state) => {
        state.error = null;
      });

      const result = await boardService.updateColumn(columnId, updates);

      if (result.success) {
        set((state) => {
          const index = state.columns.findIndex((col) => col.id === columnId);
          if (index !== -1) {
            state.columns[index] = result.data;
          }
        });
        showSuccessToast('列を更新しました');
      } else {
        set((state) => {
          state.error = result.error;
        });
        showErrorToast('列の更新に失敗しました');
      }
    },

    deleteColumn: async (columnId: string) => {
      const boardService = new BoardService();
      set((state) => {
        state.error = null;
      });

      const result = await boardService.deleteColumn(columnId);

      if (result.success) {
        set((state) => {
          state.columns = state.columns.filter((col) => col.id !== columnId);
          // その列に属するタスクも削除
          state.tasks = state.tasks.filter((task) => task.columnId !== columnId);
        });
        showSuccessToast('列を削除しました');
      } else {
        set((state) => {
          state.error = result.error;
        });
        showErrorToast('列の削除に失敗しました');
      }
    },

    // タスク管理アクション
    createTask: async (input: CreateTaskInput) => {
      const taskService = new TaskService();
      set((state) => {
        state.error = null;
      });

      const result = await taskService.createTask(input);

      if (result.success) {
        set((state) => {
          state.tasks.push(result.data);
        });
        showSuccessToast('タスクを作成しました');
      } else {
        set((state) => {
          state.error = result.error;
        });
        showErrorToast('タスクの作成に失敗しました');
      }
    },

    updateTask: async (taskId: string, updates: Partial<TaskUpdate>) => {
      const taskService = new TaskService();
      set((state) => {
        state.error = null;
      });

      const result = await taskService.updateTask(taskId, updates);

      if (result.success) {
        set((state) => {
          const index = state.tasks.findIndex((task) => task.id === taskId);
          if (index !== -1) {
            state.tasks[index] = result.data;
          }
        });
        showSuccessToast('タスクを更新しました');
      } else {
        set((state) => {
          state.error = result.error;
        });
        showErrorToast('タスクの更新に失敗しました');
      }
    },

    deleteTask: async (taskId: string) => {
      const taskService = new TaskService();
      set((state) => {
        state.error = null;
      });

      const result = await taskService.deleteTask(taskId);

      if (result.success) {
        set((state) => {
          state.tasks = state.tasks.filter((task) => task.id !== taskId);
        });
        showSuccessToast('タスクを削除しました');
      } else {
        set((state) => {
          state.error = result.error;
        });
        showErrorToast('タスクの削除に失敗しました');
      }
    },

    moveTask: async (
      taskId: string,
      targetColumnId: string,
      targetPosition: number
    ) => {
      const taskService = new TaskService();

      // 楽観的更新: 即座にUI状態を更新
      const previousState = get().tasks;
      set((state) => {
        const taskIndex = state.tasks.findIndex((t) => t.id === taskId);
        if (taskIndex !== -1 && state.tasks[taskIndex]) {
          state.tasks[taskIndex]!.columnId = targetColumnId;
          state.tasks[taskIndex]!.position = targetPosition;
        }
        state.error = null;
      });

      const result = await taskService.moveTask(
        taskId,
        targetColumnId,
        targetPosition
      );

      if (result.success) {
        set((state) => {
          const taskIndex = state.tasks.findIndex((t) => t.id === taskId);
          if (taskIndex !== -1) {
            state.tasks[taskIndex] = result.data;
          }
        });
      } else {
        // エラー時はロールバック
        set((state) => {
          state.tasks = previousState;
          state.error = result.error;
        });
        showErrorToast('タスクの移動に失敗しました');
      }
    },

    // リアルタイム同期アクション
    handleRealtimeEvent: (event: RealtimeEvent) => {
      set((state) => {
        switch (event.type) {
          case 'task_created': {
            const task = event.payload as Task;
            // 既に存在しない場合のみ追加
            const exists = state.tasks.some((t) => t.id === task.id);
            if (!exists) {
              state.tasks.push(task);
            }
            break;
          }

          case 'task_updated': {
            const task = event.payload as Task;
            const index = state.tasks.findIndex((t) => t.id === task.id);
            if (index !== -1) {
              state.tasks[index] = task;
            }
            break;
          }

          case 'task_deleted': {
            const { id } = event.payload as { id: string };
            state.tasks = state.tasks.filter((t) => t.id !== id);
            break;
          }

          case 'column_created': {
            const column = event.payload as Column;
            // 既に存在しない場合のみ追加
            const exists = state.columns.some((c) => c.id === column.id);
            if (!exists) {
              state.columns.push(column);
            }
            break;
          }

          case 'column_updated': {
            const column = event.payload as Column;
            const index = state.columns.findIndex((c) => c.id === column.id);
            if (index !== -1) {
              state.columns[index] = column;
            }
            break;
          }

          case 'column_deleted': {
            const { id } = event.payload as { id: string };
            state.columns = state.columns.filter((c) => c.id !== id);
            // その列に属するタスクも削除
            state.tasks = state.tasks.filter((t) => t.columnId !== id);
            break;
          }

          default:
            console.warn('Unknown realtime event type:', event.type);
        }
      });
    },
  }))
);
