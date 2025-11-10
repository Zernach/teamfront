import React from 'react';
import { Redirect, useSegments } from 'expo-router';
import { useAppSelector } from '../hooks/redux';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard component that protects routes requiring authentication.
 * Redirects to login if user is not authenticated.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const segments = useSegments();

  // Don't redirect if navigator isn't ready yet (segments will be empty)
  // Wait for navigator to mount before attempting redirect
  const isNavigatorReady = segments.length > 0;
  
  // Don't redirect if already on auth pages
  const isAuthPage = segments.length > 0 && segments[0] === 'auth';

  // Only redirect if navigator is ready, not authenticated, and not on auth page
  if (isNavigatorReady && !isAuthenticated && !isAuthPage) {
    return <Redirect href="/auth/login" />;
  }

  // If navigator isn't ready yet, render children to allow Stack to mount
  // The redirect will happen on next render once navigator is ready
  return <>{children}</>;
}

