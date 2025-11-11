import { QueryClientProvider } from '@tanstack/react-query';
import { Provider, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { queryClient } from '../services/queryClient';
import { store } from '../store';
import { ErrorBoundary } from './ErrorBoundary';
import { initializeAuth, clearAuth } from '../store/authSlice';
import { cognitoAuthService } from '../services/cognito/authService';
import '../services/cognito/config'; // Initialize Amplify

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize auth state from Cognito on app startup
    const initAuth = async () => {
      try {
        const user = await cognitoAuthService.getCurrentUser();
        const accessToken = await cognitoAuthService.getAccessToken();
        
        if (user && accessToken) {
          console.log('[AuthInitializer] Restoring auth session from Cognito');
          dispatch(initializeAuth({
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
            },
            token: accessToken,
          }));
        }
      } catch (error) {
        console.error('[AuthInitializer] Failed to initialize auth:', error);
        // Clear auth on error to ensure clean state
        dispatch(clearAuth());
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

