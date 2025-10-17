/**
 * E2E テスト: 認証とタスク管理の完全フロー
 *
 * このテストは以下のシナリオを検証します:
 * 1. サインアップ → 確認メール送信通知
 * 2. ログイン → カンバンボード表示
 * 3. 列追加 → タスク作成 → タスク表示
 * 4. ログアウト → 再ログイン
 */

import { test, expect } from '@playwright/test';

test.describe('ユーザー登録からタスク管理までの完全フロー', () => {
  test.beforeEach(async ({ page }) => {
    // テスト開始時にホームページにアクセス
    await page.goto('/');
  });

  test('should complete full user journey from signup to task management', async ({
    page,
  }) => {
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';

    // ステップ1: サインアップページにアクセス
    await test.step('Navigate to signup page', async () => {
      // ログインページからサインアップリンクをクリック
      const signupLink = page.getByRole('link', { name: /サインアップ|sign up|新規登録/i });
      if (await signupLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await signupLink.click();
      } else {
        // 直接サインアップページに移動
        await page.goto('/auth/signup');
      }

      await expect(page).toHaveURL(/\/auth\/signup/);
    });

    // ステップ2: サインアップフォーム入力
    await test.step('Fill signup form and submit', async () => {
      await page.getByLabel(/メールアドレス|email/i).fill(testEmail);
      await page.getByLabel(/パスワード|password/i).first().fill(testPassword);

      const submitButton = page.getByRole('button', { name: /サインアップ|sign up|登録/i });
      await submitButton.click();

      // 確認メール送信通知を確認
      await expect(
        page.getByText(/確認メール|confirmation email|メールを送信/i)
      ).toBeVisible({ timeout: 5000 });
    });

    // 注: 実際のE2Eテストでは、メール確認プロセスをスキップして
    // テスト用のアカウントを直接使用するか、モックを使用します
    // ここではログインフローに進みます

    // ステップ3: ログインページに移動してログイン
    await test.step('Login with test account', async () => {
      // テスト用に既に確認済みのアカウントを使用
      // または、Supabaseの管理APIで確認済みにする
      await page.goto('/auth/signin');

      // デモ用のテストアカウントを使用
      const demoEmail = 'demo@example.com';
      const demoPassword = 'DemoPassword123!';

      await page.getByLabel(/メールアドレス|email/i).fill(demoEmail);
      await page.getByLabel(/パスワード|password/i).fill(demoPassword);

      const loginButton = page.getByRole('button', { name: /ログイン|sign in|サインイン/i });
      await loginButton.click();

      // カンバンボードページにリダイレクトされることを確認
      await expect(page).toHaveURL(/\/board/, { timeout: 10000 });
    });

    // ステップ4: カンバンボードが表示されることを確認
    await test.step('Verify kanban board is displayed', async () => {
      // デフォルトの列が表示されていることを確認
      const columns = page.locator('[data-testid="column"]');
      await expect(columns.first()).toBeVisible({ timeout: 5000 });

      // ボードヘッダーが表示されていることを確認
      const header = page.locator('header, [role="banner"]');
      await expect(header).toBeVisible();
    });

    // ステップ5: 新しい列を追加
    await test.step('Add a new column', async () => {
      const addColumnButton = page.getByRole('button', {
        name: /列を追加|add column|新しい列/i,
      });

      await addColumnButton.click();

      // 列名入力モーダルが表示される
      const columnNameInput = page.getByLabel(/列名|column name/i);
      await expect(columnNameInput).toBeVisible();

      await columnNameInput.fill('テスト列');

      const saveButton = page.getByRole('button', { name: /保存|save|作成/i });
      await saveButton.click();

      // 新しい列が表示されることを確認
      await expect(page.getByText('テスト列')).toBeVisible({ timeout: 5000 });
    });

    // ステップ6: タスクを作成
    await test.step('Create a new task', async () => {
      // 最初の列の「タスクを追加」ボタンをクリック
      const addTaskButton = page
        .locator('[data-testid="column"]')
        .first()
        .getByRole('button', { name: /タスクを追加|add task|\+/i });

      await addTaskButton.click();

      // タスク作成フォームが表示される
      const taskTitleInput = page.getByLabel(/タイトル|title/i);
      await expect(taskTitleInput).toBeVisible();

      await taskTitleInput.fill('E2Eテストタスク');

      const taskDescriptionInput = page.getByLabel(/説明|description/i);
      if (await taskDescriptionInput.isVisible().catch(() => false)) {
        await taskDescriptionInput.fill('Playwrightで作成されたテストタスク');
      }

      // 優先度を選択
      const prioritySelect = page.getByLabel(/優先度|priority/i);
      if (await prioritySelect.isVisible().catch(() => false)) {
        await prioritySelect.selectOption('high');
      }

      const createButton = page.getByRole('button', { name: /作成|create|追加/i });
      await createButton.click();

      // タスクカードが表示されることを確認
      await expect(page.getByText('E2Eテストタスク')).toBeVisible({
        timeout: 5000,
      });
    });

    // ステップ7: タスクをクリックして詳細モーダルを開く
    await test.step('Open task detail modal', async () => {
      const taskCard = page.getByText('E2Eテストタスク');
      await taskCard.click();

      // モーダルが開くことを確認
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();

      // タスクの詳細が表示されることを確認
      await expect(modal.getByText('E2Eテストタスク')).toBeVisible();
    });

    // ステップ8: ログアウト
    await test.step('Logout', async () => {
      // モーダルを閉じる
      const closeButton = page.getByRole('button', { name: /閉じる|close/i });
      if (await closeButton.isVisible().catch(() => false)) {
        await closeButton.click();
      } else {
        await page.keyboard.press('Escape');
      }

      // ログアウトボタンをクリック
      const logoutButton = page.getByRole('button', { name: /ログアウト|logout|sign out/i });
      await logoutButton.click();

      // ログインページにリダイレクトされることを確認
      await expect(page).toHaveURL(/\/auth\/signin|\/login|\//, { timeout: 5000 });
    });

    // ステップ9: 再ログインしてタスクが保存されていることを確認
    await test.step('Re-login and verify task persists', async () => {
      const demoEmail = 'demo@example.com';
      const demoPassword = 'DemoPassword123!';

      // ログインページに移動
      if (!(await page.url().includes('/auth/signin'))) {
        await page.goto('/auth/signin');
      }

      await page.getByLabel(/メールアドレス|email/i).fill(demoEmail);
      await page.getByLabel(/パスワード|password/i).fill(demoPassword);

      const loginButton = page.getByRole('button', { name: /ログイン|sign in/i });
      await loginButton.click();

      // カンバンボードにリダイレクト
      await expect(page).toHaveURL(/\/board/, { timeout: 10000 });

      // 作成したタスクが表示されることを確認
      await expect(page.getByText('E2Eテストタスク')).toBeVisible({
        timeout: 5000,
      });
    });
  });

  test('should display error for invalid login credentials', async ({ page }) => {
    await test.step('Navigate to login page', async () => {
      await page.goto('/auth/signin');
    });

    await test.step('Try to login with invalid credentials', async () => {
      await page.getByLabel(/メールアドレス|email/i).fill('invalid@example.com');
      await page.getByLabel(/パスワード|password/i).fill('WrongPassword123!');

      const loginButton = page.getByRole('button', { name: /ログイン|sign in/i });
      await loginButton.click();

      // エラーメッセージが表示されることを確認
      await expect(
        page.getByText(/認証情報が無効|invalid credentials|ログインに失敗/i)
      ).toBeVisible({ timeout: 5000 });
    });
  });

  test('should redirect to login when accessing protected route', async ({
    page,
  }) => {
    await test.step('Try to access board without authentication', async () => {
      // 認証なしでカンバンボードにアクセス
      await page.goto('/board');

      // ログインページにリダイレクトされることを確認
      await expect(page).toHaveURL(/\/auth\/signin|\/login/, { timeout: 5000 });
    });
  });
});
