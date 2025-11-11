import { useMutation } from '@tanstack/react-query';
import { useAppDispatch } from './redux';
import { setAuth, clearAuth } from '../store/authSlice';
import { cognitoAuthService } from '../services/cognito/authService';

interface LoginRequest {
  email: string;
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
 * React Query hooks for authentication operations using AWS Cognito.
 */
export const useLogin = () => {
  const dispatch = useAppDispatch();
  
  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: async (credentials) => {
      return await cognitoAuthService.login(credentials);
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
    },
  });
};

export const useLogout = () => {
  const dispatch = useAppDispatch();
  
  return useMutation({
    mutationFn: async () => {
      await cognitoAuthService.logout();
    },
    onSuccess: () => {
      dispatch(clearAuth());
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (data: { username: string; email: string; password: string }) => {
      console.log('[useRegister] Making registration request to Cognito');
      try {
        const response = await cognitoAuthService.register(data);
        console.log('[useRegister] Registration response received:', response);
        return response;
      } catch (error: any) {
        console.error('[useRegister] Registration request failed:', {
          message: error?.message,
        });
        throw error;
      }
    },
  });
};

export const useConfirmRegistration = () => {
  return useMutation({
    mutationFn: async (data: { email: string; confirmationCode: string }) => {
      console.log('[useConfirmRegistration] Confirming registration');
      try {
        await cognitoAuthService.confirmRegistration(data.email, data.confirmationCode);
        console.log('[useConfirmRegistration] Registration confirmed successfully');
      } catch (error: any) {
        console.error('[useConfirmRegistration] Confirmation failed:', {
          message: error?.message,
        });
        throw error;
      }
    },
  });
};

export const useRefreshToken = () => {
  const dispatch = useAppDispatch();
  
  return useMutation({
    mutationFn: async () => {
      return await cognitoAuthService.refreshToken();
    },
    onSuccess: (data) => {
      // Update auth state with new access token
      if (data.accessToken) {
        // Get current user to update auth state
        cognitoAuthService.getCurrentUser().then(user => {
          if (user) {
            dispatch(setAuth({
              user: {
                id: user.id,
                username: user.username,
                email: user.email,
              },
              token: data.accessToken,
            }));
          }
        }).catch(console.error);
      }
    },
  });
};

/**
 * Hook to validate current session and fetch user profile
 */
export const useValidateSession = () => {
  const dispatch = useAppDispatch();
  
  return useMutation({
    mutationFn: async () => {
      const user = await cognitoAuthService.getCurrentUser();
      const accessToken = await cognitoAuthService.getAccessToken();
      
      if (!user || !accessToken) {
        throw new Error('No active session');
      }
      
      return { user, accessToken };
    },
    onSuccess: (data) => {
      // Session is valid, update user data
      dispatch(setAuth({
        user: {
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
        },
        token: data.accessToken,
      }));
    },
    onError: async () => {
      // Session is invalid
      console.log('[useValidateSession] Session validation failed');
      dispatch(clearAuth());
    },
  });
};

