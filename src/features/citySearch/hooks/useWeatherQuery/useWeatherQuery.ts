import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { ApiError, fetchWeather } from '@/shared/api/weather';
import type { WeatherData } from '@/shared/types/weather';
import { getMinutesInMilliseconds } from '@/shared/utils/time';

export const WEATHER_QUERY_KEY = (city: string) =>
  ['weather', `weather_${city.toLowerCase().trim()}`] as const;

const NO_RETRY_CODES = new Set([401, 404]);

export function useWeatherQuery(city: string, onFetched?: (data: WeatherData) => void) {
  return useQuery<WeatherData, Error>({
    queryKey: WEATHER_QUERY_KEY(city),
    queryFn: async () => {
      const data = await fetchWeather(city);
      onFetched?.(data);
      return data;
    },
    placeholderData: keepPreviousData,
    enabled: city.trim().length > 0,
    staleTime: 0,
    gcTime: getMinutesInMilliseconds(5),
    retry: (failureCount, error) => {
      if (error instanceof ApiError && NO_RETRY_CODES.has(error.statusCode ?? -1)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}
