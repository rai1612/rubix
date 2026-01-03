import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="w-16 h-16 text-error" />
          </div>
          
          <h1 className="text-2xl font-bold text-adaptive-primary mb-2">
            Oops! Something went wrong
          </h1>
          
          <p className="text-adaptive-secondary mb-6">
            We're sorry, but something unexpected happened. Please try refreshing the page.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={resetErrorBoundary}
              className="w-full flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-on-primary px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try again</span>
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gray-100 hover:bg-gray-200 text-adaptive-primary px-4 py-2 rounded-lg transition-colors"
            >
              Go to homepage
            </button>
          </div>
          
          {import.meta.env.DEV && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-adaptive-tertiary hover:text-adaptive-primary">
                Error details (development)
              </summary>
              <pre className="mt-2 text-xs text-error bg-error p-3 rounded overflow-auto">
                {error.message}
                {error.stack && '\n\n' + error.stack}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;
