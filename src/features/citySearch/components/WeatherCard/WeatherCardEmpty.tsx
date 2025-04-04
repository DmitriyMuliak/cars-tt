import { Sun } from 'lucide-react';

export function WeatherCardEmpty() {
  return (
    <div className="@container/weather-card bg-transparent border border-dashed border-border rounded-2xl px-8 py-12 shadow-md flex flex-col items-center gap-4 text-center">
      <span className="text-fg-muted opacity-40 flex">
        <Sun size={48} aria-hidden="true" />
      </span>
      <p className="text-fg-muted text-base">Search for a city to see weather data</p>
    </div>
  );
}
