import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { SessionSync } from "@/components/auth/session-sync";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/error-boundary";

export const metadata: Metadata = {
  title: "カンバンToDoアプリ",
  description: "Supabaseを使用したカンバンスタイルのToDoアプリケーション",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <ErrorBoundary>
          <AuthProvider>
            <SessionSync />
            {children}
          </AuthProvider>
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  );
}
