'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import DashboardLayout from '@/components/shared/layouts/dashboard-layout';
import { AdminProvider } from '@/hooks/use-admin';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <AdminProvider>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </AdminProvider>
    </ProtectedRoute>
  );
}
