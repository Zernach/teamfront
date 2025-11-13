import React, { useEffect, useMemo, useState } from 'react';
import { useRootNavigationState, useRouter, useSegments } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { initializeAuth, clearAuth } from '../store/authSlice';
import { tokenStorage } from '../services/tokenStorage';
import { authApi } from '../services/api/authApi';

interface AuthGuardProps {
  children: React.ReactNode;
}

const PUBLIC_SEGMENTS = new Set(['auth', '+not-found']);

export function AuthGuard({ children }: AuthGuardProps) {
  const navigationState = useRootNavigationState();
  const router = useRouter();
  const segments = useSegments();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const [hasAttemptedRestore, setHasAttemptedRestore] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);

  const rootSegment = segments[0];
  const isPublicRoute = useMemo(() => {
    if (!rootSegment) {
      return false;
    }
    return PUBLIC_SEGMENTS.has(rootSegment);
  }, [rootSegment]);

  useEffect(() => {
    let isActive = true;

    const restoreAuth = async () => {
      if (hasAttemptedRestore) {
        if (isActive) {
          setIsRestoring(false);
        }
        return;
      }

      if (isAuthenticated) {
        if (isActive) {
          setHasAttemptedRestore(true);
          setIsRestoring(false);
        }
        return;
      }

      try {
        const storedToken = await tokenStorage.getAuthToken();

        if (!storedToken) {
          await tokenStorage.clearRefreshToken();
          if (isActive) {
            setHasAttemptedRestore(true);
            setIsRestoring(false);
          }
          return;
        }

        const user = await authApi.getCurrentUser();

        if (user) {
          dispatch(
            initializeAuth({
              user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: 'USER',
              },
              token: storedToken,
            })
          );
        } else {
          await tokenStorage.clearAuthToken();
          await tokenStorage.clearRefreshToken();
          dispatch(clearAuth());
        }
      } catch (error) {
        console.error('Auth restoration failed:', error);
        await tokenStorage.clearAuthToken();
        await tokenStorage.clearRefreshToken();
        dispatch(clearAuth());
      } finally {
        if (isActive) {
          setHasAttemptedRestore(true);
          setIsRestoring(false);
        }
      }
    };

    restoreAuth();

    return () => {
      isActive = false;
    };
  }, [dispatch, hasAttemptedRestore, isAuthenticated]);

  useEffect(() => {
    if (!navigationState?.key) {
      return;
    }

    if (isRestoring) {
      return;
    }

    if (!isAuthenticated && !isPublicRoute) {
      if (rootSegment !== 'auth') {
        router.replace('/auth/login');
      }
      return;
    }

    if (isAuthenticated && rootSegment === 'auth') {
      router.replace('/');
    }
  }, [isAuthenticated, isPublicRoute, isRestoring, navigationState?.key, rootSegment, router]);

  const shouldRenderChildren =
    !!navigationState?.key && !isRestoring && (isAuthenticated || isPublicRoute || rootSegment === 'auth');

  if (!shouldRenderChildren) {
    return null;
  }

  return <>{children}</>;
}
