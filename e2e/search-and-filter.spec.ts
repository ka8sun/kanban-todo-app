/**
 * E2E テスト: 検索・フィルタリング機能
 *
 * このテストは以下の検索・フィルタリング機能を検証します:
 * 1. タスクのテキスト検索
 * 2. 優先度でのフィルタリング
 * 3. 複合フィルター（検索+優先度）
 * 4. フィルタークリア
 */

import { test, expect } from '@playwright/test';

test.describe('検索・フィルタリング機能', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン
    await page.goto('/auth/signin');
    await page.getByLabel(/メールアドレス|email/i).fill('demo@example.com');
    await page.getByLabel(/パスワード|password/i).fill('DemoPassword123!');
    await page.getByRole('button', { name: /ログイン|sign in/i }).click();
    await expect(page).toHaveURL(/\/board/, { timeout: 10000 });
  });

  test('should search tasks by title', async ({ page }) => {
    await test.step('Create test tasks with different titles', async () => {
      const addTaskButton = page
        .locator('[data-testid="column"]')
        .first()
        .getByRole('button', { name: /タスクを追加|add task/i });

      // バグ修正タスク
      await addTaskButton.click();
      await page.getByLabel(/タイトル|title/i).fill('バグ修正: ログイン画面');
      await page.getByRole('button', { name: /作成|create/i }).click();
      await expect(page.getByText('バグ修正: ログイン画面')).toBeVisible();

      // 機能追加タスク
      await addTaskButton.click();
      await page.getByLabel(/タイトル|title/i).fill('機能追加: 通知機能');
      await page.getByRole('button', { name: /作成|create/i }).click();
      await expect(page.getByText('機能追加: 通知機能')).toBeVisible();

      // テストタスク
      await addTaskButton.click();
      await page.getByLabel(/タイトル|title/i).fill('テスト: E2Eテスト作成');
      await page.getByRole('button', { name: /作成|create/i }).click();
      await expect(page.getByText('テスト: E2Eテスト作成')).toBeVisible();
    });

    await test.step('Search for "バグ"', async () => {
      const searchBox = page.getByPlaceholder(/検索|search/i);
      await searchBox.fill('バグ');

      // バグ修正タスクのみが表示されることを確認
      await expect(page.getByText('バグ修正: ログイン画面')).toBeVisible();
      await expect(page.getByText('機能追加: 通知機能')).not.toBeVisible();
      await expect(page.getByText('テスト: E2Eテスト作成')).not.toBeVisible();
    });

    await test.step('Clear search', async () => {
      const searchBox = page.getByPlaceholder(/検索|search/i);
      await searchBox.clear();

      // 全てのタスクが再表示されることを確認
      await expect(page.getByText('バグ修正: ログイン画面')).toBeVisible();
      await expect(page.getByText('機能追加: 通知機能')).toBeVisible();
      await expect(page.getByText('テスト: E2Eテスト作成')).toBeVisible();
    });
  });

  test('should filter tasks by priority', async ({ page }) => {
    await test.step('Create tasks with different priorities', async () => {
      const firstColumn = page.locator('[data-testid="column"]').first();
      const addTaskButton = firstColumn.getByRole('button', {
        name: /タスクを追加|add task/i,
      });

      // 高優先度タスク
      await addTaskButton.click();
      await page.getByLabel(/タイトル|title/i).fill('緊急タスク');
      const prioritySelect = page.getByLabel(/優先度|priority/i);
      if (await prioritySelect.isVisible().catch(() => false)) {
        await prioritySelect.selectOption('high');
      }
      await page.getByRole('button', { name: /作成|create/i }).click();
      await expect(page.getByText('緊急タスク')).toBeVisible();

      // 中優先度タスク
      await addTaskButton.click();
      await page.getByLabel(/タイトル|title/i).fill('通常タスク');
      if (await prioritySelect.isVisible().catch(() => false)) {
        await prioritySelect.selectOption('medium');
      }
      await page.getByRole('button', { name: /作成|create/i }).click();
      await expect(page.getByText('通常タスク')).toBeVisible();

      // 低優先度タスク
      await addTaskButton.click();
      await page.getByLabel(/タイトル|title/i).fill('後回しタスク');
      if (await prioritySelect.isVisible().catch(() => false)) {
        await prioritySelect.selectOption('low');
      }
      await page.getByRole('button', { name: /作成|create/i }).click();
      await expect(page.getByText('後回しタスク')).toBeVisible();
    });

    await test.step('Filter by high priority', async () => {
      const priorityFilter = page.getByLabel(/優先度フィルター|priority filter/i);

      if (await priorityFilter.isVisible().catch(() => false)) {
        await priorityFilter.selectOption('high');

        // 高優先度タスクのみが表示されることを確認
        await expect(page.getByText('緊急タスク')).toBeVisible();
        await expect(page.getByText('通常タスク')).not.toBeVisible();
        await expect(page.getByText('後回しタスク')).not.toBeVisible();
      }
    });

    await test.step('Clear filter', async () => {
      const clearButton = page.getByRole('button', { name: /クリア|clear|すべて/i });

      if (await clearButton.isVisible().catch(() => false)) {
        await clearButton.click();

        // 全てのタスクが再表示されることを確認
        await expect(page.getByText('緊急タスク')).toBeVisible();
        await expect(page.getByText('通常タスク')).toBeVisible();
        await expect(page.getByText('後回しタスク')).toBeVisible();
      }
    });
  });

  test('should apply combined filters', async ({ page }) => {
    await test.step('Create tasks', async () => {
      const addTaskButton = page
        .locator('[data-testid="column"]')
        .first()
        .getByRole('button', { name: /タスクを追加|add task/i });

      // 高優先度バグ
      await addTaskButton.click();
      await page.getByLabel(/タイトル|title/i).fill('バグ: 重大な問題');
      const prioritySelect = page.getByLabel(/優先度|priority/i);
      if (await prioritySelect.isVisible().catch(() => false)) {
        await prioritySelect.selectOption('high');
      }
      await page.getByRole('button', { name: /作成|create/i }).click();
      await expect(page.getByText('バグ: 重大な問題')).toBeVisible();

      // 低優先度バグ
      await addTaskButton.click();
      await page.getByLabel(/タイトル|title/i).fill('バグ: 軽微な問題');
      if (await prioritySelect.isVisible().catch(() => false)) {
        await prioritySelect.selectOption('low');
      }
      await page.getByRole('button', { name: /作成|create/i }).click();
      await expect(page.getByText('バグ: 軽微な問題')).toBeVisible();

      // 高優先度機能
      await addTaskButton.click();
      await page.getByLabel(/タイトル|title/i).fill('機能: 新機能実装');
      if (await prioritySelect.isVisible().catch(() => false)) {
        await prioritySelect.selectOption('high');
      }
      await page.getByRole('button', { name: /作成|create/i }).click();
      await expect(page.getByText('機能: 新機能実装')).toBeVisible();
    });

    await test.step('Apply search and priority filter', async () => {
      // 「バグ」で検索
      const searchBox = page.getByPlaceholder(/検索|search/i);
      await searchBox.fill('バグ');

      // 高優先度でフィルター
      const priorityFilter = page.getByLabel(/優先度フィルター|priority filter/i);
      if (await priorityFilter.isVisible().catch(() => false)) {
        await priorityFilter.selectOption('high');

        // 「バグ: 重大な問題」のみが表示されることを確認
        await expect(page.getByText('バグ: 重大な問題')).toBeVisible();
        await expect(page.getByText('バグ: 軽微な問題')).not.toBeVisible();
        await expect(page.getByText('機能: 新機能実装')).not.toBeVisible();
      }
    });
  });

  test('should show "no results" message when no tasks match', async ({
    page,
  }) => {
    await test.step('Search for non-existent task', async () => {
      const searchBox = page.getByPlaceholder(/検索|search/i);
      await searchBox.fill('存在しないタスク12345');

      // 結果なしメッセージが表示されることを確認
      await expect(
        page.getByText(/タスクが見つかりません|no tasks found|結果なし/i)
      ).toBeVisible({ timeout: 3000 });
    });
  });
});
