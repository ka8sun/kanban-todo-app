/**
 * サーバーサイド認証ユーティリティのテスト
 */

import { describe, it, expect } from 'vitest';
import { isSessionExpired, shouldRefreshSession } from '../server';
import type { AuthSession } from '../types';

describe('Server Auth Utilities', () => {
  describe('isSessionExpired', () => {
    it('有効期限が切れている場合trueを返す', () => {
      const expiredSession: AuthSession = {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresAt: Math.floor(Date.now() / 1000) - 3600, // 1時間前
        user: {
          id: 'user-123',
          email: 'test@example.com',
          emailConfirmed: true,
          createdAt: '2024-10-14T00:00:00Z',
        },
      };

      expect(isSessionExpired(expiredSession)).toBe(true);
    });

    it('有効期限内の場合falseを返す', () => {
      const validSession: AuthSession = {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresAt: Math.floor(Date.now() / 1000) + 3600, // 1時間後
        user: {
          id: 'user-123',
          email: 'test@example.com',
          emailConfirmed: true,
          createdAt: '2024-10-14T00:00:00Z',
        },
      };

      expect(isSessionExpired(validSession)).toBe(false);
    });
  });

  describe('shouldRefreshSession', () => {
    it('有効期限の5分前にtrueを返す', () => {
      const session: AuthSession = {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresAt: Math.floor(Date.now() / 1000) + 4 * 60, // 4分後
        user: {
          id: 'user-123',
          email: 'test@example.com',
          emailConfirmed: true,
          createdAt: '2024-10-14T00:00:00Z',
        },
      };

      expect(shouldRefreshSession(session)).toBe(true);
    });

    it('有効期限まで十分時間がある場合falseを返す', () => {
      const session: AuthSession = {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresAt: Math.floor(Date.now() / 1000) + 10 * 60, // 10分後
        user: {
          id: 'user-123',
          email: 'test@example.com',
          emailConfirmed: true,
          createdAt: '2024-10-14T00:00:00Z',
        },
      };

      expect(shouldRefreshSession(session)).toBe(false);
    });
  });
});
