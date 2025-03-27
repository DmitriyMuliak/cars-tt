import { Component, type ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

import { Button } from '@/shared/components/ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          className="min-h-dvh flex items-center justify-center p-6"
          role="alert"
          aria-label="Application error"
        >
          <div className="flex flex-col items-center gap-4 text-center max-w-sm">
            <span className="text-error flex">
              <AlertCircle size={32} aria-hidden="true" />
            </span>
            <h2 className="text-lg font-semibold text-fg">Something went wrong</h2>
            <p className="text-sm text-fg-muted">
              An unexpected error occurred. Please reload the page.
            </p>
            <Button
              variant="primary"
              className="mt-2 px-4 py-2 text-sm"
              onClick={() => window.location.reload()}
            >
              Reload page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
