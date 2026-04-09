import { getEnvVars } from '@/shared/config/env';
import type { WeatherApiResponse, WeatherData } from '@/shared/types/weather';

const BASE_URL = 'https://api.openweathermap.org/data/2.5';

function mapToWeatherData(raw: WeatherApiResponse): WeatherData {
  return {
    city: raw.name,
    country: raw.sys.country,
    temperature: Math.round(raw.main.temp),
    feelsLike: Math.round(raw.main.feels_like),
    tempMin: Math.round(raw.main.temp_min),
    tempMax: Math.round(raw.main.temp_max),
    humidity: raw.main.humidity,
    description: raw.weather[0]?.description ?? '',
    iconCode: raw.weather[0]?.icon ?? '',
    windSpeed: raw.wind.speed,
  };
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function fetchWeather(city: string): Promise<WeatherData> {
  const trimmed = city.trim();
  if (!trimmed) {
    throw new ApiError('City name cannot be empty.');
  }

  const url = new URL(`${BASE_URL}/weather`);
  url.searchParams.set('q', trimmed);
  url.searchParams.set('appid', getEnvVars().VITE_OPENWEATHER_API_KEY);
  url.searchParams.set('units', 'metric');

  const response = await fetch(url.toString());

  if (!response.ok) {
    if (response.status === 404) {
      throw new ApiError(`City "${trimmed}" not found. Please check the spelling.`, 404);
    }
    if (response.status === 401) {
      throw new ApiError('Invalid API key. Please check your configuration.', 401);
    }
    throw new ApiError(
      `Unexpected error fetching weather data (HTTP ${response.status}).`,
      response.status,
    );
  }

  const data: WeatherApiResponse = await response.json();
  return mapToWeatherData(data);
}

export function getWeatherIconUrl(iconCode: string, size: '1x' | '2x' | '4x' = '2x'): string {
  return `https://openweathermap.org/img/wn/${iconCode}@${size}.png`;
}
