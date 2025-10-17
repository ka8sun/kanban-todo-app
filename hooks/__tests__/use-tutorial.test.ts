/**
 * useTutorialフックのテスト
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTutorial } from '../use-tutorial';

describe('useTutorial', () => {
  const STORAGE_KEY = 'kanban-tutorial-completed';

  beforeEach(() => {
    // localStorageをクリア
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('初回利用時はshowTutorialがtrueになる', () => {
    const { result } = renderHook(() => useTutorial());

    expect(result.current.showTutorial).toBe(true);
  });

  it('チュートリアル完了済みの場合はshowTutorialがfalseになる', () => {
    localStorage.setItem(STORAGE_KEY, 'true');

    const { result } = renderHook(() => useTutorial());

    expect(result.current.showTutorial).toBe(false);
  });

  it('completeTutorialを呼ぶとshowTutorialがfalseになる', () => {
    const { result } = renderHook(() => useTutorial());

    expect(result.current.showTutorial).toBe(true);

    act(() => {
      result.current.completeTutorial();
    });

    expect(result.current.showTutorial).toBe(false);
  });

  it('completeTutorialを呼ぶとlocalStorageに保存される', () => {
    const { result } = renderHook(() => useTutorial());

    act(() => {
      result.current.completeTutorial();
    });

    expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
  });

  it('skipTutorialを呼ぶとshowTutorialがfalseになる', () => {
    const { result } = renderHook(() => useTutorial());

    expect(result.current.showTutorial).toBe(true);

    act(() => {
      result.current.skipTutorial();
    });

    expect(result.current.showTutorial).toBe(false);
  });

  it('skipTutorialを呼ぶとlocalStorageに保存される', () => {
    const { result } = renderHook(() => useTutorial());

    act(() => {
      result.current.skipTutorial();
    });

    expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
  });

  it('resetTutorialを呼ぶとshowTutorialがtrueになる', () => {
    localStorage.setItem(STORAGE_KEY, 'true');

    const { result } = renderHook(() => useTutorial());

    expect(result.current.showTutorial).toBe(false);

    act(() => {
      result.current.resetTutorial();
    });

    expect(result.current.showTutorial).toBe(true);
  });

  it('resetTutorialを呼ぶとlocalStorageから削除される', () => {
    localStorage.setItem(STORAGE_KEY, 'true');

    const { result } = renderHook(() => useTutorial());

    act(() => {
      result.current.resetTutorial();
    });

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
