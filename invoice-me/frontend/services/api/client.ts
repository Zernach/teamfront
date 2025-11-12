// services/api/client.ts
import { API_CONFIG, ApiException } from './config';

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retries: number;
  private inFlightRequests: Map<string, Promise<any>>;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.timeout = API_CONFIG.timeout;
    // One retry in production by default; overridable via EXPO_PUBLIC_API_RETRIES
    const retryOverride = process.env.EXPO_PUBLIC_API_RETRIES;
    const isNumber = retryOverride !== undefined && !Number.isNaN(Number(retryOverride));
    this.retries = isNumber ? Math.max(0, Number(retryOverride)) : 1;
    this.inFlightRequests = new Map();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // No authentication required - all endpoints are public
    const headers: Record<string, string> = {
      ...API_CONFIG.headers,
      ...(options.headers as Record<string, string>),
    };

    const shouldRetry = (err: unknown): boolean => {
      if (err instanceof ApiException) {
        // Retry on transient statuses
        return [408, 429, 500, 502, 503, 504].includes(err.status);
      }
      if (err instanceof Error && err.name === 'AbortError') {
        return true;
      }
      // Unknown/network errors: allow a retry
      return true;
    };

    let attempt = 0;
    let backoffMs = 500;
    // Always perform at least one attempt; retries add additional attempts
    const maxAttempts = Math.max(1, this.retries + 1);

    const method = (options.method || 'GET').toUpperCase();
    const isGetRequest = method === 'GET';
    const requestKey = isGetRequest ? `GET ${url}` : '';

    // Dedupe identical in-flight GET requests
    if (isGetRequest) {
      const existing = this.inFlightRequests.get(requestKey);
      if (existing) {
        return existing as Promise<T>;
      }
    }

    const execRequest = async (): Promise<T> => {
      while (attempt < maxAttempts) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        try {
          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            let errors: Record<string, string[]> | undefined;

            try {
              const errorData = await response.json();
              if (errorData.message) {
                errorMessage = errorData.message;
              }
              if (errorData.errors) {
                // Convert Record<string, string> to Record<string, string[]>
                // Backend sends Record<string, string>, but we expect Record<string, string[]>
                const convertedErrors: Record<string, string[]> = {};
                Object.entries(errorData.errors).forEach(([key, value]) => {
                  if (Array.isArray(value)) {
                    convertedErrors[key] = value;
                  } else {
                    convertedErrors[key] = [String(value)];
                  }
                });
                errors = convertedErrors;
              }
            } catch {
              // If response is not JSON, use default error message
            }

            const err = new ApiException(errorMessage, response.status, errors);
            if (attempt < maxAttempts - 1 && shouldRetry(err)) {
              attempt += 1;
              await new Promise((r) => setTimeout(r, backoffMs));
              backoffMs = Math.min(backoffMs * 2, 2000);
              continue;
            }
            throw err;
          }

          // Handle empty responses
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            return {} as T;
          }

          return await response.json();
        } catch (error) {
          clearTimeout(timeoutId);

          if (error instanceof ApiException) {
            if (attempt < maxAttempts - 1 && shouldRetry(error)) {
              attempt += 1;
              await new Promise((r) => setTimeout(r, backoffMs));
              backoffMs = Math.min(backoffMs * 2, 2000);
              continue;
            }
            throw error;
          }

          if (error instanceof Error && error.name === 'AbortError') {
            const err = new ApiException('Request timeout', 408);
            if (attempt < maxAttempts - 1 && shouldRetry(err)) {
              attempt += 1;
              await new Promise((r) => setTimeout(r, backoffMs));
              backoffMs = Math.min(backoffMs * 2, 2000);
              continue;
            }
            throw err;
          }

          const err = new ApiException(
            error instanceof Error ? error.message : 'Network error',
            0
          );
          if (attempt < maxAttempts - 1 && shouldRetry(err)) {
            attempt += 1;
            await new Promise((r) => setTimeout(r, backoffMs));
            backoffMs = Math.min(backoffMs * 2, 2000);
            continue;
          }
          throw err;
        }
      }
      // Should not reach here
      throw new ApiException('Unexpected error', 0);
    };

    const promise = execRequest().finally(() => {
      if (isGetRequest) {
        this.inFlightRequests.delete(requestKey);
      }
    });

    if (isGetRequest) {
      this.inFlightRequests.set(requestKey, promise);
    }
    return promise;
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();



