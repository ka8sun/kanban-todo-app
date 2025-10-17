import { toast } from 'sonner';

/**
 * トースト通知のオプション
 */
export interface ToastOptions {
  /**
   * トーストの表示時間(ミリ秒)
   * @default 4000
   */
  duration?: number;
}

/**
 * 成功メッセージをトースト通知で表示
 *
 * @param message - 表示するメッセージ
 * @param options - トーストのオプション
 */
export function showSuccessToast(message: string, options?: ToastOptions): void {
  toast.success(message, {
    duration: options?.duration ?? 4000,
  });
}

/**
 * エラーメッセージをトースト通知で表示
 *
 * @param message - 表示するメッセージ
 * @param options - トーストのオプション
 */
export function showErrorToast(message: string, options?: ToastOptions): void {
  toast.error(message, {
    duration: options?.duration ?? 6000,
  });
}

/**
 * 警告メッセージをトースト通知で表示
 *
 * @param message - 表示するメッセージ
 * @param options - トーストのオプション
 */
export function showWarningToast(message: string, options?: ToastOptions): void {
  toast.warning(message, {
    duration: options?.duration ?? 5000,
  });
}

/**
 * 情報メッセージをトースト通知で表示
 *
 * @param message - 表示するメッセージ
 * @param options - トーストのオプション
 */
export function showInfoToast(message: string, options?: ToastOptions): void {
  toast.info(message, {
    duration: options?.duration ?? 4000,
  });
}
