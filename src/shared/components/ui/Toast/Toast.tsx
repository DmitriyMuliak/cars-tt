import { type ReactNode, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

import { Button } from '@/shared/components/ui/Button';
import type { ToastType } from '@/shared/store/toastStore';

export interface ToastProps {
  id: string;
  message: string;
  component?: ReactNode;
  type?: ToastType;
  onDismiss: (id: string) => void;
  duration?: number;
}

export function Toast({
  id,
  message,
  component,
  type = 'info',
  onDismiss,
  duration = 5000,
}: ToastProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => onDismiss(id), duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [id, onDismiss, duration]);

  function handleDismiss() {
    if (timerRef.current) clearTimeout(timerRef.current);
    onDismiss(id);
  }

  const borderColor = type === 'error' ? 'border-error' : 'border-border';
  const progressColor = type === 'error' ? 'bg-error' : 'bg-primary';

  return (
    <div
      className={`flex items-center gap-4 bg-surface border ${borderColor} rounded-xl px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.5)] top-0 right-0 min-w-[260px] max-w-[min(480px,calc(100vw-2rem))] overflow-hidden animate-slide-up relative`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={message}
    >
      <div className="flex-1 min-w-0">
        {component ?? <span className="text-sm text-fg">{message}</span>}
      </div>
      <Button
        variant="ghost"
        className="flex items-center justify-center p-1 shrink-0"
        onClick={handleDismiss}
        aria-label="Dismiss notification"
      >
        <X size={14} aria-hidden="true" />
      </Button>
      <div
        className={`absolute bottom-0 left-0 h-0.5 w-full ${progressColor} origin-left`}
        style={{ animation: `shrink ${duration}ms linear forwards` }}
      />
    </div>
  );
}
