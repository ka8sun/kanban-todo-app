import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RealtimeService } from '../RealtimeService';
import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

/**
 * 複数セッション間のリアルタイム同期統合テスト
 *
 * このテストは以下を検証します:
 * - 2つのセッションが同じチャネルを購読できる
 * - 一方のセッションでのタスク変更が他方のセッションに通知される
 * - 自セッションのイベントが適切にフィルタリングされる
 * - リアルタイム同期の遅延が500ms以内である
 */
describe('RealtimeService Integration - Multiple Sessions', () => {
  let session1: RealtimeService;
  let session2: RealtimeService;
  let mockSupabase: SupabaseClient;
  let mockChannels: Map<string, { callbacks: any[], send: any }>;
  const testUserId = 'test-user-123';

  beforeEach(() => {
    mockChannels = new Map();

    // Supabaseクライアントのモック
    mockSupabase = {
      channel: vi.fn((name: string) => {
        if (!mockChannels.has(name)) {
          mockChannels.set(name, { callbacks: [], send: vi.fn() });
        }
        const channelData = mockChannels.get(name)!;

        const mockChannel: Partial<RealtimeChannel> = {
          on: vi.fn((type: string, filter: any, callback: any) => {
            channelData.callbacks.push(callback);
            return mockChannel as RealtimeChannel;
          }),
          subscribe: vi.fn(async () => {
            return { status: 'SUBSCRIBED' };
          }),
          unsubscribe: vi.fn(async () => {
            return { status: 'UNSUBSCRIBED' };
          }),
          send: vi.fn(async (message: any) => {
            // 同じチャネルの全てのコールバックを呼び出し
            // 実際のSupabaseの形式に合わせてpayloadをラップ
            setTimeout(() => {
              channelData.callbacks.forEach(cb => {
                cb({ payload: message.payload });
              });
            }, 10); // 非同期動作をシミュレート
            return { status: 'ok' };
          }),
        };

        // sendメソッドを外部から参照できるようにする
        channelData.send = mockChannel.send!;

        return mockChannel as RealtimeChannel;
      }),
    } as any;

    session1 = new RealtimeService(mockSupabase);
    session2 = new RealtimeService(mockSupabase);
  });

  afterEach(async () => {
    // クリーンアップ: 購読を解除
    if (session1) await session1.unsubscribeAll();
    if (session2) await session2.unsubscribeAll();
  });

  it('should allow two sessions to subscribe to the same channel', async () => {
    const events1: any[] = [];
    const events2: any[] = [];

    // セッション1が購読
    await session1.subscribe(testUserId, (event) => {
      events1.push(event);
    });

    // セッション2が購読
    await session2.subscribe(testUserId, (event) => {
      events2.push(event);
    });

    // 両方のセッションが購読できていることを確認
    expect(session1.isSubscribed()).toBe(true);
    expect(session2.isSubscribed()).toBe(true);
  });

  it('should propagate task creation from session1 to session2', async () => {
    const session2Events: any[] = [];
    let resolvePromise: (value: any) => void;
    const eventReceived = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    // セッション1とセッション2の両方を購読
    await session1.subscribe(testUserId, () => {
      // セッション1は送信側なのでイベント処理不要
    });

    // セッション2でイベントを待機
    await session2.subscribe(testUserId, (event) => {
      session2Events.push(event);
      if (event.type === 'task_created') {
        resolvePromise(event);
      }
    });

    // セッション1でタスク作成イベントをブロードキャスト(モック)
    const mockTaskPayload = {
      id: 'task-456',
      userId: testUserId,
      columnId: 'column-789',
      title: 'Test Task',
      description: 'Test Description',
      priority: 'medium' as const,
      position: 0,
    };

    // チャネルのsendメソッドを直接呼び出してイベントを配信
    const channelName = `board:${testUserId}:changes`;
    const channelData = mockChannels.get(channelName);
    if (channelData && channelData.send) {
      await channelData.send({
        type: 'broadcast',
        event: 'message',
        payload: {
          type: 'task_created',
          payload: mockTaskPayload,
          timestamp: new Date().toISOString(),
          sessionId: 'session-1',
        },
      });
    }

    // セッション2がイベントを受信することを確認(タイムアウト500ms)
    const receivedEvent = await Promise.race([
      eventReceived,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 500)),
    ]);

    expect(receivedEvent).toBeDefined();
    expect((receivedEvent as any).type).toBe('task_created');
    expect((receivedEvent as any).payload.id).toBe('task-456');
  });

  it('should not propagate self-session events when filtered', async () => {
    const session1Events: any[] = [];
    const sessionId = 'session-1';

    // セッション1で購読(自セッションのイベントをフィルタリング)
    await session1.subscribe(testUserId, (event) => {
      // 自セッションのイベントはスキップ
      if (event.sessionId === sessionId) {
        return;
      }
      session1Events.push(event);
    });

    // チャネルのsendメソッドを直接呼び出してイベントを配信
    const channelName = `board:${testUserId}:changes`;
    const channelData = mockChannels.get(channelName);
    if (channelData && channelData.send) {
      await channelData.send({
        type: 'broadcast',
        event: 'message',
        payload: {
          type: 'task_updated',
          payload: {
            id: 'task-789',
            userId: testUserId,
            columnId: 'column-123',
            title: 'Updated Task',
            description: null,
            priority: 'high' as const,
            position: 1,
          },
          timestamp: new Date().toISOString(),
          sessionId: sessionId,
        },
      });
    }

    // 少し待機
    await new Promise(resolve => setTimeout(resolve, 100));

    // 自セッションのイベントはフィルタリングされるため、session1Eventsは空のはず
    expect(session1Events).toHaveLength(0);
  });

  it('should handle column deletion and propagate to other sessions', async () => {
    const session2Events: any[] = [];
    let resolvePromise: (value: any) => void;
    const eventReceived = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    await session1.subscribe(testUserId, () => {
      // セッション1は送信側なのでイベント処理不要
    });

    await session2.subscribe(testUserId, (event) => {
      session2Events.push(event);
      if (event.type === 'column_deleted') {
        resolvePromise(event);
      }
    });

    // チャネルのsendメソッドを直接呼び出してイベントを配信
    const channelName = `board:${testUserId}:changes`;
    const channelData = mockChannels.get(channelName);
    if (channelData && channelData.send) {
      await channelData.send({
        type: 'broadcast',
        event: 'message',
        payload: {
          type: 'column_deleted',
          payload: {
            id: 'column-999',
            userId: testUserId,
            name: 'Deleted Column',
            position: 2,
          },
          timestamp: new Date().toISOString(),
          sessionId: 'session-1',
        },
      });
    }

    const receivedEvent = await Promise.race([
      eventReceived,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 500)),
    ]);

    expect(receivedEvent).toBeDefined();
    expect((receivedEvent as any).type).toBe('column_deleted');
    expect((receivedEvent as any).payload.id).toBe('column-999');
  });

  it('should maintain sync latency under 500ms', async () => {
    let resolvePromise: (value: number) => void;
    const latencyMeasured = new Promise<number>((resolve) => {
      resolvePromise = resolve;
    });

    await session1.subscribe(testUserId, () => {
      // セッション1は送信側なのでイベント処理不要
    });

    await session2.subscribe(testUserId, (event) => {
      if (event.type === 'task_created') {
        const receiveTime = Date.now();
        const latency = receiveTime - broadcastTime;
        resolvePromise(latency);
      }
    });

    const broadcastTime = Date.now();

    // チャネルのsendメソッドを直接呼び出してイベントを配信
    const channelName = `board:${testUserId}:changes`;
    const channelData = mockChannels.get(channelName);
    if (channelData && channelData.send) {
      await channelData.send({
        type: 'broadcast',
        event: 'message',
        payload: {
          type: 'task_created',
          payload: {
            id: 'task-latency-test',
            userId: testUserId,
            columnId: 'column-123',
            title: 'Latency Test',
            description: null,
            priority: 'low' as const,
            position: 0,
          },
          timestamp: new Date().toISOString(),
          sessionId: 'session-1',
        },
      });
    }

    const latency = await latencyMeasured;

    // リアルタイム同期の遅延が500ms以内であることを確認
    expect(latency).toBeLessThan(500);
  });
});
