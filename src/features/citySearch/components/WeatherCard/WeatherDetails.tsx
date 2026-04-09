import { Droplet, Thermometer, Wind } from 'lucide-react';

interface WeatherDetailsProps {
  tempMin: number;
  tempMax: number;
  windSpeed: number;
  humidity: number;
}

export function WeatherDetails({ tempMin, tempMax, windSpeed, humidity }: WeatherDetailsProps) {
  return (
    <div className="grid grid-cols-1 @[380px]/weather-card:grid-cols-3 gap-3 border-t border-border pt-4">
      <div className="flex items-center gap-3">
        <span className="flex text-primary shrink-0">
          <Thermometer size={16} aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-fg-muted uppercase tracking-[0.05em]">Min / Max</span>
          <span className="text-sm font-semibold text-fg">
            {tempMin}° / {tempMax}°C
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="flex text-primary shrink-0">
          <Wind size={16} aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-fg-muted uppercase tracking-[0.05em]">Wind</span>
          <span className="text-sm font-semibold text-fg">{windSpeed} m/s</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="flex text-primary shrink-0">
          <Droplet size={16} aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-fg-muted uppercase tracking-[0.05em]">Humidity</span>
          <span className="text-sm font-semibold text-fg">{humidity}%</span>
        </div>
      </div>
    </div>
  );
}
