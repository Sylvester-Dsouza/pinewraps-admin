'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import DashboardLayout from '@/components/shared/layouts/dashboard-layout';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
