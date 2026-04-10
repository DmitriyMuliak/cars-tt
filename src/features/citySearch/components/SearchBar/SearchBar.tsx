import { type KeyboardEvent, type SubmitEvent, useState } from 'react';
import { useIsFetching } from '@tanstack/react-query';
import { Search } from 'lucide-react';

import { useWeatherStore } from '@/features/citySearch/store/citySearchStore';
import { Button } from '@/shared/components/ui/Button';
import { useDelayedLoading } from '@/shared/hooks/useDelayedLoading/useDelayedLoading';
import { useToast } from '@/shared/hooks/useToast';
import { pattern, required, validate } from '@/shared/utils/formValidator/formValidator';

import { WEATHER_QUERY_KEY } from '../../hooks/useWeatherQuery/useWeatherQuery';
import { searchBarLabels } from './SearchBar.labels';

const ERROR_TOAST_ID = 'error-toast';
const cityRules = [
  required('Please enter a city name.'),
  pattern(/^\d+$/, 'Please enter a city name.', true),
];

export function SearchBar() {
  const [value, setValue] = useState('');

  const { open } = useToast();
  const setActiveCity = useWeatherStore((s) => s.setActiveCity);
  const activeCity = useWeatherStore((s) => s.activeCity);
  const isLoading = useIsFetching({ queryKey: WEATHER_QUERY_KEY(activeCity) }) > 0;
  const isDelayedLoading = useDelayedLoading(isLoading);

  function showErrorToast(label: string) {
    open(label, {
      id: ERROR_TOAST_ID,
      duration: 2000,
      type: 'error',
    });
  }

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    submit();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      submit();
    }
  }

  function submit() {
    const error = validate(value, cityRules);
    if (error) {
      showErrorToast(error);
      return;
    }
    setActiveCity(value.trim());
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
  }

  return (
    <div className="w-full">
      <form className="flex gap-3 items-stretch" onSubmit={handleSubmit} role="search" noValidate>
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-fg-muted flex pointer-events-none">
            <Search size={18} aria-hidden="true" />
          </span>
          <input
            className="w-full h-12 px-4 pl-[46px] bg-surface border-[1.5px] border-border rounded-xl text-fg text-base outline-none appearance-none transition-[border-color,box-shadow] duration-150
              placeholder:text-fg-muted
              focus:border-primary focus:shadow-[0_0_0_3px_rgba(56,189,248,0.15)]
              aria-[invalid=true]:border-error
              aria-[invalid=true]:focus:shadow-[0_0_0_3px_rgba(248,113,113,0.15)]
              disabled:opacity-60 disabled:cursor-not-allowed"
            type="search"
            placeholder="Search for a city…"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            aria-label="City name"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            disabled={isDelayedLoading}
          />
        </div>
        <Button
          variant="primary"
          className="h-12 px-6 text-base min-w-[100px] whitespace-nowrap flex items-center justify-center enabled:active:border-amber-50"
          type="submit"
          disabled={isDelayedLoading}
          aria-label={searchBarLabels.submit}
        >
          {isDelayedLoading ? (
            <span
              className="block w-[18px] h-[18px] rounded-full border-[2.5px] border-[rgba(15,23,42,0.3)] border-t-canvas animate-[spin_0.7s_linear_infinite]"
              aria-hidden="true"
            />
          ) : (
            'Search'
          )}
        </Button>
      </form>
    </div>
  );
}
