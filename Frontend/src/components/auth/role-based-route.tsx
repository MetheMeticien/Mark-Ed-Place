'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthContext } from '../providers/auth-provider';
import { Loader2 } from 'lucide-react';
import React from 'react';
import { ROLES } from '@/config/config';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
  loadingFallback?: React.ReactNode;
  unauthorizedFallback?: React.ReactNode;
}

export default function RoleBasedRoute({
  children,
  allowedRoles,
  redirectTo = '/login',
  loadingFallback,
  unauthorizedFallback,
}: RoleBasedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    } else if (!isLoading && isAuthenticated && user?.role && !allowedRoles.includes(user.role)) {
      // Redirect admin to dashboard, users to marketplace
      if (user.role === ROLES.ADMIN) {
        router.push('/dashboard');
      } else if (user.role === ROLES.MODERATOR || user.role === ROLES.USER) {
        router.push('/marketplace');
      }
    }
  }, [user, isLoading, isAuthenticated, router, allowedRoles, redirectTo]);

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

  if (user?.role && !allowedRoles.includes(user.role)) {
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
