import React, { useEffect, useState } from 'react';
import { useRootNavigationState } from 'expo-router';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const navigationState = useRootNavigationState();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!navigationState?.key) {
    return null;
  }

  return <>{children}</>;
}

