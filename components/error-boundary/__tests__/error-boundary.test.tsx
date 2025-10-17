import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../error-boundary';
import React from 'react';

/**
 * エラーを投げるテスト用コンポーネント
 */
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>正常なコンテンツ</div>;
}

/**
 * ErrorBoundaryコンポーネントのユニットテスト
 *
 * このテストは以下を検証します:
 * - エラーが発生しない場合は子コンポーネントが正常に表示される
 * - エラーが発生した場合はフォールバックUIが表示される
 * - フォールバックUIに「再試行」ボタンが表示される
 * - エラーメッセージが表示される
 */
describe('ErrorBoundary', () => {
  // コンソールエラーを抑制
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('正常なコンテンツ')).toBeInTheDocument();
  });

  it('should render fallback UI when an error is thrown', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getAllByText(/エラーが発生しました/).length).toBeGreaterThan(0);
  });

  it('should display retry button in fallback UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const retryButton = screen.getByRole('button', { name: /再試行/ });
    expect(retryButton).toBeInTheDocument();
  });

  it('should display error message', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/予期しないエラーが発生しました/)).toBeInTheDocument();
  });
});
