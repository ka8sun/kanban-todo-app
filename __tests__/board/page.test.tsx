import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import BoardPage from '@/app/board/page';

// Mock Next.js server-side utilities
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

// Mock AuthService
vi.mock('@/lib/services/auth-service', () => ({
  getServerSession: vi.fn(),
}));

// Mock BoardService
vi.mock('@/lib/services/board-service', () => ({
  getBoard: vi.fn(),
}));

describe('BoardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render board header with user email and logout button', async () => {
    const { getServerSession } = await import('@/lib/services/auth-service');
    const { getBoard } = await import('@/lib/services/board-service');

    // Mock authenticated session
    vi.mocked(getServerSession).mockResolvedValue({
      success: true,
      data: {
        accessToken: 'token',
        refreshToken: 'refresh',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          emailConfirmed: true,
        },
        expiresAt: Date.now() + 3600000,
      },
    });

    // Mock empty board
    vi.mocked(getBoard).mockResolvedValue({
      success: true,
      data: {
        userId: 'user-1',
        columns: [],
      },
    });

    render(await BoardPage());

    // Wait for the header to be rendered
    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    // Check for logout button
    expect(screen.getByRole('button', { name: /ログアウト/i })).toBeInTheDocument();
  });

  it('should render "新しい列を追加" button', async () => {
    const { getServerSession } = await import('@/lib/services/auth-service');
    const { getBoard } = await import('@/lib/services/board-service');

    vi.mocked(getServerSession).mockResolvedValue({
      success: true,
      data: {
        accessToken: 'token',
        refreshToken: 'refresh',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          emailConfirmed: true,
        },
        expiresAt: Date.now() + 3600000,
      },
    });

    vi.mocked(getBoard).mockResolvedValue({
      success: true,
      data: {
        userId: 'user-1',
        columns: [],
      },
    });

    render(await BoardPage());

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /新しい列を追加/i })).toBeInTheDocument();
    });
  });

  it('should redirect to signin when not authenticated', async () => {
    const { getServerSession } = await import('@/lib/services/auth-service');
    const { redirect } = await import('next/navigation');

    vi.mocked(getServerSession).mockResolvedValue({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Not authenticated',
        statusCode: 401,
      },
    });

    await BoardPage();

    expect(redirect).toHaveBeenCalledWith('/auth/signin');
  });
});
