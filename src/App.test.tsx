import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { historyItemLabels } from '@/features/citySearch/components/HistoryItem/HistoryItem.labels';
import { useWeatherStore } from '@/features/citySearch/store/citySearchStore';
import { useToastStore } from '@/shared/store/toastStore';
import { mockLondonResponse, WEATHER_API_URL } from '@/test/consts';
import { server } from '@/test/msw/server';
import { render } from '@/test/render';

import { App } from './App';

function resetStores() {
  useWeatherStore.setState({ history: [], lastRemovedItems: [], activeCity: '' });
  useToastStore.setState({ toasts: [] });
}

describe('App', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_OPENWEATHER_API_KEY', 'test-key');
    resetStores();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('Initial render', () => {
    it('renders the app header and search bar on initial load', () => {
      render(App);

      expect(screen.getByRole('heading', { name: /weather forecast/i })).toBeInTheDocument();
      expect(screen.getByRole('searchbox', { name: /city name/i })).toBeInTheDocument();
      expect(screen.getByText(/search for a city/i)).toBeInTheDocument();
    });

    it('does not render search history when history is empty', () => {
      render(App);

      expect(screen.queryByRole('region', { name: /search history/i })).not.toBeInTheDocument();
    });
  });

  describe('Search flow', () => {
    it('displays weather data after a successful search', async () => {
      server.use(http.get(WEATHER_API_URL, () => HttpResponse.json(mockLondonResponse)));

      render(App);

      await userEvent.type(screen.getByRole('searchbox'), 'London');
      await userEvent.click(screen.getByRole('button', { name: /search/i }));

      const card = await screen.findByTestId('weather-card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveTextContent('London');
      expect(card).toHaveTextContent('15°C');
    });

    it('adds the searched city to history after a successful search', async () => {
      server.use(http.get(WEATHER_API_URL, () => HttpResponse.json(mockLondonResponse)));

      render(App);

      await userEvent.type(screen.getByRole('searchbox'), 'London');
      await userEvent.click(screen.getByRole('button', { name: /search/i }));

      await waitFor(() => {
        expect(useWeatherStore.getState().history.some((h) => h.city === 'London')).toBe(true);
      });
    });

    it('shows an error message when the city is not found (404)', async () => {
      server.use(http.get(WEATHER_API_URL, () => new HttpResponse(null, { status: 404 })));

      render(App);

      await userEvent.type(screen.getByRole('searchbox'), 'UnknownCity');
      await userEvent.click(screen.getByRole('button', { name: /search/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
      expect(screen.getByRole('alert')).toHaveTextContent(/not found/i);
    });
  });

  describe('History interaction', () => {
    it('fetches weather when clicking a history item', async () => {
      server.use(http.get(WEATHER_API_URL, () => HttpResponse.json(mockLondonResponse)));

      useWeatherStore.setState({
        history: [{ city: 'London', searchedAt: Date.now() }],
        lastRemovedItems: [],
        activeCity: '',
      });

      render(App);

      await userEvent.click(
        screen.getByRole('button', { name: historyItemLabels.searchCity('London') }),
      );

      await waitFor(() => {
        expect(useWeatherStore.getState().activeCity).toBe('London');
      });
    });
  });

  describe('Undo flow', () => {
    it('shows an undo toast after removing a history item', async () => {
      useWeatherStore.setState({
        history: [{ city: 'London', searchedAt: Date.now() }],
        lastRemovedItems: [],
        activeCity: '',
      });

      render(App);

      await userEvent.click(
        screen.getByRole('button', { name: historyItemLabels.removeCity('London') }),
      );

      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument();
      });
      expect(screen.getByText(/"London" removed/)).toBeInTheDocument();
    });

    it('restores history when Undo is clicked in the toast', async () => {
      useWeatherStore.setState({
        history: [{ city: 'London', searchedAt: Date.now() }],
        lastRemovedItems: [],
        activeCity: '',
      });

      render(App);

      await userEvent.click(
        screen.getByRole('button', { name: historyItemLabels.removeCity('London') }),
      );
      await userEvent.click(await screen.findByRole('button', { name: /undo removal/i }));

      expect(useWeatherStore.getState().history.some((h) => h.city === 'London')).toBe(true);
    });

    it('shows undo toast after clearing all history', async () => {
      useWeatherStore.setState({
        history: [
          { city: 'London', searchedAt: Date.now() },
          { city: 'Paris', searchedAt: Date.now() - 1000 },
        ],
        lastRemovedItems: [],
        activeCity: '',
      });

      render(App);

      await userEvent.click(screen.getByRole('button', { name: /clear all/i }));

      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument();
      });
      expect(screen.getByText(/2 cities removed/)).toBeInTheDocument();
    });
  });
});
