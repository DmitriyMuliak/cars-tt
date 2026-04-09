import { useWeatherStore } from '@/features/citySearch/store/citySearchStore';
import { useToast } from '@/shared/hooks/useToast';
import { TOAST_DURATION_MS } from '@/shared/store/toastStore';

import { UndoToastContent } from '../../components/UndoToastContent';

const UNDO_TOAST_ID = 'undo-remove';

export function useHistoryActions() {
  const removeFromHistory = useWeatherStore((s) => s.removeFromHistory);
  const clearHistory = useWeatherStore((s) => s.clearHistory);
  const undoRemove = useWeatherStore((s) => s.undoRemove);
  const { open, close } = useToast();

  function closeUndoToast() {
    close(UNDO_TOAST_ID);
    undoRemove();
  }

  function showUndoToast(label: string) {
    open(label, {
      id: UNDO_TOAST_ID,
      duration: TOAST_DURATION_MS,
      component: <UndoToastContent label={label} onClick={closeUndoToast} />,
    });
  }

  function removeCity(city: string) {
    removeFromHistory(city);
    showUndoToast(`"${city}" removed`);
  }

  function clearAll(count: number) {
    clearHistory();
    const label = count === 1 ? '1 city removed' : `${count} cities removed`;
    showUndoToast(label);
  }

  return { removeCity, clearAll };
}
