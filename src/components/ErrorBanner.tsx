import { useState } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useContent } from '../context/ContentProvider';

const ErrorBanner = () => {
  const { error, loading } = useContent();
  const [dismissed, setDismissed] = useState(false);

  if (loading || !error || dismissed) return null;

  const onRetry = () => {
    // Reload to reinitialize Firebase app/listener in case env or network was fixed
    window.location.reload();
  };

  return (
    <div className="fixed inset-x-0 top-0 z-[1000]">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-red-800 shadow-sm">
          <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-semibold">Content unavailable</div>
            <div className="mt-0.5 text-sm opacity-90">{error}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-red-700"
              title="Retry"
            >
              <ArrowPathIcon className="h-4 w-4" /> Retry
            </button>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="inline-flex items-center rounded-md px-2 py-1 text-red-700 hover:bg-red-100"
              title="Dismiss"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorBanner;

