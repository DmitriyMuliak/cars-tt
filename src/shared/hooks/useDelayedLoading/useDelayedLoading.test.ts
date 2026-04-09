import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDelayedLoading } from './useDelayedLoading';

describe('useDelayedLoading', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns false immediately when isLoading becomes true', () => {
    const { result } = renderHook(() => useDelayedLoading(true));
    expect(result.current).toBe(false);
  });

  it('returns true after the default delay (250ms)', () => {
    const { result } = renderHook(() => useDelayedLoading(true));

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(result.current).toBe(true);
  });

  it('returns false before the delay has elapsed', () => {
    const { result } = renderHook(() => useDelayedLoading(true));

    act(() => {
      vi.advanceTimersByTime(249);
    });

    expect(result.current).toBe(false);
  });

  it('respects a custom delay', () => {
    const { result } = renderHook(() => useDelayedLoading(true, 500));

    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe(true);
  });

  it('returns false when isLoading is false', () => {
    const { result } = renderHook(() => useDelayedLoading(false));

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe(false);
  });

  it('resets to false immediately when isLoading switches to false before delay', () => {
    const { rerender, result } = renderHook(({ loading }) => useDelayedLoading(loading), {
      initialProps: { loading: true },
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe(false);

    rerender({ loading: false });
    expect(result.current).toBe(false);
  });

  it('resets to false immediately when isLoading switches to false after delay', () => {
    const { rerender, result } = renderHook(({ loading }) => useDelayedLoading(loading), {
      initialProps: { loading: true },
    });

    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current).toBe(true);

    rerender({ loading: false });
    expect(result.current).toBe(false);
  });

  it('restarts the delay timer when isLoading toggles back to true', () => {
    const { rerender, result } = renderHook(({ loading }) => useDelayedLoading(loading), {
      initialProps: { loading: true },
    });

    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current).toBe(true);

    rerender({ loading: false });
    expect(result.current).toBe(false);

    rerender({ loading: true });
    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current).toBe(true);
  });
});
