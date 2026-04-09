import { beforeEach, describe, expect, it } from 'vitest';

import { useWeatherStore } from './citySearchStore';

function resetStore() {
  useWeatherStore.setState({
    history: [],
    lastRemovedItems: [],
    activeCity: '',
  });
}

describe('weatherStore', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('addToHistory', () => {
    it('adds a city to history', () => {
      useWeatherStore.getState().addToHistory('London');
      expect(useWeatherStore.getState().history).toHaveLength(1);
      expect(useWeatherStore.getState().history[0]?.city).toBe('London');
    });

    it('trims whitespace before adding', () => {
      useWeatherStore.getState().addToHistory('  Paris  ');
      expect(useWeatherStore.getState().history[0]?.city).toBe('Paris');
    });

    it('does not add an empty city', () => {
      useWeatherStore.getState().addToHistory('   ');
      expect(useWeatherStore.getState().history).toHaveLength(0);
    });

    it('deduplicates case-insensitively and keeps original position', () => {
      useWeatherStore.getState().addToHistory('London');
      useWeatherStore.getState().addToHistory('Paris');
      useWeatherStore.getState().addToHistory('london'); // duplicate — ignored

      const { history } = useWeatherStore.getState();
      expect(history).toHaveLength(2);
      expect(history[0]?.city).toBe('Paris'); // Paris still on top (most recently added)
      expect(history[1]?.city).toBe('London'); // London stays in place
    });

    it('caps history at 40 entries', () => {
      for (let i = 1; i <= 42; i++) {
        useWeatherStore.getState().addToHistory(`City${i}`);
      }
      expect(useWeatherStore.getState().history).toHaveLength(40);
      // Most recently added is first
      expect(useWeatherStore.getState().history[0]?.city).toBe('City42');
    });

    it('sets searchedAt timestamp', () => {
      const before = Date.now();
      useWeatherStore.getState().addToHistory('Tokyo');
      const after = Date.now();
      const ts = useWeatherStore.getState().history[0]?.searchedAt ?? 0;
      expect(ts).toBeGreaterThanOrEqual(before);
      expect(ts).toBeLessThanOrEqual(after);
    });
  });

  describe('removeFromHistory', () => {
    it('removes the correct city', () => {
      useWeatherStore.getState().addToHistory('London');
      useWeatherStore.getState().addToHistory('Paris');
      useWeatherStore.getState().removeFromHistory('London');

      const { history } = useWeatherStore.getState();
      expect(history).toHaveLength(1);
      expect(history[0]?.city).toBe('Paris');
    });

    it('stores removed item in lastRemovedItems', () => {
      useWeatherStore.getState().addToHistory('London');
      useWeatherStore.getState().removeFromHistory('London');

      const { lastRemovedItems } = useWeatherStore.getState();
      expect(lastRemovedItems).toHaveLength(1);
      expect(lastRemovedItems[0]?.city).toBe('London');
    });

    it('removes case-insensitively', () => {
      useWeatherStore.getState().addToHistory('London');
      useWeatherStore.getState().removeFromHistory('LONDON');
      expect(useWeatherStore.getState().history).toHaveLength(0);
    });
  });

  describe('clearHistory', () => {
    it('clears all history', () => {
      useWeatherStore.getState().addToHistory('London');
      useWeatherStore.getState().addToHistory('Paris');
      useWeatherStore.getState().clearHistory();
      expect(useWeatherStore.getState().history).toHaveLength(0);
    });

    it('stores all removed items for undo', () => {
      useWeatherStore.getState().addToHistory('London');
      useWeatherStore.getState().addToHistory('Paris');
      useWeatherStore.getState().clearHistory();

      expect(useWeatherStore.getState().lastRemovedItems).toHaveLength(2);
    });
  });

  describe('undoRemove', () => {
    it('restores a single removed item', () => {
      useWeatherStore.getState().addToHistory('London');
      useWeatherStore.getState().addToHistory('Paris');
      useWeatherStore.getState().removeFromHistory('London');
      useWeatherStore.getState().undoRemove();

      const { history } = useWeatherStore.getState();
      expect(history.some((h) => h.city === 'London')).toBe(true);
    });

    it('clears lastRemovedItems after undo', () => {
      useWeatherStore.getState().addToHistory('London');
      useWeatherStore.getState().removeFromHistory('London');
      useWeatherStore.getState().undoRemove();

      expect(useWeatherStore.getState().lastRemovedItems).toHaveLength(0);
    });

    it('restores multiple items after clearHistory', () => {
      useWeatherStore.getState().addToHistory('London');
      useWeatherStore.getState().addToHistory('Paris');
      useWeatherStore.getState().addToHistory('Tokyo');
      useWeatherStore.getState().clearHistory();
      useWeatherStore.getState().undoRemove();

      expect(useWeatherStore.getState().history).toHaveLength(3);
    });

    it('does nothing if there are no removed items', () => {
      useWeatherStore.getState().addToHistory('London');
      useWeatherStore.getState().undoRemove();
      expect(useWeatherStore.getState().history).toHaveLength(1);
    });
  });

  describe('setActiveCity', () => {
    it('sets the active city', () => {
      useWeatherStore.getState().setActiveCity('Berlin');
      expect(useWeatherStore.getState().activeCity).toBe('Berlin');
    });
  });
});
