/**
 * チュートリアルモーダルコンポーネントのテスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TutorialModal } from '../tutorial-modal';

describe('TutorialModal', () => {
  const mockOnComplete = vi.fn();
  const mockOnSkip = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('初回利用時にモーダルが表示される', () => {
    render(
      <TutorialModal
        open={true}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    expect(screen.getByText(/ようこそ/i)).toBeInTheDocument();
  });

  it('ステップ1が最初に表示される', () => {
    render(
      <TutorialModal
        open={true}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    expect(screen.getByText(/タスクの作成/i)).toBeInTheDocument();
  });

  it('次へボタンをクリックするとステップ2に進む', async () => {
    render(
      <TutorialModal
        open={true}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    const nextButton = screen.getByRole('button', { name: /次へ/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /ドラッグ&ドロップ/i })).toBeInTheDocument();
    });
  });

  it('戻るボタンをクリックすると前のステップに戻る', async () => {
    render(
      <TutorialModal
        open={true}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    // ステップ2に進む
    const nextButton = screen.getByRole('button', { name: /次へ/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /ドラッグ&ドロップ/i })).toBeInTheDocument();
    });

    // 戻る
    const backButton = screen.getByRole('button', { name: /戻る/i });
    fireEvent.click(backButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /タスクの作成/i })).toBeInTheDocument();
    });
  });

  it('スキップボタンをクリックするとonSkipが呼ばれる', () => {
    render(
      <TutorialModal
        open={true}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    const skipButton = screen.getByRole('button', { name: /スキップ/i });
    fireEvent.click(skipButton);

    expect(mockOnSkip).toHaveBeenCalledTimes(1);
  });

  it('最終ステップで完了ボタンをクリックするとonCompleteが呼ばれる', async () => {
    render(
      <TutorialModal
        open={true}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    // ステップを進める
    const nextButton = screen.getByRole('button', { name: /次へ/i });
    fireEvent.click(nextButton); // ステップ2
    fireEvent.click(nextButton); // ステップ3

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /完了/i })).toBeInTheDocument();
    });

    const completeButton = screen.getByRole('button', { name: /完了/i });
    fireEvent.click(completeButton);

    expect(mockOnComplete).toHaveBeenCalledTimes(1);
  });

  it('ステップインジケーターが正しく表示される', () => {
    render(
      <TutorialModal
        open={true}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('open=falseの場合はモーダルが表示されない', () => {
    render(
      <TutorialModal
        open={false}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    expect(screen.queryByText(/ようこそ/i)).not.toBeInTheDocument();
  });
});
