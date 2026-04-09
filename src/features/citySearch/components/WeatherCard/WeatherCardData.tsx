import { getWeatherIconUrl } from '@/shared/api/weather';
import type { WeatherData } from '@/shared/types/weather';

import { WeatherDetails } from './WeatherDetails';

interface WeatherCardDataProps {
  data: WeatherData;
}

export function WeatherCardData({ data }: WeatherCardDataProps) {
  return (
    <div
      className="@container/weather-card bg-surface border border-border rounded-2xl p-6 shadow-md"
      data-testid="weather-card"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold leading-tight text-fg">
            {data.city}
            <span className="text-lg font-normal text-fg-muted">, {data.country}</span>
          </h2>
        </div>
        <img
          className="w-16 h-16 shrink-0"
          src={getWeatherIconUrl(data.iconCode, '2x')}
          alt={data.description}
          width={64}
          height={64}
        />
      </div>

      <div className="flex items-baseline gap-4 mb-2">
        <span className="text-4xl font-bold text-fg leading-none">{data.temperature}°C</span>
        <span className="text-sm text-fg-muted">Feels like {data.feelsLike}°C</span>
      </div>

      <p className="text-base text-fg-muted capitalize mb-5">{data.description}</p>

      <WeatherDetails
        tempMin={data.tempMin}
        tempMax={data.tempMax}
        windSpeed={data.windSpeed}
        humidity={data.humidity}
      />
    </div>
  );
}
