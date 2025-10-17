'use client';

import React, { Component, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

/**
 * ErrorBoundaryのプロパティ
 */
interface ErrorBoundaryProps {
  /**
   * エラー境界内でレンダリングする子要素
   */
  children: ReactNode;

  /**
   * カスタムフォールバックUI(オプション)
   */
  fallback?: (error: Error, resetError: () => void) => ReactNode;
}

/**
 * ErrorBoundaryのState
 */
interface ErrorBoundaryState {
  /**
   * エラーが発生したかどうか
   */
  hasError: boolean;

  /**
   * 発生したエラー
   */
  error: Error | null;
}

/**
 * Reactエラー境界コンポーネント
 *
 * 子コンポーネントで発生したエラーをキャッチし、フォールバックUIを表示します。
 * ユーザーに「再試行」ボタンを提供し、エラーから回復できるようにします。
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  /**
   * エラーが発生したときにStateを更新
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  /**
   * エラー情報をログ出力
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // ネットワークエラーかどうか判定
    if (error.message.includes('fetch') || error.message.includes('network')) {
      console.error('Network error detected');
    }
  }

  /**
   * エラーStateをリセットして再試行
   */
  resetError = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // カスタムフォールバックが提供されている場合はそれを使用
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.resetError);
      }

      // ネットワークエラーかどうか判定
      const isNetworkError =
        this.state.error!.message.includes('fetch') ||
        this.state.error!.message.includes('network') ||
        this.state.error!.message.includes('Failed to fetch');

      // デフォルトのフォールバックUI
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-md">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>
                {isNetworkError ? 'ネットワークエラー' : 'エラーが発生しました'}
              </AlertTitle>
              <AlertDescription className="mt-2 space-y-2">
                <p>
                  {isNetworkError
                    ? 'ネットワークに接続できません。インターネット接続を確認してください。'
                    : '予期しないエラーが発生しました。ページを再読み込みするか、下の「再試行」ボタンをクリックしてください。'}
                </p>
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium">
                      エラー詳細
                    </summary>
                    <pre className="mt-2 max-h-40 overflow-auto rounded bg-gray-100 p-2 text-xs">
                      {this.state.error.message}
                      {'\n'}
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </AlertDescription>
            </Alert>
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                ページを再読み込み
              </Button>
              <Button onClick={this.resetError}>再試行</Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
