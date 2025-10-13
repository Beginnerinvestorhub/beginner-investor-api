import { useState, useCallback, useEffect } from 'react';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends ApiState<T> {
  execute: (config?: AxiosRequestConfig) => Promise<T>;
  reset: () => void;
}

interface UseApiOptions {
  baseURL?: string;
  headers?: Record<string, string>;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

/**
 * Generic hook for making API calls with built-in loading, error, and data state management
 * @param url - The API endpoint URL
 * @param options - Configuration options for the API call
 * @returns Object containing data, loading, error states and execute function
 */
export function useApi<T = any>(
  url: string,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const {
    baseURL = process.env.NEXT_PUBLIC_API_BASE_URL,
    headers = {},
    onSuccess,
    onError,
  } = options;

  const execute = useCallback(
    async (config: AxiosRequestConfig = {}): Promise<T> => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const response: AxiosResponse<T> = await axios({
          url,
          baseURL,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
            ...config.headers,
          },
          ...config,
        });

        const data = response.data;
        setState({ data, loading: false, error: null });

        if (onSuccess) {
          onSuccess(data);
        }

        return data;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error ||
          err.message ||
          'An unexpected error occurred';
        setState({ data: null, loading: false, error: errorMessage });

        if (onError) {
          onError(errorMessage);
        }

        throw new Error(errorMessage);
      }
    },
    [url, baseURL, headers, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Hook for GET requests with automatic execution on mount
 * @param url - The API endpoint URL
 * @param options - Configuration options
 * @returns Object containing data, loading, error states and refetch function
 */
export function useApiGet<T = any>(
  url: string,
  options: UseApiOptions & { autoFetch?: boolean } = {}
): UseApiReturn<T> & { refetch: () => Promise<T> } {
  const { autoFetch = true, ...apiOptions } = options;
  const api = useApi<T>(url, apiOptions);

  const refetch = useCallback(() => {
    return api.execute({ method: 'GET' });
  }, [api]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      refetch().catch(() => {
        // Error is already handled by useApi
      });
    }
  }, [autoFetch, refetch]);

  return {
    ...api,
    refetch,
  };
}

/**
 * Hook for POST requests
 * @param url - The API endpoint URL
 * @param options - Configuration options
 * @returns Object containing data, loading, error states and post function
 */
export function useApiPost<T = any, D = any>(
  url: string,
  options: UseApiOptions = {}
): UseApiReturn<T> & { post: (data?: D) => Promise<T> } {
  const api = useApi<T>(url, options);

  const post = useCallback(
    (data?: D) => {
      return api.execute({ method: 'POST', data });
    },
    [api]
  );

  return {
    ...api,
    post,
  };
}
