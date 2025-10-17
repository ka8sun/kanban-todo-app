import { getSupabaseClient } from '../supabase';
import type {
  RealtimeEvent,
  RealtimeSubscription,
} from '../store/types';
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';

/**
 * RealtimeService
 *
 * Supabaseリアルタイムチャネルの購読・解除、変更イベントの受信・配信を管理するサービスクラス
 */
export class RealtimeService {
  private supabase: SupabaseClient;
  private channels: Map<string, RealtimeChannel> = new Map();

  constructor(supabaseClient?: SupabaseClient) {
    this.supabase = supabaseClient || getSupabaseClient();
  }

  /**
   * ユーザー専用のリアルタイムチャネルを購読
   *
   * @param userId - ユーザーID
   * @param onEvent - イベント受信時のコールバック関数
   * @returns RealtimeSubscription
   */
  async subscribe(
    userId: string,
    onEvent: (event: RealtimeEvent) => void
  ): Promise<RealtimeSubscription> {
    const channelName = `board:${userId}:changes`;

    // チャネルが既に存在する場合は解除
    if (this.channels.has(channelName)) {
      await this.unsubscribeByChannelName(channelName);
    }

    // 新しいチャネルを作成
    const channel = this.supabase.channel(channelName);

    // ブロードキャストイベントを購読
    channel.on('broadcast', { event: '*' }, (payload: any) => {
      // payloadからイベント情報を取得
      const event: RealtimeEvent = {
        type: payload.payload.type,
        payload: payload.payload.payload,
        timestamp: payload.payload.timestamp,
        sessionId: payload.payload.sessionId,
      };

      // コールバックを呼び出し
      onEvent(event);
    });

    // チャネルを購読
    await channel.subscribe();

    // チャネルをマップに保存
    this.channels.set(channelName, channel);

    // RealtimeSubscriptionを返す
    return {
      channelName,
      unsubscribe: async () => {
        await this.unsubscribeByChannelName(channelName);
      },
    };
  }

  /**
   * チャネル名でリアルタイムチャネルを解除
   *
   * @param channelName - チャネル名
   */
  private async unsubscribeByChannelName(channelName: string): Promise<void> {
    const channel = this.channels.get(channelName);
    if (channel) {
      await channel.unsubscribe();
      this.channels.delete(channelName);
    }
  }

  /**
   * 全てのチャネルを解除
   */
  async unsubscribeAll(): Promise<void> {
    const promises = Array.from(this.channels.keys()).map((channelName) =>
      this.unsubscribeByChannelName(channelName)
    );
    await Promise.all(promises);
  }

  /**
   * イベントをブロードキャスト
   *
   * @param event - ブロードキャストするイベント
   */
  async broadcastEvent(event: RealtimeEvent): Promise<void> {
    // 全てのアクティブなチャネルにイベントをブロードキャスト
    const promises = Array.from(this.channels.values()).map((channel) =>
      channel.send({
        type: 'broadcast',
        event: 'message',
        payload: event,
      })
    );
    await Promise.all(promises);
  }

  /**
   * チャネルが購読されているかを確認
   *
   * @returns 購読状態
   */
  isSubscribed(): boolean {
    return this.channels.size > 0;
  }
}
