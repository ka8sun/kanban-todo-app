#!/bin/bash

# Supabaseマイグレーション適用スクリプト
# このスクリプトは、マイグレーションファイルをSupabaseデータベースに適用します。

set -e  # エラーが発生した場合はスクリプトを終了

echo "🔄 Supabaseマイグレーションを適用しています..."

# Supabase CLIがインストールされているか確認
if ! command -v supabase &> /dev/null
then
    echo "❌ Supabase CLIがインストールされていません。"
    echo "📦 以下のコマンドでインストールしてください:"
    echo "   npm install -g supabase"
    exit 1
fi

# プロジェクトルートに移動
cd "$(dirname "$0")/.."

# Supabaseプロジェクトにリンクされているか確認
if [ ! -f ".supabase/config.toml" ]; then
    echo "⚠️  Supabaseプロジェクトにリンクされていません。"
    echo "🔗 以下のコマンドでリンクしてください:"
    echo "   supabase link --project-ref dvcmnmhwcjsplxuurhqh"
    exit 1
fi

# マイグレーションの適用
echo "📤 マイグレーションをプッシュしています..."
supabase db push

echo "✅ マイグレーションが正常に適用されました！"
echo ""
echo "📋 次のステップ:"
echo "1. Supabaseダッシュボードにアクセス: https://app.supabase.com/project/dvcmnmhwcjsplxuurhqh"
echo "2. Database > Replication に移動"
echo "3. 以下のテーブルのReplicationを有効化:"
echo "   - public.columns"
echo "   - public.tasks"
echo ""
echo "🚀 準備完了！実装を続けてください。"
