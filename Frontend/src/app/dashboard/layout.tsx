'use client';

import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import RoleBasedRoute from '@/components/auth/role-based-route';
import { ROLES } from '@/config/config';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleBasedRoute allowedRoles={[ROLES.ADMIN]}>
      <div className="flex h-screen bg-background">
        <DashboardSidebar />
        <div className="flex-1 overflow-auto">
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </RoleBasedRoute>
  );
}
