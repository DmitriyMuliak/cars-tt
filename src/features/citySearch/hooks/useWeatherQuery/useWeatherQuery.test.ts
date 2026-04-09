import { waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { WEATHER_API_URL } from '@/test/consts';
import { server } from '@/test/msw/server';
import { renderHook } from '@/test/render';

import { useWeatherQuery, WEATHER_QUERY_KEY } from './useWeatherQuery';

const berlinResponse = {
  name: 'Berlin',
  sys: { country: 'DE' },
  main: { temp: 20, feels_like: 18, temp_min: 15, temp_max: 24, humidity: 60 },
  weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
  wind: { speed: 3.1 },
  cod: 200,
};

const parisResponse = {
  name: 'Paris',
  sys: { country: 'FR' },
  main: { temp: 22, feels_like: 20, temp_min: 18, temp_max: 25, humidity: 55 },
  weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
  wind: { speed: 2.5 },
  cod: 200,
};

describe('WEATHER_QUERY_KEY', () => {
  it('normalises city to lowercase', () => {
    expect(WEATHER_QUERY_KEY('London')).toEqual(['weather', 'weather_london']);
  });

  it('trims whitespace', () => {
    expect(WEATHER_QUERY_KEY('  Berlin  ')).toEqual(['weather', 'weather_berlin']);
  });
});

describe('useWeatherQuery', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_OPENWEATHER_API_KEY', 'test-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('is idle and does not fetch when city is empty string', () => {
    const { result } = renderHook(() => useWeatherQuery(''));

    expect(result.current.fetchStatus).toBe('idle');
  });

  it('is idle and does not fetch when city is whitespace-only', () => {
    const { result } = renderHook(() => useWeatherQuery('   '));

    expect(result.current.fetchStatus).toBe('idle');
  });

  it('fetches and returns mapped data for a non-empty city', async () => {
    server.use(http.get(WEATHER_API_URL, () => HttpResponse.json(berlinResponse)));

    const { result } = renderHook(() => useWeatherQuery('Berlin'));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.city).toBe('Berlin');
    expect(result.current.data?.country).toBe('DE');
  });

  it('calls onFetched with mapped data after a successful fetch', async () => {
    server.use(http.get(WEATHER_API_URL, () => HttpResponse.json(parisResponse)));

    const onFetched = vi.fn();
    const { result } = renderHook(() => useWeatherQuery('Paris', onFetched));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(onFetched).toHaveBeenCalledOnce();
    expect(onFetched).toHaveBeenCalledWith(expect.objectContaining({ city: 'Paris' }));
  });

  it('does not call onFetched when the fetch fails', async () => {
    server.use(http.get(WEATHER_API_URL, () => new HttpResponse(null, { status: 404 })));

    const onFetched = vi.fn();
    const { result } = renderHook(() => useWeatherQuery('nowhere', onFetched));

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 3000 });
    expect(onFetched).not.toHaveBeenCalled();
  });

  it('surfaces an error when the city is not found', async () => {
    server.use(http.get(WEATHER_API_URL, () => new HttpResponse(null, { status: 404 })));

    const { result } = renderHook(() => useWeatherQuery('zzz'));

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 3000 });
    expect(result.current.error?.message).toMatch(/not found/i);
  });

  it.each([404, 401])('does not retry on %i — request is made exactly once', async (status) => {
    let requestCount = 0;
    server.use(
      http.get(WEATHER_API_URL, () => {
        requestCount++;
        return new HttpResponse(null, { status });
      }),
    );

    const { result } = renderHook(() => useWeatherQuery('London'));

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 3000 });
    expect(requestCount).toBe(1);
  });

  it('retries up to 2 times on transient errors (5xx)', async () => {
    let requestCount = 0;
    server.use(
      http.get(WEATHER_API_URL, () => {
        requestCount++;
        return new HttpResponse(null, { status: 500 });
      }),
    );

    const { result } = renderHook(() => useWeatherQuery('London'));

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 5000 });
    expect(requestCount).toBe(3);
  });
});
