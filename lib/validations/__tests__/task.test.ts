import { describe, it, expect } from 'vitest';
import { createTaskSchema, updateTaskSchema } from '../task';

describe('createTaskSchema', () => {
  describe('title validation', () => {
    it('should accept valid title', () => {
      const result = createTaskSchema.safeParse({
        title: 'Valid Task Title',
        priority: 'medium',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty title', () => {
      const result = createTaskSchema.safeParse({
        title: '',
        priority: 'medium',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('タイトルは1文字以上必要です');
      }
    });

    it('should reject title longer than 200 characters', () => {
      const result = createTaskSchema.safeParse({
        title: 'a'.repeat(201),
        priority: 'medium',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('タイトルは200文字以内で入力してください');
      }
    });
  });

  describe('description validation', () => {
    it('should accept valid description', () => {
      const result = createTaskSchema.safeParse({
        title: 'Task',
        description: 'Valid description',
        priority: 'medium',
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty description', () => {
      const result = createTaskSchema.safeParse({
        title: 'Task',
        priority: 'medium',
      });
      expect(result.success).toBe(true);
    });

    it('should reject description longer than 2000 characters', () => {
      const result = createTaskSchema.safeParse({
        title: 'Task',
        description: 'a'.repeat(2001),
        priority: 'medium',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('説明は2000文字以内で入力してください');
      }
    });
  });

  describe('priority validation', () => {
    it('should accept valid priority values', () => {
      const priorities = ['low', 'medium', 'high'];
      priorities.forEach((priority) => {
        const result = createTaskSchema.safeParse({
          title: 'Task',
          priority,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid priority', () => {
      const result = createTaskSchema.safeParse({
        title: 'Task',
        priority: 'invalid',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        // Zodのenumは無効な値に対してデフォルトエラーメッセージを返す
        expect(result.error.issues[0].message).toContain('Invalid');
      }
    });
  });
});

describe('updateTaskSchema', () => {
  it('should accept partial updates', () => {
    const result = updateTaskSchema.safeParse({
      title: 'Updated Title',
    });
    expect(result.success).toBe(true);
  });

  it('should accept empty object', () => {
    const result = updateTaskSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should still validate provided fields', () => {
    const result = updateTaskSchema.safeParse({
      title: '',
    });
    expect(result.success).toBe(false);
  });
});
