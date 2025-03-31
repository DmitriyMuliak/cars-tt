import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { CityHistory, WeatherStore } from '@/shared/types/weather';

const MAX_HISTORY = 40;

export const useWeatherStore = create<WeatherStore>()(
  devtools(
    persist(
      (set) => ({
        history: [],
        lastRemovedItems: [],
        activeCity: '',

        addToHistory: (city: string) => {
          const normalized = city.trim();
          if (!normalized) return;

          set(
            (state) => {
              const alreadyExists = state.history.some(
                (h) => h.city.toLowerCase() === normalized.toLowerCase(),
              );
              if (alreadyExists) return state;

              const updated: CityHistory[] = [
                { city: normalized, searchedAt: Date.now() },
                ...state.history,
              ].slice(0, MAX_HISTORY);

              return { history: updated };
            },
            false,
            'addToHistory',
          );
        },

        removeFromHistory: (city: string) => {
          set(
            (state) => {
              const removed = state.history.filter(
                (h) => h.city.toLowerCase() === city.toLowerCase(),
              );
              const remaining = state.history.filter(
                (h) => h.city.toLowerCase() !== city.toLowerCase(),
              );
              return { history: remaining, lastRemovedItems: removed };
            },
            false,
            'removeFromHistory',
          );
        },

        clearHistory: () => {
          set((state) => ({ history: [], lastRemovedItems: state.history }), false, 'clearHistory');
        },

        undoRemove: () => {
          set(
            (state) => {
              if (state.lastRemovedItems.length === 0) return state;

              const merged = [...state.lastRemovedItems, ...state.history].slice(0, MAX_HISTORY);

              return { history: merged, lastRemovedItems: [] };
            },
            false,
            'undoRemove',
          );
        },

        clearLastRemovedItems: () => {
          set({ lastRemovedItems: [] }, false, 'clearLastRemovedItems');
        },

        setActiveCity: (city: string) => {
          set({ activeCity: city }, false, 'setActiveCity');
        },
      }),
      {
        name: 'weather-history',
        partialize: (state) => ({ history: state.history }),
      },
    ),
    { name: 'WeatherStore' },
  ),
);
