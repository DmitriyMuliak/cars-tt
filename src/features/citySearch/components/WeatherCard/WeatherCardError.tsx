import { AlertCircle } from 'lucide-react';

interface WeatherCardErrorProps {
  message?: string;
  notFound?: boolean;
}

export function WeatherCardError({ message, notFound }: WeatherCardErrorProps) {
  const defaultMessage = notFound
    ? 'City not found. Check the spelling and try again.'
    : 'Failed to fetch weather data.';
  return (
    <div
      className="@container/weather-card bg-error-bg border border-error/30 rounded-2xl p-8 shadow-md flex flex-col items-center gap-3 text-center"
      role="alert"
    >
      <span className="text-error flex">
        <AlertCircle size={32} aria-hidden="true" />
      </span>
      <p className="text-error text-base max-w-[36ch]">{message ?? defaultMessage}</p>
    </div>
  );
}
