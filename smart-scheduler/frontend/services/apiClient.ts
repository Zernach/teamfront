import { fetchAuthSession } from 'aws-amplify/auth';
import { API_BASE_URL } from '../constants/api';
import { store } from '../store';

/**
 * API client helper that automatically adds Cognito authentication tokens to requests
 */
class ApiClient {
  private baseUrl: string;
  private inFlightRequests: Map<string, Promise<any>>;
  private hasSwitchedLocalPort: boolean;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.inFlightRequests = new Map();
    this.hasSwitchedLocalPort = false;
  }

  /**
   * When running locally, try alternate localhost port if connection fails.
   * Default local ports: 5001 (preferred) and 5000 (alternate)
   */
  private getAlternateLocalBaseUrl(currentBaseUrl: string): string | null {
    try {
      const url = new URL(currentBaseUrl);
      const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
      if (!isLocalhost) return null;
      const port = url.port;
      if (port === '5001') {
        url.port = '5000';
        return url.toString();
      }
      if (port === '5000') {
        url.port = '5001';
        return url.toString();
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Get the current Cognito access token
   * Primary: Get token from Redux state (reliable, immediately available after login)
   * Fallback: Get token from Cognito session (for edge cases)
   */
  private async getAuthToken(): Promise<string | null> {
    // Primary: Get token from Redux state
    const reduxToken = store.getState().auth.token;
    if (reduxToken) {
      return reduxToken;
    }

    // Fallback: Get token from Cognito session
    try {
      const session = await fetchAuthSession();
      return session.tokens?.accessToken?.toString() || null;
    } catch (error) {
      console.warn('[ApiClient] Failed to get Cognito session:', error);
      return null;
    }
  }

  /**
   * Make an authenticated API request
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
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

    // Get Cognito access token
    const token = await this.getAuthToken();

    // Build headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add authorization header if token is available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const promise = (async () => {
      // Create abort controller for timeout (more compatible than AbortSignal.timeout)
      const controller = new AbortController();
      let timeoutId: ReturnType<typeof setTimeout> | null = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal,
        });

        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        if (!response.ok) {
          const error = await response.json().catch(() => ({
            message: response.statusText || 'Request failed'
          }));
          throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        // Handle empty responses
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          return {} as T;
        }

        return response.json();
      } catch (error: any) {
        // Clear timeout if it hasn't fired yet
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        // Handle network errors (connection closed, timeout, etc.)
        if (error.name === 'AbortError' || error.name === 'TimeoutError') {
          throw new Error('Request timed out. Please check your connection and try again.');
        }
        // Check for various network error patterns
        const errorMessage = error?.message || error?.toString() || '';
        const isNetworkError =
          errorMessage.includes('Failed to fetch') ||
          errorMessage.includes('NetworkError') ||
          errorMessage.includes('ERR_CONNECTION_CLOSED') ||
          errorMessage.includes('ERR_CONNECTION_REFUSED') ||
          errorMessage.includes('ERR_INTERNET_DISCONNECTED') ||
          errorMessage.includes('Network request failed') ||
          errorMessage.includes('fetch failed') ||
          (error instanceof TypeError && errorMessage.includes('fetch'));

        // Dev-only resilience: if localhost base is unreachable, retry once with alternate port (5000 <-> 5001)
        if (isNetworkError && __DEV__ && !this.hasSwitchedLocalPort) {
          const alternateBase = this.getAlternateLocalBaseUrl(this.baseUrl);
          if (alternateBase) {
            try {
              const altUrl = url.replace(this.baseUrl, alternateBase);
              // Retry once with alternate base
              const altResponse = await fetch(altUrl, {
                ...options,
                headers,
              });
              if (altResponse.ok) {
                // Switch for the rest of the session
                console.warn('[ApiClient] Primary API URL unreachable. Switching to alternate:', alternateBase);
                this.baseUrl = alternateBase;
                this.hasSwitchedLocalPort = true;
                // Handle empty responses
                const altContentType = altResponse.headers.get('content-type');
                if (!altContentType || !altContentType.includes('application/json')) {
                  return {} as T;
                }
                return altResponse.json();
              }
            } catch {
              // fall through to generic network error below
            }
          }
        }

        if (isNetworkError) {
          throw new Error(
            'Network error: Unable to connect to the server. Please check your backend URL and try again.'
          );
        }
        // Re-throw other errors
        throw error;
      }
    })().finally(() => {
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

