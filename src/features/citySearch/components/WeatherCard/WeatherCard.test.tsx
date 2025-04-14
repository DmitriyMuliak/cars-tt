import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useWeatherStore } from '@/features/citySearch/store/citySearchStore';
import { mockLondonResponse, WEATHER_API_URL } from '@/test/consts';
import { server } from '@/test/msw/server';
import { render } from '@/test/render';

import { WeatherCard } from './WeatherCard';

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('WeatherCard', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_OPENWEATHER_API_KEY', 'test-key');
    useWeatherStore.setState({ activeCity: 'London', history: [], lastRemovedItems: [] });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders error message on 404', async () => {
    server.use(http.get(WEATHER_API_URL, () => new HttpResponse(null, { status: 404 })));
    render(WeatherCard);
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('alert')).toHaveTextContent(/not found/i);
  });

  it('renders generic error message on network failure', async () => {
    server.use(http.get(WEATHER_API_URL, () => HttpResponse.error()));
    render(WeatherCard);
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('alert')).toHaveTextContent(/unexpected error/i);
  });

  it('renders empty state when activeCity is empty', () => {
    useWeatherStore.setState({ activeCity: '', history: [], lastRemovedItems: [] });
    render(WeatherCard);
    expect(screen.getByText(/search for a city/i)).toBeInTheDocument();
  });

  it('renders city name and country', async () => {
    server.use(http.get(WEATHER_API_URL, () => HttpResponse.json(mockLondonResponse)));
    render(WeatherCard);
    await waitFor(() => expect(screen.getByText('London')).toBeInTheDocument());
    expect(screen.getByText(/, GB/i)).toBeInTheDocument();
  });

  it('renders current temperature', async () => {
    server.use(http.get(WEATHER_API_URL, () => HttpResponse.json(mockLondonResponse)));
    render(WeatherCard);
    await waitFor(() => expect(screen.getByText('15°C')).toBeInTheDocument());
  });

  it('renders feels-like temperature', async () => {
    server.use(http.get(WEATHER_API_URL, () => HttpResponse.json(mockLondonResponse)));
    render(WeatherCard);
    await waitFor(() => expect(screen.getByText(/feels like 13°c/i)).toBeInTheDocument());
  });

  it('renders weather description', async () => {
    server.use(http.get(WEATHER_API_URL, () => HttpResponse.json(mockLondonResponse)));
    render(WeatherCard);
    await waitFor(() => expect(screen.getByText('clear sky')).toBeInTheDocument());
  });

  it('renders min/max temperatures', async () => {
    server.use(http.get(WEATHER_API_URL, () => HttpResponse.json(mockLondonResponse)));
    render(WeatherCard);
    await waitFor(() => expect(screen.getByText(/10° \/ 18°C/)).toBeInTheDocument());
  });

  it('renders wind speed', async () => {
    server.use(http.get(WEATHER_API_URL, () => HttpResponse.json(mockLondonResponse)));
    render(WeatherCard);
    await waitFor(() => expect(screen.getByText('3.5 m/s')).toBeInTheDocument());
  });

  it('renders humidity', async () => {
    server.use(http.get(WEATHER_API_URL, () => HttpResponse.json(mockLondonResponse)));
    render(WeatherCard);
    await waitFor(() => expect(screen.getByText('72%')).toBeInTheDocument());
  });

  it('renders weather icon with alt text', async () => {
    server.use(http.get(WEATHER_API_URL, () => HttpResponse.json(mockLondonResponse)));
    render(WeatherCard);
    const icon = await screen.findByAltText('clear sky');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('src', expect.stringContaining('01d'));
  });
});
