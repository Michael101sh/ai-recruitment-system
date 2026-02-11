import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGenerateFlow } from './useGenerateFlow';
import type { BatchGenerationResult } from '../../types';

describe('useGenerateFlow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('initializes with correct default state', () => {
    const mockGenerate = vi.fn();
    const { result } = renderHook(() => useGenerateFlow(3, mockGenerate));

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.result).toBeNull();
    expect(result.current.stepIndex).toBe(0);
    expect(result.current.stepMessage).toBeTruthy();
  });

  it('sets isGenerating to true when generation starts', async () => {
    const mockGenerate = vi.fn().mockResolvedValue({
      generated: 3,
      candidates: [],
    });

    const { result } = renderHook(() => useGenerateFlow(3, mockGenerate));

    act(() => {
      result.current.handleGenerate();
    });

    expect(result.current.isGenerating).toBe(true);
  });

  it('cycles through step messages every 3 seconds', async () => {
    let resolveGenerate: () => void;
    const mockGenerate = vi.fn().mockImplementation(
      () => new Promise<BatchGenerationResult>((resolve) => { 
        resolveGenerate = () => resolve({ generated: 1, candidates: [] }); 
      })
    );

    const { result } = renderHook(() => useGenerateFlow(3, mockGenerate));

    const initialMessage = result.current.stepMessage;

    act(() => {
      result.current.handleGenerate();
    });

    // Advance time by 3 seconds and check message changed
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.stepMessage).not.toBe(initialMessage);

    // Resolve the promise and clean up
    await act(async () => {
      resolveGenerate!();
      await vi.runAllTimersAsync();
    });
  });

  it('sets result and clears loading state on success', async () => {
    const mockResult: BatchGenerationResult = {
      generated: 2,
      candidates: [
        { candidateId: '1', name: 'Alice Smith', cvId: 'cv1' },
        { candidateId: '2', name: 'Bob Johnson', cvId: 'cv2' },
      ],
    };

    const mockGenerate = vi.fn().mockResolvedValue(mockResult);
    const { result } = renderHook(() => useGenerateFlow(2, mockGenerate));

    await act(async () => {
      await result.current.handleGenerate();
    });

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.result).toEqual(mockResult);
  });

  it('clears loading state even on error', async () => {
    const mockGenerate = vi.fn().mockRejectedValue(new Error('API error'));
    const { result } = renderHook(() => useGenerateFlow(3, mockGenerate));

    await act(async () => {
      await result.current.handleGenerate().catch(() => {
        // Expected error - swallow it
      });
    });

    expect(result.current.isGenerating).toBe(false);
  });

  it('calls onGenerate with correct count', async () => {
    const mockGenerate = vi.fn().mockResolvedValue({ generated: 5, candidates: [] });
    const { result } = renderHook(() => useGenerateFlow(5, mockGenerate));

    await act(async () => {
      await result.current.handleGenerate();
    });

    expect(mockGenerate).toHaveBeenCalledWith(5);
  });

  it('clears previous result when starting new generation', async () => {
    const mockGenerate = vi.fn()
      .mockResolvedValueOnce({ generated: 1, candidates: [] })
      .mockResolvedValueOnce({ generated: 2, candidates: [] });

    const { result } = renderHook(() => useGenerateFlow(1, mockGenerate));

    await act(async () => {
      await result.current.handleGenerate();
    });

    expect(result.current.result?.generated).toBe(1);

    await act(async () => {
      await result.current.handleGenerate();
    });

    expect(result.current.result?.generated).toBe(2);
  });
});
