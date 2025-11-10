import React, { useEffect, useState } from 'react';
import { useRouter, useSegments, useRootNavigationState } from 'expo-router';
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
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const [isMounted, setIsMounted] = useState(false);

  // Wait for component to mount and navigation to be ready
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't redirect if already on auth pages
  const isAuthPage = segments[0] === 'auth';

  useEffect(() => {
    // Only navigate if:
    // 1. Component is mounted
    // 2. Navigation state is ready (has key property)
    // 3. User is not authenticated
    // 4. Not already on auth page
    if (isMounted && navigationState?.key && !isAuthenticated && !isAuthPage) {
      // Use push instead of replace to avoid navigation conflicts
      router.push('/auth/login');
    }
  }, [isMounted, navigationState?.key, isAuthenticated, isAuthPage, router]);

  // Don't render children if not authenticated and not on auth page
  // But wait for navigation to be ready first
  if (!navigationState?.key) {
    return null; // Wait for navigation to initialize
  }

  if (!isAuthenticated && !isAuthPage) {
    return null;
  }

  return <>{children}</>;
}

