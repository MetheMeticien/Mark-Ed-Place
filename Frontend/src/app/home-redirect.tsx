'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/providers/auth-provider';
import { ROUTES, ROLES } from '@/config/config';
import { Loader2 } from 'lucide-react';

export default function HomeRedirect() {
  const { user, isLoading, isAuthenticated } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Redirect based on user role
        if (user?.role === ROLES.ADMIN) {
          router.push(ROUTES.DASHBOARD);
        } else {
          router.push(ROUTES.MARKETPLACE);
        }
      } else {
        // Not authenticated, stay on home page
        // The landing page will be shown
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not authenticated or still loading, render nothing (the parent page will be shown)
  return null;
}
