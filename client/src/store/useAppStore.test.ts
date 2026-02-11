import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAppStore } from './useAppStore';

describe('useAppStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useAppStore());
    act(() => {
      result.current.setActiveTab('generate');
      result.current.setError(null);
      result.current.setSuccess(null);
    });
  });

  describe('activeTab', () => {
    it('initializes with generate tab', () => {
      const { result } = renderHook(() => useAppStore());
      expect(result.current.activeTab).toBe('generate');
    });

    it('updates active tab', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setActiveTab('candidates');
      });

      expect(result.current.activeTab).toBe('candidates');
    });

    it('clears notifications when switching tabs by default', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setError('Test error');
        result.current.setSuccess('Test success');
      });

      expect(result.current.error).toBe('Test error');
      expect(result.current.success).toBe('Test success');

      act(() => {
        result.current.setActiveTab('rankings');
      });

      expect(result.current.error).toBeNull();
      expect(result.current.success).toBeNull();
    });

    it('preserves notifications when clearNotifications is false', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setError('Test error');
        result.current.setSuccess('Test success');
      });

      act(() => {
        result.current.setActiveTab('rankings', { clearNotifications: false });
      });

      expect(result.current.error).toBe('Test error');
      expect(result.current.success).toBe('Test success');
    });
  });

  describe('error', () => {
    it('sets error message', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setError('Something went wrong');
      });

      expect(result.current.error).toBe('Something went wrong');
    });

    it('clears error when set to null', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setError('Error');
        result.current.setError(null);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('success', () => {
    it('sets success message', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setSuccess('Operation completed');
      });

      expect(result.current.success).toBe('Operation completed');
    });

    it('clears success when set to null', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setSuccess('Success');
        result.current.setSuccess(null);
      });

      expect(result.current.success).toBeNull();
    });
  });
});
