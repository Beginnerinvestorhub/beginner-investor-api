export { default as GlobalErrorBoundary } from './GlobalErrorBoundary';
export { default as ComponentErrorBoundary } from './ComponentErrorBoundary';
export {
  default as PageErrorBoundary,
  withPageErrorBoundary,
} from './PageErrorBoundary';

// Error boundary utilities and hooks
interface ErrorInfo {
  componentStack: string;
}

export const logError = (error: Error, errorInfo?: ErrorInfo, context?: string) => {
  console.group(`🚨 Error Logged${context ? ` - ${context}` : ''}`);
  console.error('Error:', error);
  if (errorInfo) {
    console.error('Error Info:', errorInfo);
  }
  console.error('Stack:', error.stack);
  console.groupEnd();

  // In production, send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(error, { extra: errorInfo, tags: { context } });
  }
};

// Error boundary configuration
export const errorBoundaryConfig = {
  // Global settings
  enableErrorReporting: process.env.NODE_ENV === 'production',
  maxRetries: 3,

  // Development settings
  showErrorDetails: process.env.NODE_ENV === 'development',
  logToConsole: true,

  // Production settings
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enableUserFeedback: true,
};
