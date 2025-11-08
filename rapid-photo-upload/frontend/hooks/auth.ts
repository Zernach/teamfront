import { useMutation } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import { useAppDispatch } from './redux';
import { setAuth, clearAuth } from '../store/authSlice';
import { User } from '../types';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * React Query hooks for authentication operations.
 */
export const useLogin = () => {
  const dispatch = useAppDispatch();
  
  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: async (credentials) => {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
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
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('refresh_token', data.refreshToken);
      }
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
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('refresh_token');
      }
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (data: { username: string; email: string; password: string }) => {
      const response = await apiClient.post('/auth/register', data);
      return response.data;
    },
  });
};

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: async () => {
      const refreshToken = typeof window !== 'undefined' 
        ? window.localStorage.getItem('refresh_token')
        : null;
      
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

