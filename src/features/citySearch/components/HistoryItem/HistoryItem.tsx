import { History, X } from 'lucide-react';

import { Button } from '@/shared/components/ui/Button';

import { historyItemLabels } from './HistoryItem.labels';

interface HistoryItemProps {
  city: string;
  onSelect: (city: string) => void;
  onRemove: (city: string) => void;
}

export function HistoryItem({ city, onSelect, onRemove }: HistoryItemProps) {
  return (
    <li className="flex items-center bg-surface border border-border rounded-lg overflow-hidden transition-[border-color] duration-150 hover:border-primary">
      <Button
        variant="ghost"
        className="flex-1 flex items-center gap-2 px-4 py-3 text-sm text-fg text-left min-w-0 overflow-hidden whitespace-nowrap text-ellipsis hover:text-primary focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--color-primary)]"
        onClick={() => onSelect(city)}
        aria-label={historyItemLabels.searchCity(city)}
      >
        <History size={14} className="text-fg-muted shrink-0" aria-hidden="true" />
        {city}
      </Button>
      <Button
        variant="ghost-danger"
        className="p-3 flex items-center justify-center border-l border-border shrink-0 focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--color-primary)]"
        onClick={() => onRemove(city)}
        aria-label={historyItemLabels.removeCity(city)}
      >
        <X size={14} aria-hidden="true" />
      </Button>
    </li>
  );
}
