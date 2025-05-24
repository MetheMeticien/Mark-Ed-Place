'use client';

import { MarketplaceNavbar } from '@/components/marketplace/marketplace-navbar';
import RoleBasedRoute from '@/components/auth/role-based-route';
import { ROLES } from '@/config/config';
import { Footer } from '@/components/marketplace/footer';

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleBasedRoute allowedRoles={[ROLES.USER, ROLES.MODERATOR]}>
      <div className="flex min-h-screen flex-col bg-background">
        <MarketplaceNavbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </RoleBasedRoute>
  );
}
