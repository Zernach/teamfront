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
    console.log('[ApiClient] Initializing API client with baseURL:', API_URL);
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 30000, // Default timeout for regular requests (30 seconds)
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Get client with extended timeout for file uploads
   * Uploads can take longer, especially for batch uploads
   */
  public getUploadClient(timeoutMs: number = 300000): AxiosInstance {
    console.log('[ApiClient] Creating upload client with timeout:', timeoutMs, 'ms');
    const uploadClient = axios.create({
      baseURL: API_URL,
      timeout: timeoutMs, // 5 minutes default for uploads
      headers: {
        // Don't set Content-Type for multipart/form-data - let axios set it with boundary
      },
    });
    
    console.log('[ApiClient] Upload client baseURL:', API_URL);
    this.setupUploadInterceptors(uploadClient);
    return uploadClient;
  }

  private setupInterceptors(): void {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await tokenStorage.getAuthToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('[ApiClient] Making request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          baseURL: config.baseURL,
          fullURL: `${config.baseURL}${config.url}`,
          timeout: config.timeout,
          hasAuth: !!config.headers?.Authorization,
        });
        return config;
      },
      (error: AxiosError) => {
        console.error('[ApiClient] Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle errors and token refresh
    this.client.interceptors.response.use(
      (response) => {
        // Check if response is HTML (indicates Spring Security redirect or error)
        const contentType = response.headers['content-type'] || '';
        const responseData = response.data;
        
        if (typeof responseData === 'string' && (
          responseData.trim().startsWith('<!DOCTYPE') ||
          responseData.trim().startsWith('<html') ||
          contentType.includes('text/html')
        )) {
          console.error('[ApiClient] Received HTML response instead of JSON:', {
            url: response.config.url,
            status: response.status,
            contentType,
            dataPreview: responseData.substring(0, 200),
          });
          // Create a proper AxiosError with the response preserved
          const error = new Error('Server returned HTML instead of JSON. This usually indicates a configuration error.') as any;
          error.response = response;
          error.config = response.config;
          error.isAxiosError = true;
          return Promise.reject(error);
        }
        return response;
      },
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

  /**
   * Setup interceptors for upload client (with auth token)
   */
  private setupUploadInterceptors(client: AxiosInstance): void {
    // Request interceptor - add auth token
    client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await tokenStorage.getAuthToken();
        if (token && config.headers) {
          console.log('[ApiClient] Adding auth token to upload request:', config.url);
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          console.warn('[ApiClient] No auth token available for upload request:', config.url);
        }
        console.log('[ApiClient] Upload request config:', {
          url: config.url,
          method: config.method,
          timeout: config.timeout,
          hasAuth: !!config.headers?.Authorization,
        });
        return config;
      },
      (error: AxiosError) => {
        console.error('[ApiClient] Upload request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle errors
    client.interceptors.response.use(
      (response) => {
        console.log('[ApiClient] Upload response received:', {
          status: response.status,
          url: response.config.url,
        });
        return response;
      },
      async (error: AxiosError) => {
        console.error('[ApiClient] Upload response error:', {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          url: error.config?.url,
        });
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized - attempt token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          console.log('[ApiClient] 401 Unauthorized, attempting token refresh');
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshAccessToken();
            if (newToken && originalRequest.headers) {
              console.log('[ApiClient] Token refreshed, retrying upload request');
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return client(originalRequest);
            }
          } catch (refreshError) {
            console.error('[ApiClient] Token refresh failed:', refreshError);
            await tokenStorage.clearAuthToken();
            return Promise.reject(refreshError);
          }
        }

        // Handle other errors
        if (error.response?.status === 403) {
          console.error('[ApiClient] Access forbidden:', error.response.data);
        } else if (error.response?.status === 500) {
          console.error('[ApiClient] Server error:', error.response.data);
        } else if (!error.response) {
          console.error('[ApiClient] Network error:', error.message);
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

