import { QueryClientProvider } from '@tanstack/react-query';
import { Provider, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { queryClient } from '../services/queryClient';
import { store } from '../store';
import { ErrorBoundary } from './ErrorBoundary';
import { initializeAuth, clearAuth } from '../store/authSlice';
import tokenStorage from '../services/tokenStorage';
import apiClient from '../services/apiClient';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize auth state from token storage on app startup
    const initAuth = async () => {
      try {
        const [token, userData, refreshToken] = await Promise.all([
          tokenStorage.getAuthToken(),
          tokenStorage.getUserData(),
          tokenStorage.getRefreshToken(),
        ]);
        
        if (token && userData) {
          // Both token and user data exist - restore auth state
          console.log('[AuthInitializer] Restoring auth session from storage');
          dispatch(initializeAuth({
            user: userData,
            token,
          }));
          
          // Validate the session by making a test API call
          try {
            console.log('[AuthInitializer] Validating session...');
            await apiClient.get('/auth/me');
            console.log('[AuthInitializer] Session is valid');
          } catch (validationError: any) {
            console.warn('[AuthInitializer] Session validation failed:', validationError.response?.status);
            
            // If 401, try to refresh the token
            if (validationError.response?.status === 401 && refreshToken) {
              try {
                console.log('[AuthInitializer] Attempting to refresh token...');
                const refreshResponse = await apiClient.post('/auth/refresh', { refreshToken });
                const newToken = refreshResponse.data.accessToken;
                
                // Update auth with new token
                dispatch(initializeAuth({
                  user: userData,
                  token: newToken,
                }));
                
                // Persist new token
                await tokenStorage.setAuthToken(newToken);
                if (refreshResponse.data.refreshToken) {
                  await tokenStorage.setRefreshToken(refreshResponse.data.refreshToken);
                }
                
                console.log('[AuthInitializer] Token refresh successful');
              } catch (refreshError) {
                console.error('[AuthInitializer] Token refresh failed, clearing auth');
                dispatch(clearAuth());
                await tokenStorage.clearAuthToken();
              }
            } else {
              // No refresh token or non-401 error - clear auth
              console.warn('[AuthInitializer] Clearing invalid session');
              dispatch(clearAuth());
              await tokenStorage.clearAuthToken();
            }
          }
        } else if (token) {
          // Token exists but no user data - clear the stale token
          console.warn('[AuthInitializer] Found token without user data, clearing...');
          await tokenStorage.clearAuthToken();
        }
      } catch (error) {
        console.error('[AuthInitializer] Failed to initialize auth:', error);
        // Clear auth on error to ensure clean state
        dispatch(clearAuth());
        await tokenStorage.clearAuthToken().catch(() => {});
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, [dispatch]);

  // Show loading state while initializing auth
  if (!isInitialized) {
    return null; // or a loading spinner component
  }

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <AuthInitializer>
            {children}
          </AuthInitializer>
        </QueryClientProvider>
      </Provider>
    </ErrorBoundary>
  );
}

