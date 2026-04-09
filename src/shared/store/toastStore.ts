import type { ReactNode } from 'react';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const TOAST_DURATION_MS = 5000;

export type ToastType = 'info' | 'error';

export interface ToastItem {
  id: string;
  message: string;
  duration: number;
  type: ToastType;
  component?: ReactNode;
}

interface ToastStore {
  toasts: ToastItem[];
  add: (params: Omit<ToastItem, 'id'> & { id?: string }) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastStore>()(
  devtools(
    (set) => ({
      toasts: [],

      add: ({ id, ...rest }) => {
        const toastId = id ?? crypto.randomUUID();
        set(
          (state) => ({
            // Replace existing toast with same id
            toasts: state.toasts.some((t) => t.id === toastId)
              ? state.toasts.map((t) => (t.id === toastId ? { ...rest, id: toastId } : t))
              : [...state.toasts, { ...rest, id: toastId }],
          }),
          false,
          'add',
        );
      },

      dismiss: (id) => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }), false, 'dismiss');
      },
    }),
    { name: 'ToastStore' },
  ),
);
