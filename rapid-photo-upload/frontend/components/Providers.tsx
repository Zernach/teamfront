import { QueryClientProvider } from '@tanstack/react-query';
import { Provider, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { queryClient } from '../services/queryClient';
import { store } from '../store';
import { ErrorBoundary } from './ErrorBoundary';
import { initializeAuth } from '../store/authSlice';
import tokenStorage from '../services/tokenStorage';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize auth state from token storage on app startup
    const initAuth = async () => {
      try {
        const token = await tokenStorage.getAuthToken();
        if (token) {
          // Token exists, but we don't have user info without decoding JWT
          // For now, we'll set a minimal auth state. User info will be fetched on next API call
          // or when they login again. This allows the app to work if token is still valid.
          dispatch(initializeAuth({
            user: null, // Will be populated on next login or API call
            token,
          }));
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      }
    };

    initAuth();
  }, [dispatch]);

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

