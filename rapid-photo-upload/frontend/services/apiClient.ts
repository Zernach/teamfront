import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import tokenStorage from './tokenStorage';
import { API_URL } from '../constants/api';

/**
 * API client configuration for rapid-photo-upload backend.
 * Handles authentication, error handling, and request/response interceptors.
 */
class ApiClient {
  private client: AxiosInstance;
  private refreshTokenPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await tokenStorage.getAuthToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle errors and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized - attempt token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshAccessToken();
            if (newToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed - clear auth and redirect to login
            await tokenStorage.clearAuthToken();
            // TODO: Navigate to login (will be handled by auth store)
            return Promise.reject(refreshError);
          }
        }

        // Handle other errors
        if (error.response?.status === 403) {
          // Forbidden - user doesn't have permission
          console.error('Access forbidden:', error.response.data);
        } else if (error.response?.status === 500) {
          // Server error
          console.error('Server error:', error.response.data);
        } else if (!error.response) {
          // Network error
          console.error('Network error:', error.message);
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshAccessToken(): Promise<string | null> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    this.refreshTokenPromise = (async () => {
      try {
        const refreshToken = await tokenStorage.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          { refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const { accessToken } = response.data;
        await tokenStorage.setAuthToken(accessToken);
        return accessToken;
      } catch (error) {
        await tokenStorage.clearAuthToken();
        await tokenStorage.clearRefreshToken();
        throw error;
      } finally {
        this.refreshTokenPromise = null;
      }
    })();

    return this.refreshTokenPromise;
  }

  public async setAuthToken(token: string): Promise<void> {
    await tokenStorage.setAuthToken(token);
  }

  public getClient(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient();
export default apiClient.getClient();

