import { Toast } from '@/shared/components/ui/Toast/Toast';
import { useToastStore } from '@/shared/store/toastStore';

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed z-[100] flex flex-col-reverse gap-2 items-center"
      style={{ bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)' }}
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          component={toast.component}
          type={toast.type}
          duration={toast.duration}
          onDismiss={dismiss}
        />
      ))}
    </div>
  );
}
