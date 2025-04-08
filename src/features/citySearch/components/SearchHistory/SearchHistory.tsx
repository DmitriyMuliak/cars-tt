import { useWeatherStore } from '@/features/citySearch/store/citySearchStore';
import { Button } from '@/shared/components/ui/Button';

import { useHistoryActions } from '../../hooks/useHistoryActions/useHistoryActions';
import { HistoryItem } from '../HistoryItem/HistoryItem';
import { searchHistoryLabels } from './SearchHistory.labels';

export function SearchHistory() {
  const history = useWeatherStore((s) => s.history);
  const setActiveCity = useWeatherStore((s) => s.setActiveCity);
  const { removeCity, clearAll } = useHistoryActions();

  if (history.length === 0) return null;

  return (
    <section className="@container/search-history" aria-label="Search history">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-[0.06em]">
          Recent searches
        </h3>
        <Button
          variant="ghost-danger"
          className="text-xs px-2 py-1"
          onClick={() => clearAll(history.length)}
          aria-label={searchHistoryLabels.clearAll}
        >
          Clear all
        </Button>
      </div>

      <div className="max-h-[300px] overflow-y-auto">
        <ul
          className="flex flex-col gap-1 list-none @[500px]/search-history:grid @[500px]/search-history:grid-cols-2 @[500px]/search-history:gap-2 @[800px]/search-history:grid-cols-3"
          role="list"
        >
          {history.map((item) => (
            <HistoryItem
              key={item.city}
              city={item.city}
              onSelect={setActiveCity}
              onRemove={removeCity}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
