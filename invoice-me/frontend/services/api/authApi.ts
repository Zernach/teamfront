// services/api/authApi.ts
import { apiClient } from './client';
import { ApiException } from './config';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName?: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  fullName: string;
}

class AuthApi {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/api/v1/auth/login', credentials);
      return response;
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      throw new ApiException(
        error instanceof Error ? error.message : 'Login failed',
        0
      );
    }
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await apiClient.post<RegisterResponse>('/api/v1/auth/register', data);
      return response;
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      throw new ApiException(
        error instanceof Error ? error.message : 'Registration failed',
        0
      );
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/v1/auth/logout', {});
    } catch (error) {
      // Even if logout fails on server, we should clear local state
      console.error('Logout error:', error);
    }
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const response = await apiClient.post<{ accessToken: string; refreshToken: string }>(
        '/api/v1/auth/refresh',
        { refreshToken }
      );
      return response;
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      throw new ApiException(
        error instanceof Error ? error.message : 'Token refresh failed',
        0
      );
    }
  }
}

export const authApi = new AuthApi();

