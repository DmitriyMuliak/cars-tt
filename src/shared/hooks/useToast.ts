import type { ReactNode } from 'react';

import type { ToastType } from '@/shared/store/toastStore';
import { TOAST_DURATION_MS, useToastStore } from '@/shared/store/toastStore';

export interface ShowToastParams {
  duration?: number;
  type?: ToastType;
  component?: ReactNode;
  id?: string;
}

interface ShowToastReturn {
  id: string;
  close: () => void;
}

export function useToast() {
  const add = useToastStore((s) => s.add);
  const dismiss = useToastStore((s) => s.dismiss);

  function open(message: string, params?: ShowToastParams): ShowToastReturn {
    const id = params?.id ?? crypto.randomUUID();
    add({
      message,
      id,
      duration: params?.duration ?? TOAST_DURATION_MS,
      type: params?.type ?? 'info',
      component: params?.component,
    });
    return { id, close: () => dismiss(id) };
  }

  return { open, close: dismiss };
}
