import type { ReactNode } from 'react';
import { useCallback } from 'react';

import type { ToastType } from '@/shared/store/toastStore';
import { TOAST_DURATION_MS, useToastStore } from '@/shared/store/toastStore';

export interface ShowToastParams {
  duration?: number;
  type?: ToastType;
  component?: ReactNode;
  id?: string;
}

export function useToast() {
  const add = useToastStore((s) => s.add);
  const dismiss = useToastStore((s) => s.dismiss);

  const open = useCallback(
    (message: string, params?: ShowToastParams): string => {
      const id = params?.id ?? crypto.randomUUID();
      add({
        message,
        id,
        duration: params?.duration ?? TOAST_DURATION_MS,
        type: params?.type ?? 'info',
        component: params?.component,
      });
      return id;
    },
    [add],
  );

  const close = useCallback(
    (id: string) => {
      dismiss(id);
    },
    [dismiss],
  );

  return { open, close };
}
