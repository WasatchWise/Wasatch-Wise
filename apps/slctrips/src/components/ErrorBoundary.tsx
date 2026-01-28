'use client';

import { Component, ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Send to Sentry for error tracking
    Sentry.captureException(error, {
      extra: {
        componentStack: errorInfo?.componentStack,
      },
      tags: {
        component: 'ErrorBoundary',
      },
    });
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-600 mb-6">
                We're sorry for the inconvenience. The error has been logged and we'll look into it.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Reload Page
              </button>
              <button
                onClick={() => window.history.back()}
                className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Go Back
              </button>
{/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Using <a> intentionally in error boundary where router may be broken */}
              <a
                href="/"
                className="block w-full px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Return Home
              </a>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Found an issue?</strong> Help us fix it!
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href={`mailto:Dan@slctrips.com?subject=Site%20Issue%20Report&body=Page:%20${typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : 'Unknown'}%0A%0AIssue%20Description:%0A%0A`}
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors text-center"
                >
                  📧 Report Issue
                </a>
                <a
                  href="/legal/contact"
                  className="inline-block bg-white border border-blue-300 text-blue-700 px-4 py-2 rounded-lg font-semibold text-sm transition-colors text-center hover:bg-blue-50"
                >
                  📋 Support Center
                </a>
              </div>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                <h3 className="text-sm font-semibold text-red-800 mb-2">
                  Development Error Details:
                </h3>
                <pre className="text-xs text-red-700 overflow-x-auto">
                  {this.state.error.message}
                </pre>
                {this.state.error.stack && (
                  <pre className="text-xs text-red-600 overflow-x-auto mt-2 max-h-40">
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
