import { CloudSun } from 'lucide-react';

import { SearchBar } from '@/features/citySearch/components/SearchBar/SearchBar';
import { SearchHistory } from '@/features/citySearch/components/SearchHistory/SearchHistory';
import { WeatherCard } from '@/features/citySearch/components/WeatherCard/WeatherCard';
import { Toaster } from '@/shared/components/Toaster/Toaster';

export function App() {
  return (
    <div className="min-h-dvh flex flex-col">
      <div className="w-full max-w-[1100px] mx-auto px-4 py-6 min-[720px]:px-6 min-[720px]:py-8 flex-1 flex flex-col">
        <header className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-11 h-11 bg-surface border border-border rounded-xl">
            <CloudSun size={28} aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-fg tracking-[-0.01em]">Weather Forecast</h1>
        </header>

        <main className="flex flex-col gap-6 flex-1">
          <div className="w-full max-w-[640px] min-[720px]:max-w-full">
            <SearchBar />
          </div>

          <div className="grid grid-cols-1 gap-6 min-[720px]:grid-cols-2 min-[720px]:items-start min-[960px]:grid-cols-[3fr_2fr]">
            <div className="min-w-0">
              <WeatherCard />
            </div>

            <aside className="min-w-0">
              <SearchHistory />
            </aside>
          </div>
        </main>
      </div>

      <Toaster />
    </div>
  );
}
