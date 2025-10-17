# デプロイガイド

このドキュメントでは、カンバンToDoアプリケーションをVercelにデプロイする手順とCI/CD設定について説明します。

## 目次

- [前提条件](#前提条件)
- [環境変数の設定](#環境変数の設定)
- [Vercelへのデプロイ](#vercelへのデプロイ)
- [CI/CD パイプライン](#cicd-パイプライン)
- [パフォーマンス計測](#パフォーマンス計測)
- [トラブルシューティング](#トラブルシューティング)

## 前提条件

以下のツールとアカウントが必要です:

- [Node.js](https://nodejs.org/) v20以上
- [npm](https://www.npmjs.com/) v10以上
- [Vercel アカウント](https://vercel.com/signup)
- [Supabase プロジェクト](https://supabase.com/)
- [GitHub リポジトリ](https://github.com/)（CI/CD用）

## 環境変数の設定

### ローカル開発環境

プロジェクトルートに `.env.local` ファイルを作成し、以下の環境変数を設定します:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional: For development
NODE_ENV=development
```

### Vercel本番環境

Vercelダッシュボードで以下の環境変数を設定します:

1. Vercelプロジェクト画面で `Settings` → `Environment Variables` を開く
2. 以下の変数を追加:

| 変数名 | 値 | 環境 |
|--------|---|------|
| `NEXT_PUBLIC_SUPABASE_URL` | SupabaseプロジェクトURL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | Production, Preview, Development |

### GitHub Secrets（CI/CD用）

GitHub リポジトリで `Settings` → `Secrets and variables` → `Actions` を開き、以下のシークレットを追加:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Vercelへのデプロイ

### 方法1: Vercel CLI（推奨）

1. Vercel CLIをインストール:

```bash
npm install -g vercel
```

2. ログイン:

```bash
vercel login
```

3. プロジェクトをデプロイ:

```bash
# プレビューデプロイ
vercel

# 本番デプロイ
vercel --prod
```

### 方法2: Vercel GitHub統合

1. [Vercelダッシュボード](https://vercel.com/dashboard)にアクセス
2. `New Project` をクリック
3. GitHubリポジトリを選択
4. `Import` をクリック
5. 環境変数を設定
6. `Deploy` をクリック

デプロイ後、以下の自動化が有効になります:
- **main ブランチへのpush** → 本番環境へ自動デプロイ
- **Pull Request** → プレビュー環境へ自動デプロイ

## CI/CD パイプライン

このプロジェクトでは GitHub Actions を使用したCI/CDパイプラインを実装しています。

### ワークフロー概要

`.github/workflows/ci.yml` に定義されている4つのジョブ:

1. **Lint and Type Check**
   - ESLintによるコードスタイルチェック
   - TypeScriptの型チェック

2. **Unit and Integration Tests**
   - Vitestによるユニットテストと統合テスト
   - カバレッジレポート生成

3. **E2E Tests**
   - Playwrightによるエンドツーエンドテスト
   - 複数ブラウザ（Chromium、Firefox、WebKit）で実行

4. **Build Check**
   - Next.jsビルドの成功確認
   - バンドルサイズの検証

### トリガー条件

- **main ブランチへのpush**: 全てのジョブを実行
- **Pull Request**: 全てのジョブを実行

### ステータスバッジ

READMEにステータスバッジを追加:

```markdown
[![CI](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml)
```

## パフォーマンス計測

### Lighthouseによる計測

アプリケーションのパフォーマンスをLighthouseで計測します。

1. ローカルサーバーを起動:

```bash
npm run build
npm run start
```

2. 別のターミナルでLighthouseを実行:

```bash
npm run perf:lighthouse
```

計測結果は `.lighthouse-reports/` ディレクトリに保存されます。

### パフォーマンス目標

設計書で定義された目標値:

- **Performance スコア**: 90以上
- **First Contentful Paint (FCP)**: 1.5秒以内
- **Largest Contentful Paint (LCP)**: 2.5秒以内
- **Time to Interactive (TTI)**: 3.8秒以内
- **Total Blocking Time (TBT)**: 200ms以内
- **Cumulative Layout Shift (CLS)**: 0.1以下

### バンドルサイズ分析

Next.jsのバンドルアナライザーでバンドルサイズを確認:

```bash
npm run perf:analyze
```

## デプロイメントチェックリスト

デプロイ前に以下を確認してください:

- [ ] 全ての環境変数がVercelに設定されている
- [ ] Supabaseのデータベーススキーマが最新
- [ ] RLSポリシーが正しく設定されている
- [ ] 全てのテストがパスしている
- [ ] Lighthouseスコアが目標値を達成している
- [ ] エラーログに問題がない
- [ ] セキュリティヘッダーが設定されている（vercel.jsonで定義済み）

## トラブルシューティング

### デプロイが失敗する

**症状**: Vercelでビルドエラーが発生する

**解決策**:
1. ローカルで `npm run build` を実行してエラーを確認
2. 環境変数が正しく設定されているか確認
3. `package.json` の依存関係を確認
4. Vercelのビルドログを詳細に確認

### Supabaseへの接続エラー

**症状**: `Failed to connect to Supabase` エラー

**解決策**:
1. Supabaseプロジェクトが稼働しているか確認
2. 環境変数 `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` が正しいか確認
3. Supabaseのネットワーク設定を確認（IPホワイトリスト等）

### CI/CDパイプラインが失敗する

**症状**: GitHub Actionsのジョブが失敗する

**解決策**:
1. ワークフローログを詳細に確認
2. GitHub Secretsが正しく設定されているか確認
3. ローカルで同じコマンドを実行してエラーを再現
4. キャッシュをクリアして再実行

### パフォーマンスが目標値に達しない

**症状**: Lighthouseスコアが90未満

**解決策**:
1. 改善推奨項目を確認（Lighthouseレポートの下部）
2. 画像の最適化（Next.js Imageコンポーネント使用）
3. Code Splittingの適用（dynamic import）
4. 不要なJavaScriptの削除
5. フォントの最適化（next/font使用）

## 参考リンク

- [Vercel デプロイメントドキュメント](https://vercel.com/docs)
- [Next.js デプロイメント](https://nextjs.org/docs/deployment)
- [Supabase ドキュメント](https://supabase.com/docs)
- [GitHub Actions ドキュメント](https://docs.github.com/en/actions)
- [Lighthouse ドキュメント](https://developer.chrome.com/docs/lighthouse)
