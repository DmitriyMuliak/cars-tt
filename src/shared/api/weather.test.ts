import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { WeatherApiResponse } from '@/shared/types/weather';
import { WEATHER_API_URL } from '@/test/consts';
import { server } from '@/test/msw/server';

import { ApiError, fetchWeather, getWeatherIconUrl } from './weather';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockRawResponse: WeatherApiResponse = {
  name: 'London',
  sys: { country: 'GB' },
  main: { temp: 15.6, feels_like: 13.2, temp_min: 10.1, temp_max: 18.9, humidity: 72 },
  weather: [{ id: 500, main: 'Rain', description: 'light rain', icon: '10d' }],
  wind: { speed: 5.2 },
  cod: 200,
};

// ─── fetchWeather ─────────────────────────────────────────────────────────────

describe('fetchWeather', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_OPENWEATHER_API_KEY', 'test-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('success', () => {
    it('returns mapped WeatherData on 200', async () => {
      server.use(http.get(WEATHER_API_URL, () => HttpResponse.json(mockRawResponse)));

      const result = await fetchWeather('London');

      expect(result).toEqual({
        city: 'London',
        country: 'GB',
        temperature: 16,
        feelsLike: 13,
        tempMin: 10,
        tempMax: 19,
        humidity: 72,
        description: 'light rain',
        iconCode: '10d',
        windSpeed: 5.2,
      });
    });

    it('rounds fractional temperatures', async () => {
      server.use(
        http.get(WEATHER_API_URL, () =>
          HttpResponse.json({
            ...mockRawResponse,
            main: {
              ...mockRawResponse.main,
              temp: 15.4,
              feels_like: 13.5,
              temp_min: 10.4,
              temp_max: 18.5,
            },
          }),
        ),
      );

      const result = await fetchWeather('London');

      expect(result.temperature).toBe(15);
      expect(result.feelsLike).toBe(14);
      expect(result.tempMin).toBe(10);
      expect(result.tempMax).toBe(19);
    });

    it('trims city name before fetching', async () => {
      let capturedUrl = '';
      server.use(
        http.get(WEATHER_API_URL, ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json(mockRawResponse);
        }),
      );

      await fetchWeather('  London  ');

      expect(new URL(capturedUrl).searchParams.get('q')).toBe('London');
    });

    it('includes units=metric in the request', async () => {
      let capturedUrl = '';
      server.use(
        http.get(WEATHER_API_URL, ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json(mockRawResponse);
        }),
      );

      await fetchWeather('London');

      expect(new URL(capturedUrl).searchParams.get('units')).toBe('metric');
    });

    it('includes the API key in the request', async () => {
      let capturedUrl = '';
      server.use(
        http.get(WEATHER_API_URL, ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json(mockRawResponse);
        }),
      );

      await fetchWeather('London');

      expect(new URL(capturedUrl).searchParams.get('appid')).toBe('test-key');
    });
  });

  describe('error handling', () => {
    it('throws ApiError with statusCode 404 for unknown city', async () => {
      server.use(http.get(WEATHER_API_URL, () => new HttpResponse(null, { status: 404 })));

      const error = await fetchWeather('zzz_not_a_city').catch((e: unknown) => e);

      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).statusCode).toBe(404);
      expect((error as ApiError).message).toMatch(/not found/i);
    });

    it('throws ApiError with statusCode 401 for invalid key', async () => {
      server.use(http.get(WEATHER_API_URL, () => new HttpResponse(null, { status: 401 })));

      const error = await fetchWeather('London').catch((e: unknown) => e);

      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).statusCode).toBe(401);
      expect((error as ApiError).message).toMatch(/invalid api key/i);
    });

    it('throws ApiError for other HTTP errors', async () => {
      server.use(http.get(WEATHER_API_URL, () => new HttpResponse(null, { status: 500 })));

      const error = await fetchWeather('London').catch((e: unknown) => e);

      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).statusCode).toBe(500);
      expect((error as ApiError).message).toMatch(/HTTP 500/);
    });

    it('throws ApiError immediately for empty city — never calls fetch', async () => {
      let requestCount = 0;
      server.use(
        http.get(WEATHER_API_URL, () => {
          requestCount++;
          return HttpResponse.json(mockRawResponse);
        }),
      );

      await expect(fetchWeather('')).rejects.toBeInstanceOf(ApiError);
      await expect(fetchWeather('   ')).rejects.toBeInstanceOf(ApiError);
      expect(requestCount).toBe(0);
    });

    it('ApiError is an instance of Error with correct name', async () => {
      server.use(http.get(WEATHER_API_URL, () => new HttpResponse(null, { status: 404 })));

      const error = await fetchWeather('xyz').catch((e: unknown) => e);

      expect(error).toBeInstanceOf(Error);
      expect((error as Error).name).toBe('ApiError');
    });

    it('throws when API key is empty', async () => {
      vi.stubEnv('VITE_OPENWEATHER_API_KEY', '');

      await expect(fetchWeather('London')).rejects.toThrow(/VITE_OPENWEATHER_API_KEY/);
    });
  });
});

// ─── getWeatherIconUrl ────────────────────────────────────────────────────────

describe('getWeatherIconUrl', () => {
  it('returns 2x URL by default', () => {
    expect(getWeatherIconUrl('10d')).toBe('https://openweathermap.org/img/wn/10d@2x.png');
  });

  it('returns 1x URL when requested', () => {
    expect(getWeatherIconUrl('01d', '1x')).toBe('https://openweathermap.org/img/wn/01d@1x.png');
  });

  it('returns 4x URL when requested', () => {
    expect(getWeatherIconUrl('13n', '4x')).toBe('https://openweathermap.org/img/wn/13n@4x.png');
  });
});
