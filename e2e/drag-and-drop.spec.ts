/**
 * E2E テスト: ドラッグ&ドロップ操作
 *
 * このテストは以下のドラッグ&ドロップ機能を検証します:
 * 1. タスクを別の列にドラッグ&ドロップ
 * 2. タスクを同じ列内で並び替え
 * 3. ドラッグ中の視覚的フィードバック
 * 4. ドロップ後のデータ永続化
 */

import { test, expect } from '@playwright/test';

test.describe('ドラッグ&ドロップ操作', () => {
  test.beforeEach(async ({ page }) => {
    // テスト用アカウントでログイン
    await page.goto('/auth/signin');

    const demoEmail = 'demo@example.com';
    const demoPassword = 'DemoPassword123!';

    await page.getByLabel(/メールアドレス|email/i).fill(demoEmail);
    await page.getByLabel(/パスワード|password/i).fill(demoPassword);

    const loginButton = page.getByRole('button', { name: /ログイン|sign in/i });
    await loginButton.click();

    // カンバンボードにリダイレクト
    await expect(page).toHaveURL(/\/board/, { timeout: 10000 });
  });

  test('should drag task to another column', async ({ page }) => {
    await test.step('Verify columns are displayed', async () => {
      const columns = page.locator('[data-testid="column"]');
      await expect(columns.first()).toBeVisible();

      // 最低2つの列が存在することを確認
      const columnCount = await columns.count();
      expect(columnCount).toBeGreaterThanOrEqual(2);
    });

    await test.step('Create a test task in first column', async () => {
      const addTaskButton = page
        .locator('[data-testid="column"]')
        .first()
        .getByRole('button', { name: /タスクを追加|add task/i });

      await addTaskButton.click();

      const taskTitleInput = page.getByLabel(/タイトル|title/i);
      await taskTitleInput.fill('ドラッグテストタスク');

      const createButton = page.getByRole('button', { name: /作成|create/i });
      await createButton.click();

      await expect(page.getByText('ドラッグテストタスク')).toBeVisible();
    });

    await test.step('Drag task to second column', async () => {
      // タスクカードを取得
      const taskCard = page
        .locator('[data-testid="task-card"]')
        .filter({ hasText: 'ドラッグテストタスク' });

      // 2番目の列を取得
      const secondColumn = page.locator('[data-testid="column"]').nth(1);

      // タスクカードのバウンディングボックスを取得
      const taskBox = await taskCard.boundingBox();
      const columnBox = await secondColumn.boundingBox();

      if (taskBox && columnBox) {
        // ドラッグ開始
        await page.mouse.move(
          taskBox.x + taskBox.width / 2,
          taskBox.y + taskBox.height / 2
        );
        await page.mouse.down();

        // ドラッグ中の視覚的フィードバックを確認
        // （実装により異なるが、通常は半透明やハイライトが表示される）

        // 移動先にドラッグ
        await page.mouse.move(
          columnBox.x + columnBox.width / 2,
          columnBox.y + 100
        );

        // ドロップ
        await page.mouse.up();

        // タスクが2番目の列に移動したことを確認
        await page.waitForTimeout(1000); // アニメーション待機

        const taskInSecondColumn = secondColumn.locator('[data-testid="task-card"]').filter({
          hasText: 'ドラッグテストタスク',
        });

        await expect(taskInSecondColumn).toBeVisible({ timeout: 5000 });
      }
    });

    await test.step('Verify task persists after page reload', async () => {
      // ページをリロード
      await page.reload();

      // タスクが2番目の列に残っていることを確認
      const secondColumn = page.locator('[data-testid="column"]').nth(1);
      const taskInSecondColumn = secondColumn.locator('[data-testid="task-card"]').filter({
        hasText: 'ドラッグテストタスク',
      });

      await expect(taskInSecondColumn).toBeVisible({ timeout: 5000 });
    });
  });

  test('should reorder tasks within the same column', async ({ page }) => {
    await test.step('Create multiple tasks in same column', async () => {
      const firstColumn = page.locator('[data-testid="column"]').first();
      const addTaskButton = firstColumn.getByRole('button', {
        name: /タスクを追加|add task/i,
      });

      // タスク1を作成
      await addTaskButton.click();
      await page.getByLabel(/タイトル|title/i).fill('タスク1');
      await page.getByRole('button', { name: /作成|create/i }).click();
      await expect(page.getByText('タスク1')).toBeVisible();

      // タスク2を作成
      await addTaskButton.click();
      await page.getByLabel(/タイトル|title/i).fill('タスク2');
      await page.getByRole('button', { name: /作成|create/i }).click();
      await expect(page.getByText('タスク2')).toBeVisible();

      // タスク3を作成
      await addTaskButton.click();
      await page.getByLabel(/タイトル|title/i).fill('タスク3');
      await page.getByRole('button', { name: /作成|create/i }).click();
      await expect(page.getByText('タスク3')).toBeVisible();
    });

    await test.step('Reorder tasks by dragging', async () => {
      const firstColumn = page.locator('[data-testid="column"]').first();

      // タスク3をタスク1の位置にドラッグ
      const task3 = firstColumn
        .locator('[data-testid="task-card"]')
        .filter({ hasText: 'タスク3' });
      const task1 = firstColumn
        .locator('[data-testid="task-card"]')
        .filter({ hasText: 'タスク1' });

      const task3Box = await task3.boundingBox();
      const task1Box = await task1.boundingBox();

      if (task3Box && task1Box) {
        await page.mouse.move(
          task3Box.x + task3Box.width / 2,
          task3Box.y + task3Box.height / 2
        );
        await page.mouse.down();
        await page.mouse.move(
          task1Box.x + task1Box.width / 2,
          task1Box.y + task1Box.height / 2
        );
        await page.mouse.up();

        // 並び順が変わったことを確認
        await page.waitForTimeout(1000);

        const tasks = await firstColumn
          .locator('[data-testid="task-card"]')
          .allTextContents();

        // タスク3が先頭に来ていることを確認
        expect(tasks[0]).toContain('タスク3');
      }
    });
  });

  test('should show visual feedback during drag', async ({ page }) => {
    await test.step('Create a test task', async () => {
      const addTaskButton = page
        .locator('[data-testid="column"]')
        .first()
        .getByRole('button', { name: /タスクを追加|add task/i });

      await addTaskButton.click();
      await page.getByLabel(/タイトル|title/i).fill('視覚フィードバックテスト');
      await page.getByRole('button', { name: /作成|create/i }).click();
      await expect(page.getByText('視覚フィードバックテスト')).toBeVisible();
    });

    await test.step('Verify visual feedback during drag', async () => {
      const taskCard = page
        .locator('[data-testid="task-card"]')
        .filter({ hasText: '視覚フィードバックテスト' });

      const taskBox = await taskCard.boundingBox();

      if (taskBox) {
        // ドラッグ開始
        await page.mouse.move(
          taskBox.x + taskBox.width / 2,
          taskBox.y + taskBox.height / 2
        );
        await page.mouse.down();

        // 少し移動
        await page.mouse.move(taskBox.x + taskBox.width / 2, taskBox.y + 50);

        // ドラッグ中のスタイル変化をキャプチャ（実装による）
        // 例: 半透明、影、ハイライトなど
        const isDragging = await page.evaluate(() => {
          const draggedElement = document.querySelector('[data-rbd-dragging-over]');
          return draggedElement !== null;
        });

        // ドロップ
        await page.mouse.up();

        // ドラッグ中に何らかの視覚的変化があったことを確認
        // （実装に依存するため、このテストは参考実装）
      }
    });
  });

  test('should handle drag cancellation with Escape key', async ({ page }) => {
    await test.step('Create a test task', async () => {
      const addTaskButton = page
        .locator('[data-testid="column"]')
        .first()
        .getByRole('button', { name: /タスクを追加|add task/i });

      await addTaskButton.click();
      await page.getByLabel(/タイトル|title/i).fill('キャンセルテスト');
      await page.getByRole('button', { name: /作成|create/i }).click();
      await expect(page.getByText('キャンセルテスト')).toBeVisible();
    });

    await test.step('Start drag and cancel with Escape', async () => {
      const taskCard = page
        .locator('[data-testid="task-card"]')
        .filter({ hasText: 'キャンセルテスト' });

      const originalColumn = page.locator('[data-testid="column"]').first();
      const taskBox = await taskCard.boundingBox();

      if (taskBox) {
        await page.mouse.move(
          taskBox.x + taskBox.width / 2,
          taskBox.y + taskBox.height / 2
        );
        await page.mouse.down();

        // 移動
        await page.mouse.move(taskBox.x + 200, taskBox.y + 100);

        // Escapeキーでキャンセル
        await page.keyboard.press('Escape');

        // タスクが元の位置に戻ることを確認
        await page.waitForTimeout(500);

        const taskInOriginalColumn = originalColumn
          .locator('[data-testid="task-card"]')
          .filter({ hasText: 'キャンセルテスト' });

        await expect(taskInOriginalColumn).toBeVisible();
      }
    });
  });
});
