'use client';

import { useAdmin } from "@/hooks/use-admin";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface PermissionGuardProps {
  children: React.ReactNode;
  permission: string;
  fallback?: React.ReactNode;
}

export function PermissionGuard({ 
  children, 
  permission, 
  fallback 
}: PermissionGuardProps) {
  const { hasPermission, isSuperAdmin, loading } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !hasPermission(permission as any) && !isSuperAdmin) {
      router.push('/dashboard');
    }
  }, [loading, hasPermission, permission, router, isSuperAdmin]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!hasPermission(permission as any) && !isSuperAdmin) {
    return fallback || null;
  }

  return <>{children}</>;
}
