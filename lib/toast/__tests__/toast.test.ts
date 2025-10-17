import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'sonner';
import { showSuccessToast, showErrorToast, showWarningToast, showInfoToast } from '../toast';

// sonnerのモック
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

/**
 * トースト通知ヘルパー関数のユニットテスト
 *
 * このテストは以下を検証します:
 * - 成功メッセージが正しく表示される
 * - エラーメッセージが正しく表示される
 * - 警告メッセージが正しく表示される
 * - 情報メッセージが正しく表示される
 */
describe('Toast Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('showSuccessToast', () => {
    it('should call toast.success with the correct message', () => {
      const message = 'タスクが正常に作成されました';
      showSuccessToast(message);

      expect(toast.success).toHaveBeenCalledWith(message, expect.objectContaining({
        duration: expect.any(Number),
      }));
    });

    it('should accept custom duration', () => {
      const message = '保存しました';
      const duration = 5000;
      showSuccessToast(message, { duration });

      expect(toast.success).toHaveBeenCalledWith(message, expect.objectContaining({
        duration: 5000,
      }));
    });
  });

  describe('showErrorToast', () => {
    it('should call toast.error with the correct message', () => {
      const message = 'タスクの作成に失敗しました';
      showErrorToast(message);

      expect(toast.error).toHaveBeenCalledWith(message, expect.objectContaining({
        duration: expect.any(Number),
      }));
    });

    it('should accept custom duration', () => {
      const message = 'ネットワークエラー';
      const duration = 10000;
      showErrorToast(message, { duration });

      expect(toast.error).toHaveBeenCalledWith(message, expect.objectContaining({
        duration: 10000,
      }));
    });
  });

  describe('showWarningToast', () => {
    it('should call toast.warning with the correct message', () => {
      const message = 'この操作は元に戻せません';
      showWarningToast(message);

      expect(toast.warning).toHaveBeenCalledWith(message, expect.objectContaining({
        duration: expect.any(Number),
      }));
    });
  });

  describe('showInfoToast', () => {
    it('should call toast.info with the correct message', () => {
      const message = 'データを同期しています';
      showInfoToast(message);

      expect(toast.info).toHaveBeenCalledWith(message, expect.objectContaining({
        duration: expect.any(Number),
      }));
    });
  });
});
