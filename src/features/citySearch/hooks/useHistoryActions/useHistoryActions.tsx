import { useWeatherStore } from '@/features/citySearch/store/citySearchStore';
import { useToast } from '@/shared/hooks/useToast';
import { TOAST_DURATION_MS } from '@/shared/store/toastStore';

import { UndoToastContent } from '../../components/UndoToastContent';

const REMOVE_TOAST_ID = 'undo-remove';

export function useHistoryActions() {
  const removeFromHistory = useWeatherStore((s) => s.removeFromHistory);
  const clearHistory = useWeatherStore((s) => s.clearHistory);
  const undoRemove = useWeatherStore((s) => s.undoRemove);
  const { open, close } = useToast();

  function closeRemoveItemToast() {
    close(REMOVE_TOAST_ID);
    undoRemove();
  }

  function showRemoveItemToast(label: string) {
    open(label, {
      id: REMOVE_TOAST_ID,
      duration: TOAST_DURATION_MS,
      component: <UndoToastContent label={label} onClick={closeRemoveItemToast} />,
    });
  }

  function removeCity(city: string) {
    removeFromHistory(city);
    showRemoveItemToast(`"${city}" removed`);
  }

  function clearAll(count: number) {
    const label = count === 1 ? '1 city removed' : `${count} cities removed`;
    clearHistory();
    showRemoveItemToast(label);
  }

  return { removeCity, clearAll };
}
