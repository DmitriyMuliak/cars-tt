import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { useWeatherStore } from '@/features/citySearch/store/citySearchStore';
import { Toaster } from '@/shared/components/Toaster/Toaster';
import { useToastStore } from '@/shared/store/toastStore';
import { renderHook } from '@/test/render';
import { render } from '@/test/render';

import { useHistoryActions } from './useHistoryActions';

function resetStores(cities: string[] = []) {
  const history = cities.map((city, i) => ({ city, searchedAt: Date.now() - i * 1000 }));
  useWeatherStore.setState({ history, lastRemovedItems: [], activeCity: '' });
  useToastStore.setState({ toasts: [] });
}

describe('useHistoryActions', () => {
  beforeEach(() => resetStores());

  describe('removeCity', () => {
    it('removes the city from weather store', () => {
      resetStores(['London', 'Paris']);
      const { result } = renderHook(() => useHistoryActions());

      act(() => {
        result.current.removeCity('London');
      });

      expect(useWeatherStore.getState().history.some((h) => h.city === 'London')).toBe(false);
      expect(useWeatherStore.getState().history.some((h) => h.city === 'Paris')).toBe(true);
    });

    it('adds a toast with the city name', () => {
      resetStores(['London']);
      const { result } = renderHook(() => useHistoryActions());

      act(() => {
        result.current.removeCity('London');
      });

      const toasts = useToastStore.getState().toasts;
      expect(toasts).toHaveLength(1);
      expect(toasts[0]?.message).toBe('"London" removed');
    });

    it('deduplicates rapid removals — second toast replaces first', () => {
      resetStores(['London', 'Paris', 'Tokyo']);
      const { result } = renderHook(() => useHistoryActions());

      act(() => {
        result.current.removeCity('London');
        result.current.removeCity('Paris');
      });

      const toasts = useToastStore.getState().toasts;
      expect(toasts).toHaveLength(1);
      expect(toasts[0]?.message).toBe('"Paris" removed');
    });
  });

  describe('clearAll', () => {
    it('clears all cities from weather store', () => {
      resetStores(['London', 'Paris', 'Tokyo']);
      const { result } = renderHook(() => useHistoryActions());

      act(() => {
        result.current.clearAll(3);
      });

      expect(useWeatherStore.getState().history).toHaveLength(0);
    });

    it('uses singular label for one city', () => {
      resetStores(['London']);
      const { result } = renderHook(() => useHistoryActions());

      act(() => {
        result.current.clearAll(1);
      });

      expect(useToastStore.getState().toasts[0]?.message).toBe('1 city removed');
    });

    it('uses plural label for multiple cities', () => {
      resetStores(['London', 'Paris']);
      const { result } = renderHook(() => useHistoryActions());

      act(() => {
        result.current.clearAll(2);
      });

      expect(useToastStore.getState().toasts[0]?.message).toBe('2 cities removed');
    });
  });
});

describe('UndoContent — undo action rendered in Toaster', () => {
  beforeEach(() => resetStores());

  it('restores history when Undo is clicked', async () => {
    resetStores(['London', 'Paris']);
    const { result } = renderHook(() => useHistoryActions());

    act(() => {
      result.current.removeCity('London');
    });

    render(Toaster);

    await userEvent.click(screen.getByRole('button', { name: 'Undo removal' }));

    expect(useWeatherStore.getState().history.some((h) => h.city === 'London')).toBe(true);
  });

  it('dismisses the toast when × button is clicked', async () => {
    resetStores(['London']);
    const { result } = renderHook(() => useHistoryActions());

    act(() => {
      result.current.removeCity('London');
    });

    render(Toaster);
    expect(screen.getByRole('status')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }));

    expect(useToastStore.getState().toasts).toHaveLength(0);
  });
});
