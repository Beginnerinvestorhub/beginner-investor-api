/**
 * Executes a function with retry logic using exponential backoff
 * @template T The return type of the function
 * @param fn The function to execute
 * @param options Retry configuration options
 * @returns A promise that resolves with the function's return value
 * @throws The last error if all retries are exhausted
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
  } = {},
): Promise<T> {
  const { maxRetries = 3, initialDelay = 100, maxDelay = 10000 } = options;
  let attempts = 0;
  let lastError: Error;

  while (attempts <= maxRetries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      attempts++;

      if (attempts > maxRetries) break;

      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelay * Math.pow(2, attempts - 1),
        maxDelay,
      );

      // Add jitter to avoid thundering herd problem
      const jitter = delay * 0.1 * Math.random();
      const delayWithJitter = delay + jitter;

      await new Promise((resolve) => setTimeout(resolve, delayWithJitter));
    }
  }

  throw lastError;
}

/**
 * Creates a retryable function with the specified options
 * @template T The return type of the function
 * @param options Retry configuration options
 * @returns A function that wraps the original function with retry logic
 */
export function createRetryable<T>(
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
  } = {},
) {
  return function (fn: () => Promise<T>): Promise<T> {
    return withRetry(fn, options);
  };
}

// Example usage:
/*
const fetchWithRetry = createRetryable({ maxRetries: 3, initialDelay: 200 });
const result = await fetchWithRetry(() => fetchData(params));
*/
