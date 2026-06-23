import React from 'react';
import { Link } from 'react-router-dom';

/**
 * ErrorBoundary — class component because React hooks can't catch render errors.
 *
 * Catches any error thrown during rendering, in lifecycle methods, or in
 * constructors of the whole subtree below it. Without this, one bad event
 * or malformed API response causes the entire app to go white.
 *
 * Usage:
 *   Wrap the app root (or a subtree) in <ErrorBoundary>.
 *   The fallback shows a friendly recovery UI with:
 *     - What went wrong (in development)
 *     - "Try again" (reloads the page)
 *     - "Go home" (navigates to /)
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // In production you'd send this to Sentry / LogRocket / etc.
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const isDev = process.env.NODE_ENV === 'development';

    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 text-center">
        {/* Logo */}
        <Link to="/" onClick={this.handleReset} className="flex items-center gap-2 mb-12">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center font-black text-white">E</div>
          <span className="text-2xl font-black text-white tracking-tight">
            Encore<span className="text-primary">Hub</span>
          </span>
        </Link>

        {/* Broken ticket illustration */}
        <div className="flex items-center justify-center gap-1 mb-8">
          <div className="h-20 w-36 bg-dark-card border border-dark-border rounded-l-xl flex items-center justify-center">
            <div className="text-3xl">⚠️</div>
          </div>
          <div className="flex flex-col gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-1.5 h-3 bg-dark-border rounded-full" />
            ))}
          </div>
          <div className="h-20 w-36 bg-dark-card border border-dark-border rounded-r-xl flex items-center justify-center">
            <span className="text-red-400 text-xs font-bold tracking-wider">ERROR</span>
          </div>
        </div>

        <h1 className="text-4xl font-black text-white mb-3">Something went wrong</h1>
        <p className="text-gray-400 text-lg mb-2 max-w-md">
          An unexpected error occurred. Your booking data is safe — this is a display issue.
        </p>

        {/* Dev-mode error details */}
        {isDev && this.state.error && (
          <details className="mb-8 text-left bg-dark-card border border-red-500/20 rounded-xl p-4 max-w-xl w-full">
            <summary className="text-red-400 text-sm font-semibold cursor-pointer mb-2">
              Error details (dev only)
            </summary>
            <pre className="text-red-300 text-xs overflow-auto max-h-40 whitespace-pre-wrap">
              {this.state.error.toString()}
              {'\n\n'}
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
        )}

        {/* Recovery actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => window.location.reload()}
            className="btn-primary py-3 px-8 shadow-lg shadow-primary/30"
          >
            Try Again
          </button>
          <Link
            to="/"
            onClick={this.handleReset}
            className="btn-secondary py-3 px-8"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
