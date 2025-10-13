import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';

interface Props {
  children: ReactNode;
  componentName?: string;
  fallback?: ReactNode;
  showError?: boolean;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

class ComponentErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      `ComponentErrorBoundary (${this.props.componentName || 'Unknown'}) caught an error:`,
      error,
      errorInfo
    );

    this.setState({
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log component-specific error
    if (typeof window !== 'undefined') {
      console.group(
        `🔧 Component Error - ${this.props.componentName || 'Unknown Component'}`
      );
      console.error('Error:', error);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }));

      // Call custom retry handler if provided
      if (this.props.onRetry) {
        this.props.onRetry();
      }
    }
  };

  handleDismiss = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Don't show error UI if showError is false
      if (this.props.showError === false) {
        return null;
      }

      const componentName = this.props.componentName || 'Component';
      const canRetry = this.state.retryCount < this.maxRetries;

      // Compact error UI for component-level errors
      return (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-red-800">
                {componentName} Error
              </h3>
              <p className="text-sm text-red-700 mt-1">
                This component encountered an error and couldn&apos;t render
                properly.
              </p>

              {/* Development mode: Show error message */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-2">
                  <summary className="text-xs text-red-600 cursor-pointer hover:text-red-800">
                    Show Error Details
                  </summary>
                  <pre className="text-xs text-red-600 mt-1 p-2 bg-red-100 rounded overflow-auto max-h-32">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex items-center space-x-2 ml-3">
              {canRetry && (
                <button
                  onClick={this.handleRetry}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded transition-colors duration-200"
                  title={`Retry (${this.maxRetries - this.state.retryCount} attempts left)`}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </button>
              )}

              <button
                onClick={this.handleDismiss}
                className="inline-flex items-center p-1 text-red-400 hover:text-red-600 transition-colors duration-200"
                title="Dismiss error"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ComponentErrorBoundary;
