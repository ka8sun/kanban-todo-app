/**
 * SearchBarコンポーネントのユニットテスト
 * Requirements: 5.1, 5.2 - テキスト検索機能
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchBar } from '../search-bar';
import { act } from 'react';

describe('SearchBar', () => {
  describe('テキスト検索', () => {
    it('検索ボックスが表示されること', () => {
      render(<SearchBar onSearchChange={jest.fn()} />);

      const searchInput = screen.getByPlaceholderText(/タスクを検索/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('テキスト入力時にonSearchChangeが呼ばれること', async () => {
      const mockOnSearchChange = jest.fn();
      render(<SearchBar onSearchChange={mockOnSearchChange} />);

      const searchInput = screen.getByPlaceholderText(/タスクを検索/i);

      await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'テスト' } });
      });

      // デバウンス処理のため、少し待つ
      await waitFor(() => {
        expect(mockOnSearchChange).toHaveBeenCalledWith('テスト');
      }, { timeout: 500 });
    });

    it('空文字入力時にonSearchChangeが呼ばれること', async () => {
      const mockOnSearchChange = jest.fn();
      render(<SearchBar onSearchChange={mockOnSearchChange} />);

      const searchInput = screen.getByPlaceholderText(/タスクを検索/i);

      await act(async () => {
        fireEvent.change(searchInput, { target: { value: '' } });
      });

      await waitFor(() => {
        expect(mockOnSearchChange).toHaveBeenCalledWith('');
      }, { timeout: 500 });
    });

    it('デバウンス処理が適用されること', async () => {
      jest.useFakeTimers();
      const mockOnSearchChange = jest.fn();
      render(<SearchBar onSearchChange={mockOnSearchChange} />);

      const searchInput = screen.getByPlaceholderText(/タスクを検索/i);

      // 連続して入力
      fireEvent.change(searchInput, { target: { value: 'a' } });
      fireEvent.change(searchInput, { target: { value: 'ab' } });
      fireEvent.change(searchInput, { target: { value: 'abc' } });

      // まだ呼ばれていないことを確認
      expect(mockOnSearchChange).not.toHaveBeenCalled();

      // タイマーを進める（300ms）
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // 最後の入力値で1回だけ呼ばれることを確認
      expect(mockOnSearchChange).toHaveBeenCalledTimes(1);
      expect(mockOnSearchChange).toHaveBeenCalledWith('abc');

      jest.useRealTimers();
    });

    it('検索値をクリアできること', async () => {
      const mockOnSearchChange = jest.fn();
      render(<SearchBar onSearchChange={mockOnSearchChange} />);

      const searchInput = screen.getByPlaceholderText(/タスクを検索/i);

      // 検索値を入力
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'テスト' } });
      });

      await waitFor(() => {
        expect(mockOnSearchChange).toHaveBeenCalledWith('テスト');
      });

      // クリアボタンをクリック
      const clearButton = screen.getByRole('button', { name: /クリア/i });
      await act(async () => {
        fireEvent.click(clearButton);
      });

      expect(searchInput).toHaveValue('');
      expect(mockOnSearchChange).toHaveBeenCalledWith('');
    });
  });
});
