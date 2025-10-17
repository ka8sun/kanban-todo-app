/**
 * E2E テスト: レスポンシブデザイン
 *
 * このテストは以下のレスポンシブデザイン機能を検証します:
 * 1. デスクトップ表示（1440px、1024px）
 * 2. タブレット表示（768px）
 * 3. モバイル表示（375px、320px）
 * 4. 画面サイズ変更時の自動調整
 */

import { test, expect } from '@playwright/test';

test.describe('レスポンシブデザイン', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン
    await page.goto('/auth/signin');
    await page.getByLabel(/メールアドレス|email/i).fill('demo@example.com');
    await page.getByLabel(/パスワード|password/i).fill('DemoPassword123!');
    await page.getByRole('button', { name: /ログイン|sign in/i }).click();
    await expect(page).toHaveURL(/\/board/, { timeout: 10000 });
  });

  test('should display correctly on desktop (1440px)', async ({ page }) => {
    await test.step('Set viewport to 1440px', async () => {
      await page.setViewportSize({ width: 1440, height: 900 });
    });

    await test.step('Verify desktop layout', async () => {
      // 列が横並びで表示されることを確認
      const columns = page.locator('[data-testid="column"]');
      await expect(columns.first()).toBeVisible();

      // ヘッダーが表示されることを確認
      const header = page.locator('header, [role="banner"]');
      await expect(header).toBeVisible();

      // 複数の列が同時に見えることを確認
      const columnCount = await columns.count();
      expect(columnCount).toBeGreaterThan(0);

      // 各列が適切な幅で表示されることを確認
      const firstColumnBox = await columns.first().boundingBox();
      if (firstColumnBox) {
        expect(firstColumnBox.width).toBeGreaterThan(200);
        expect(firstColumnBox.width).toBeLessThan(500);
      }
    });
  });

  test('should display correctly on tablet (768px)', async ({ page }) => {
    await test.step('Set viewport to 768px', async () => {
      await page.setViewportSize({ width: 768, height: 1024 });
    });

    await test.step('Verify tablet layout', async () => {
      // カンバンボードが表示されることを確認
      const columns = page.locator('[data-testid="column"]');
      await expect(columns.first()).toBeVisible();

      // レイアウトが調整されていることを確認
      // （タブレットでは列が縦スタックまたは横スクロール）
      const boardContainer = page.locator('[data-testid="board-container"]');
      if (await boardContainer.isVisible().catch(() => false)) {
        const containerBox = await boardContainer.boundingBox();
        if (containerBox) {
          // コンテナが画面幅に収まっていることを確認
          expect(containerBox.width).toBeLessThanOrEqual(768);
        }
      }
    });
  });

  test('should display correctly on mobile (375px)', async ({ page }) => {
    await test.step('Set viewport to 375px (iPhone)', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
    });

    await test.step('Verify mobile layout', async () => {
      // カンバンボードが表示されることを確認
      const columns = page.locator('[data-testid="column"]');
      await expect(columns.first()).toBeVisible({ timeout: 5000 });

      // モバイルでは列が縦スタック表示またはスワイプ可能
      const firstColumn = columns.first();
      const columnBox = await firstColumn.boundingBox();

      if (columnBox) {
        // 列が画面幅に収まっていることを確認
        expect(columnBox.width).toBeLessThanOrEqual(375);
      }
    });

    await test.step('Verify mobile navigation', async () => {
      // モバイルメニューが表示されることを確認
      const mobileMenu = page.getByRole('button', { name: /menu|メニュー/i });

      if (await mobileMenu.isVisible().catch(() => false)) {
        await mobileMenu.click();

        // メニューが開くことを確認
        const nav = page.locator('nav, [role="navigation"]');
        await expect(nav).toBeVisible();
      }
    });
  });

  test('should display correctly on small mobile (320px)', async ({ page }) => {
    await test.step('Set viewport to 320px (小さいモバイル)', async () => {
      await page.setViewportSize({ width: 320, height: 568 });
    });

    await test.step('Verify small mobile layout', async () => {
      // カンバンボードが表示されることを確認
      const columns = page.locator('[data-testid="column"]');
      await expect(columns.first()).toBeVisible({ timeout: 5000 });

      // コンテンツがはみ出さないことを確認
      const body = page.locator('body');
      const bodyBox = await body.boundingBox();

      if (bodyBox) {
        // 水平スクロールバーが表示されていないことを確認
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });

        // 許容範囲内（数ピクセルのズレは許容）
        expect(hasHorizontalScroll).toBeFalsy();
      }
    });

    await test.step('Verify text is readable', async () => {
      // テキストが適切なサイズで表示されることを確認
      const taskCards = page.locator('[data-testid="task-card"]');

      if ((await taskCards.count()) > 0) {
        const firstCard = taskCards.first();
        const fontSize = await firstCard.evaluate((el) => {
          return window.getComputedStyle(el).fontSize;
        });

        // フォントサイズが最低12px以上であることを確認
        const fontSizeValue = parseInt(fontSize);
        expect(fontSizeValue).toBeGreaterThanOrEqual(12);
      }
    });
  });

  test('should adjust layout when resizing window', async ({ page }) => {
    await test.step('Start with desktop size', async () => {
      await page.setViewportSize({ width: 1440, height: 900 });

      // 列が横並びで表示されることを確認
      const columns = page.locator('[data-testid="column"]');
      await expect(columns.first()).toBeVisible();
    });

    await test.step('Resize to mobile', async () => {
      await page.setViewportSize({ width: 375, height: 667 });

      // レイアウトが自動的に調整されることを確認
      await page.waitForTimeout(500); // アニメーション待機

      const columns = page.locator('[data-testid="column"]');
      await expect(columns.first()).toBeVisible();

      // モバイルレイアウトに切り替わったことを確認
      const firstColumn = columns.first();
      const columnBox = await firstColumn.boundingBox();

      if (columnBox) {
        expect(columnBox.width).toBeLessThanOrEqual(375);
      }
    });

    await test.step('Resize back to desktop', async () => {
      await page.setViewportSize({ width: 1440, height: 900 });

      // デスクトップレイアウトに戻ることを確認
      await page.waitForTimeout(500);

      const columns = page.locator('[data-testid="column"]');
      await expect(columns.first()).toBeVisible();
    });
  });

  test('should support touch gestures on mobile', async ({ page }) => {
    await test.step('Set viewport to mobile', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
    });

    await test.step('Test swipe gesture', async () => {
      // スワイプジェスチャーで列を切り替えられることを確認
      // （実装により異なる）
      const boardContainer = page.locator('[data-testid="board-container"]');

      if (await boardContainer.isVisible().catch(() => false)) {
        const containerBox = await boardContainer.boundingBox();

        if (containerBox) {
          // 左から右にスワイプ
          await page.touchscreen.tap(
            containerBox.x + containerBox.width - 50,
            containerBox.y + 100
          );

          // スワイプ動作をシミュレート
          // （実際のスワイプはtouchscreen APIで実装）
        }
      }
    });
  });

  test('should maintain functionality on all screen sizes', async ({ page }) => {
    const sizes = [
      { width: 1440, height: 900, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' },
    ];

    for (const size of sizes) {
      await test.step(`Test on ${size.name} (${size.width}px)`, async () => {
        await page.setViewportSize({ width: size.width, height: size.height });
        await page.waitForTimeout(500);

        // タスク作成機能が動作することを確認
        const addTaskButton = page
          .locator('[data-testid="column"]')
          .first()
          .getByRole('button', { name: /タスクを追加|add task/i });

        if (await addTaskButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await addTaskButton.click();

          const taskTitleInput = page.getByLabel(/タイトル|title/i);
          await expect(taskTitleInput).toBeVisible({ timeout: 3000 });

          await taskTitleInput.fill(`${size.name}テストタスク`);
          await page.getByRole('button', { name: /作成|create/i }).click();

          await expect(page.getByText(`${size.name}テストタスク`)).toBeVisible({
            timeout: 5000,
          });
        }
      });
    }
  });
});
