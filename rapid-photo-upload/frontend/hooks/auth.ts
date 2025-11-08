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
      const response = await apiClient.post('/auth/register', data);
      return response.data;
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

