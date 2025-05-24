'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthContext } from '../providers/auth-provider';
import { Loader2 } from 'lucide-react';
import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  redirectTo?: string;
  loadingFallback?: React.ReactNode;
  unauthorizedFallback?: React.ReactNode;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/login',
  loadingFallback,
  unauthorizedFallback,
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    } else if (!isLoading && isAuthenticated && requiredRole && user?.role !== requiredRole) {
      router.push('/unauthorized');
    }
  }, [user, isLoading, isAuthenticated, router, requiredRole, redirectTo]);

  if (isLoading) {
    return loadingFallback || (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will be redirected by the useEffect
  }

  if (requiredRole && user?.role !== requiredRole) {
    return unauthorizedFallback || (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Unauthorized</h1>
          <p className="mt-2 text-muted-foreground">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
