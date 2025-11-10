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

  // Don't redirect if already on auth pages
  const isAuthPage = segments[0] === 'auth';

  if (!isAuthenticated && !isAuthPage) {
    return <Redirect href="/auth/login" />;
  }

  return <>{children}</>;
}

