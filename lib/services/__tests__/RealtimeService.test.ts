import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { RealtimeService } from '../RealtimeService';
import { createClientSupabase } from '../../supabase';

// Supabaseクライアントをモック
vi.mock('../../supabase', () => ({
  createClientSupabase: vi.fn(),
}));

describe('RealtimeService', () => {
  let realtimeService: RealtimeService;
  let mockSupabaseClient: any;
  let mockChannel: any;

  beforeEach(() => {
    // モックチャネルの作成
    mockChannel = {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockResolvedValue({ status: 'ok' }),
      unsubscribe: vi.fn().mockResolvedValue({ status: 'ok' }),
    };

    // モックSupabaseクライアントの作成
    mockSupabaseClient = {
      channel: vi.fn().mockReturnValue(mockChannel),
    };

    // createClientSupabaseがモッククライアントを返すように設定
    vi.mocked(createClientSupabase).mockReturnValue(mockSupabaseClient);

    realtimeService = new RealtimeService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('subscribe', () => {
    it('ユーザー専用のチャネルを購読できる', async () => {
      const onEvent = vi.fn();
      const subscription = await realtimeService.subscribe('user-1', onEvent);

      expect(mockSupabaseClient.channel).toHaveBeenCalledWith(
        'board:user-1:changes'
      );
      expect(mockChannel.on).toHaveBeenCalledWith(
        'broadcast',
        { event: '*' },
        expect.any(Function)
      );
      expect(mockChannel.subscribe).toHaveBeenCalled();
      expect(subscription.channelName).toBe('board:user-1:changes');
    });

    it('イベントを受信したときにコールバックが呼ばれる', async () => {
      const onEvent = vi.fn();
      let eventCallback: any;

      // onメソッドが呼ばれたときにコールバックを保存
      mockChannel.on.mockImplementation((type: string, config: any, cb: any) => {
        eventCallback = cb;
        return mockChannel;
      });

      await realtimeService.subscribe('user-1', onEvent);

      // イベントをシミュレート
      const mockEvent = {
        type: 'broadcast',
        event: 'task_created',
        payload: {
          type: 'task_created',
          payload: {
            id: 'task-1',
            userId: 'user-1',
            columnId: 'col-1',
            title: 'Test Task',
            description: null,
            priority: 'medium',
            position: 0,
          },
          timestamp: new Date().toISOString(),
          sessionId: 'session-1',
        },
      };

      eventCallback(mockEvent);

      expect(onEvent).toHaveBeenCalledWith({
        type: 'task_created',
        payload: expect.objectContaining({
          id: 'task-1',
          title: 'Test Task',
        }),
        timestamp: expect.any(String),
        sessionId: 'session-1',
      });
    });
  });

  describe('unsubscribe', () => {
    it('購読を解除できる', async () => {
      const onEvent = vi.fn();
      const subscription = await realtimeService.subscribe('user-1', onEvent);

      await subscription.unsubscribe();

      expect(mockChannel.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('イベントタイプ', () => {
    it('task_created イベントを処理できる', async () => {
      const onEvent = vi.fn();
      let eventCallback: any;

      mockChannel.on.mockImplementation((type: string, config: any, cb: any) => {
        eventCallback = cb;
        return mockChannel;
      });

      await realtimeService.subscribe('user-1', onEvent);

      const mockEvent = {
        type: 'broadcast',
        event: 'task_created',
        payload: {
          type: 'task_created',
          payload: {
            id: 'task-new',
            userId: 'user-1',
            columnId: 'col-1',
            title: 'New Task',
            description: null,
            priority: 'high',
            position: 0,
          },
          timestamp: new Date().toISOString(),
          sessionId: 'session-1',
        },
      };

      eventCallback(mockEvent);

      expect(onEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'task_created',
          payload: expect.objectContaining({
            id: 'task-new',
            title: 'New Task',
          }),
        })
      );
    });

    it('column_deleted イベントを処理できる', async () => {
      const onEvent = vi.fn();
      let eventCallback: any;

      mockChannel.on.mockImplementation((type: string, config: any, cb: any) => {
        eventCallback = cb;
        return mockChannel;
      });

      await realtimeService.subscribe('user-1', onEvent);

      const mockEvent = {
        type: 'broadcast',
        event: 'column_deleted',
        payload: {
          type: 'column_deleted',
          payload: {
            id: 'col-1',
          },
          timestamp: new Date().toISOString(),
          sessionId: 'session-2',
        },
      };

      eventCallback(mockEvent);

      expect(onEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'column_deleted',
          payload: expect.objectContaining({
            id: 'col-1',
          }),
        })
      );
    });
  });
});
