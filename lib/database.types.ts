/**
 * データベース型定義
 * Supabaseのスキーマに基づいて自動生成される型
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      columns: {
        Row: {
          id: string
          user_id: string
          name: string
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          position: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          position?: number
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          column_id: string
          title: string
          description: string | null
          priority: 'low' | 'medium' | 'high'
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          column_id: string
          title: string
          description?: string | null
          priority?: 'low' | 'medium' | 'high'
          position: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          column_id?: string
          title?: string
          description?: string | null
          priority?: 'low' | 'medium' | 'high'
          position?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// エクスポート用の便利な型エイリアス
export type Column = Database['public']['Tables']['columns']['Row']
export type ColumnInsert = Database['public']['Tables']['columns']['Insert']
export type ColumnUpdate = Database['public']['Tables']['columns']['Update']

export type Task = Database['public']['Tables']['tasks']['Row']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']

export type Priority = 'low' | 'medium' | 'high'

// リアルタイムイベント型定義
export type RealtimeEventType =
  | 'task_created'
  | 'task_updated'
  | 'task_deleted'
  | 'column_created'
  | 'column_updated'
  | 'column_deleted'

export interface RealtimeEvent {
  type: RealtimeEventType
  payload: Task | Column | { id: string; column_id?: string; user_id: string }
  timestamp: number
}

export interface RealtimePayload<T = Task | Column> {
  type: RealtimeEventType
  payload: T
  timestamp: number
}
