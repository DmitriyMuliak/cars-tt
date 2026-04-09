import { Button } from '@/shared/components/ui/Button';

interface UndoToastContentProps {
  label: string;
  onClick: () => void;
}

export function UndoToastContent({ label, onClick }: UndoToastContentProps) {
  function handleUndo() {
    onClick();
  }

  return (
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <span className="flex-1 text-sm text-fg truncate">{label}</span>
      <Button onClick={handleUndo} aria-label="Undo removal">
        Undo
      </Button>
    </div>
  );
}
