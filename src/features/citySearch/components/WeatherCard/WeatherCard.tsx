import { useWeatherStore } from '@/features/citySearch/store/citySearchStore';
import { ApiError } from '@/shared/api/weather';

import { useWeatherQuery } from '../../hooks/useWeatherQuery/useWeatherQuery';
import { WeatherCardData } from './WeatherCardData';
import { WeatherCardEmpty } from './WeatherCardEmpty';
import { WeatherCardError } from './WeatherCardError';
export function WeatherCard() {
  const activeCity = useWeatherStore((s) => s.activeCity);
  const addToHistory = useWeatherStore((s) => s.addToHistory);

  const { data, isError, error } = useWeatherQuery(activeCity, (result) => {
    addToHistory(result.city);
  });

  const errorMessage =
    error instanceof ApiError
      ? error.message
      : error
        ? 'An unexpected error occurred. Please try again.'
        : undefined;

  if (isError) return <WeatherCardError message={errorMessage} />;
  if (!data) return <WeatherCardEmpty />;
  return <WeatherCardData data={data} />;
}
