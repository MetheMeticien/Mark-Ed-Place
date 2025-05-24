'use client';

import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import ProtectedRoute from '@/components/auth/protected-route';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background">
        <DashboardSidebar />
        <div className="flex-1 overflow-auto">
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
