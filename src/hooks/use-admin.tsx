'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import axios from 'axios';

type AdminAccess = 
  | 'DASHBOARD'
  | 'PRODUCTS'
  | 'ORDERS'
  | 'USERS'
  | 'ADMIN'
  | 'REWARDS'
  | 'COUPONS'
  | 'CATEGORIES'
  | 'CUSTOMERS'
  | 'SETTINGS';

type UserRole = 'ADMIN' | 'SUPER_ADMIN';

interface AdminData {
  id: string;
  firebaseUid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: AdminAccess[];
  isActive: boolean;
}

interface AdminContextType {
  admin: AdminData | null;
  loading: boolean;
  hasPermission: (permission: AdminAccess) => boolean;
  isSuperAdmin: boolean;
}

const AdminContext = createContext<AdminContextType>({
  admin: null,
  loading: true,
  hasPermission: () => false,
  isSuperAdmin: false,
});

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          setLoading(false);
          return;
        }

        const token = await user.getIdToken();
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setAdmin(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const hasPermission = (permission: AdminAccess): boolean => {
    if (!admin) return false;
    if (admin.role === 'SUPER_ADMIN') return true;
    return admin.permissions.includes(permission);
  };

  const isSuperAdmin = admin?.role === 'SUPER_ADMIN';

  return (
    <AdminContext.Provider value={{ admin, loading, hasPermission, isSuperAdmin }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
