import { AlertTriangle } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetError?: () => void;
}

export default function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-red/[0.12]">
          <AlertTriangle className="h-6 w-6 text-accent-red" />
        </div>
        <h2 className="mb-2 text-lg font-semibold text-dark-100">Something went wrong</h2>
        <p className="mb-6 text-sm text-dark-500">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="flex items-center justify-center gap-2.5">
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-500"
          >
            Reload Page
          </button>
          {resetError && (
            <button
              onClick={resetError}
              className="rounded-lg border border-white/[0.08] bg-white/[0.06] px-4 py-2 text-sm font-medium text-dark-300 transition-colors hover:bg-white/[0.1]"
            >
              Try Again
            </button>
          )}
          <a
            href="/"
            className="rounded-lg border border-white/[0.08] bg-white/[0.06] px-4 py-2 text-sm font-medium text-dark-300 transition-colors hover:bg-white/[0.1]"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
