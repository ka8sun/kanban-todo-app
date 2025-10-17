// Priority型定義
export type Priority = 'low' | 'medium' | 'high';

// Column型定義
export interface Column {
  id: string;
  userId: string;
  name: string;
  position: number;
  createdAt: string;
}

// ColumnUpdate型定義
export interface ColumnUpdate {
  name?: string;
  position?: number;
}

// Task型定義
export interface Task {
  id: string;
  userId: string;
  columnId: string;
  title: string;
  description: string | null;
  priority: Priority;
  position: number;
  createdAt: string;
  updatedAt: string;
}

// TaskUpdate型定義
export interface TaskUpdate {
  title?: string;
  description?: string;
  priority?: Priority;
  columnId?: string;
  position?: number;
}

// CreateTaskInput型定義
export interface CreateTaskInput {
  userId: string;
  columnId: string;
  title: string;
  description?: string;
  priority: Priority;
}

// TaskFilters型定義
export interface TaskFilters {
  searchQuery?: string;
  priority?: Priority;
}

// ServiceError型定義
export interface ServiceError {
  code: string;
  message: string;
  statusCode?: number;
}

// Result型定義
export type Result<T, E = ServiceError> =
  | { success: true; data: T }
  | { success: false; error: E };

// Board型定義
export interface Board {
  userId: string;
  columns: Column[];
}

// RealtimeEvent型定義
export type RealtimeEventType =
  | 'task_created'
  | 'task_updated'
  | 'task_deleted'
  | 'column_created'
  | 'column_updated'
  | 'column_deleted';

export interface RealtimeEvent {
  type: RealtimeEventType;
  payload: TaskPayload | ColumnPayload;
  timestamp: string;
  sessionId: string;
}

export interface TaskPayload {
  id: string;
  userId: string;
  columnId: string;
  title: string;
  description: string | null;
  priority: Priority;
  position: number;
}

export interface ColumnPayload {
  id: string;
  userId: string;
  name: string;
  position: number;
}

// RealtimeSubscription型定義
export interface RealtimeSubscription {
  channelName: string;
  unsubscribe: () => Promise<void>;
}
