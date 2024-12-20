import { useEffect, useState } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';

export type AdminAccess = {
  DASHBOARD?: boolean;
  PRODUCTS?: boolean;
  ORDERS?: boolean;
  USERS?: boolean;
  ADMIN?: boolean;
  REWARDS?: boolean;
  COUPONS?: boolean;
  isSuperAdmin?: boolean;
};

export const useAdminAccess = () => {
  const [access, setAccess] = useState<AdminAccess | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccess = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        
        if (!user) {
          console.log('No user found');
          setError('Not authenticated');
          setLoading(false);
          return;
        }

        console.log('Fetching token for user:', user.uid);
        const token = await user.getIdToken();
        
        console.log('Making API request...');
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admins/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        console.log('API Response:', response.data);

        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to fetch admin access');
        }

        const { access: userAccess, isSuperAdmin } = response.data.data;
        console.log('Setting access:', { userAccess, isSuperAdmin });
        
        // If super admin, grant all access
        if (isSuperAdmin) {
          setAccess({
            DASHBOARD: true,
            PRODUCTS: true,
            ORDERS: true,
            USERS: true,
            ADMIN: true,
            REWARDS: true,
            COUPONS: true,
            isSuperAdmin: true
          });
        } else {
          // Regular admin - use their specific access
          setAccess({
            ...userAccess,
            DASHBOARD: true, // Everyone gets dashboard access
            isSuperAdmin: false
          });
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching admin access:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch admin access');
        setLoading(false);
      }
    };

    fetchAccess();
  }, []);

  return { access, loading, error };
};
