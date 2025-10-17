/**
 * ヘルプモーダルコンポーネントのテスト
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HelpModal } from '../help-modal';

describe('HelpModal', () => {
  const mockOnClose = vi.fn();

  it('open=trueの場合にモーダルが表示される', () => {
    render(<HelpModal open={true} onClose={mockOnClose} />);

    expect(screen.getByText(/ヘルプ/i)).toBeInTheDocument();
  });

  it('open=falseの場合にモーダルが表示されない', () => {
    render(<HelpModal open={false} onClose={mockOnClose} />);

    expect(screen.queryByText(/ヘルプ/i)).not.toBeInTheDocument();
  });

  it('閉じるボタンをクリックするとonCloseが呼ばれる', () => {
    render(<HelpModal open={true} onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button', { name: /閉じる/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('キーボードショートカットのセクションが表示される', () => {
    render(<HelpModal open={true} onClose={mockOnClose} />);

    expect(screen.getByText(/キーボードショートカット/i)).toBeInTheDocument();
  });

  it('FAQセクションが表示される', () => {
    render(<HelpModal open={true} onClose={mockOnClose} />);

    expect(screen.getByRole('heading', { name: /よくある質問/i })).toBeInTheDocument();
  });

  it('主要機能の説明が表示される', () => {
    render(<HelpModal open={true} onClose={mockOnClose} />);

    expect(screen.getByText(/タスクの作成/i)).toBeInTheDocument();
    expect(screen.getByText(/ドラッグ&ドロップ/i)).toBeInTheDocument();
    expect(screen.getByText(/検索とフィルター/i)).toBeInTheDocument();
  });
});
