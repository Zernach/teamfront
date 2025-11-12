// services/api/client.ts
import { API_CONFIG, ApiException } from './config';
import { fetchAuthSession } from 'aws-amplify/auth';
import { store } from '../../store';

class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.timeout = API_CONFIG.timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    // Get Cognito access token and add to headers
    // Primary: Get token from Redux state (reliable, immediately available after login)
    // Fallback: Get token from Cognito session (for edge cases)
    let token: string | null = null;
    const reduxToken = store.getState().auth.token;
    if (reduxToken) {
      token = reduxToken;
    } else {
      try {
        const session = await fetchAuthSession();
        token = session.tokens?.accessToken?.toString() || null;
      } catch (error) {
        console.warn('Failed to get Cognito session:', error);
      }
    }

    const headers: Record<string, string> = {
      ...API_CONFIG.headers,
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

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

        throw new ApiException(errorMessage, response.status, errors);
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
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiException('Request timeout', 408);
      }

      throw new ApiException(
        error instanceof Error ? error.message : 'Network error',
        0
      );
    }
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



