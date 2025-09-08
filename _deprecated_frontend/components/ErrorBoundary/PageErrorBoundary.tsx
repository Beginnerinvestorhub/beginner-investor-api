import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  pageName?: string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

class PageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `page_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`PageErrorBoundary (${this.props.pageName || 'Unknown Page'}) caught an error:`, error, errorInfo);
    
    this.setState({
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log page-specific error
    if (typeof window !== 'undefined') {
      console.group(`📄 Page Error - ${this.props.pageName || 'Unknown Page'}`);
      console.error('Error ID:', this.state.errorId);
      console.error('Error:', error);
      console.error('Component Stack:', errorInfo.componentStack);
      console.error('Page URL:', window.location.href);
      console.groupEnd();
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const pageName = this.props.pageName || 'Page';

      // Page-level error UI
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
          <div className="max-w-lg w-full bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mb-6">
              <AlertTriangle className="mx-auto h-12 w-12 text-orange-500 mb-4" />
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                {pageName} Unavailable
              </h1>
              <p className="text-gray-600 mb-4">
                This page encountered an error and couldn&apos;t load properly. 
                You can try refreshing or navigate to another page.
              </p>
              <div className="bg-gray-100 rounded-md p-2 mb-4">
                <p className="text-xs text-gray-500 font-mono">
                  Error ID: {this.state.errorId}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={this.handleRetry}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center text-sm"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </button>
              
              <button
                onClick={this.handleReload}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center text-sm"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={this.handleGoBack}
                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center text-sm"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center text-sm"
              >
                <Home className="mr-2 h-4 w-4" />
                Home
              </button>
            </div>

            {/* Development mode: Show error details */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                  Show Error Details (Development)
                </summary>
                <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-md">
                  <pre className="text-xs text-orange-800 whitespace-pre-wrap overflow-auto max-h-32">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC wrapper for easier usage with Next.js pages
export function withPageErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  pageName?: string
) {
  const WithErrorBoundaryComponent = (props: P) => {
    return (
      <PageErrorBoundary pageName={pageName}>
        <WrappedComponent {...props} />
      </PageErrorBoundary>
    );
  };

  WithErrorBoundaryComponent.displayName = `withPageErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithErrorBoundaryComponent;
}

export default PageErrorBoundary;
