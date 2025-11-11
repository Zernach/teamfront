import { useMutation } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import { useAppDispatch } from './redux';
import { setAuth, clearAuth } from '../store/authSlice';
import { User } from '../types';
import tokenStorage from '../services/tokenStorage';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  user: {
    id: string;
    username: string;
    email: string;
  };
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt?: string;
  refreshTokenExpiresAt?: string;
}

/**
 * React Query hooks for authentication operations.
 */
export const useLogin = () => {
  const dispatch = useAppDispatch();
  
  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: async (credentials) => {
      const response = await apiClient.post('/auth/login', credentials);
      const data = response.data;
      
      // Validate response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format from server');
      }
      
      if (!data.user || !data.accessToken) {
        throw new Error('Missing required fields in login response');
      }
      
      if (!data.user.id || !data.user.username || !data.user.email) {
        throw new Error('Invalid user data in login response');
      }
      
      return data;
    },
    onSuccess: (data) => {
      dispatch(setAuth({
        user: {
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
        },
        token: data.accessToken,
      }));
      // Store refresh token separately (could use httpOnly cookie in production)
      tokenStorage.setRefreshToken(data.refreshToken).catch(console.error);
    },
  });
};

export const useLogout = () => {
  const dispatch = useAppDispatch();
  
  return useMutation({
    mutationFn: async () => {
      await apiClient.post('/auth/logout');
    },
    onSuccess: () => {
      dispatch(clearAuth());
      tokenStorage.clearRefreshToken().catch(console.error);
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (data: { username: string; email: string; password: string }) => {
      console.log('[useRegister] Making registration request to /auth/register');
      try {
        const response = await apiClient.post('/auth/register', data);
        const responseData = response.data;
        
        // Validate response is JSON, not HTML
        if (typeof responseData === 'string' && (
          responseData.trim().startsWith('<!DOCTYPE') ||
          responseData.trim().startsWith('<html')
        )) {
          throw new Error('Server returned HTML instead of JSON. Please check server configuration.');
        }
        
        console.log('[useRegister] Registration response received:', {
          status: response.status,
          data: responseData,
        });
        return responseData;
      } catch (error: any) {
        console.error('[useRegister] Registration request failed:', {
          message: error?.message,
          code: error?.code,
          response: error?.response ? {
            status: error.response.status,
            data: typeof error.response.data === 'string' 
              ? error.response.data.substring(0, 200) 
              : error.response.data,
          } : null,
        });
        throw error;
      }
    },
  });
};

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: async () => {
      const refreshToken = await tokenStorage.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await apiClient.post('/auth/refresh', {
        refreshToken,
      });
      return response.data;
    },
  });
};

