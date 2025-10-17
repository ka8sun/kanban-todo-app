import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // パフォーマンス最適化設定

  // Code Splitting: 自動的にページごとにコード分割
  experimental: {
    optimizePackageImports: ['@radix-ui/react-dialog', '@radix-ui/react-select', 'lucide-react'],
  },

  // 本番ビルドでのソースマップを無効化してバンドルサイズ削減
  productionBrowserSourceMaps: false,

  // Compression: Gzip圧縮を有効化
  compress: true,

  // 画像最適化（将来的にアイコンやアバターを追加する場合に備えて）
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // React Compiler（React 19）の最適化を有効化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
};

export default nextConfig;
