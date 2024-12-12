'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTable } from '@/components/ui/data-table';
import { Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAuth } from 'firebase/auth';
import { columns, type AdminColumn } from './columns';

export default function AdminsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState<AdminColumn[]>([]);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      
      if (!token) {
        toast.error('Authentication required');
        router.push('/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admins`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch administrators');
      }

      const data = await response.json();
      if (data.success) {
        setAdmins(data.data);
      }
    } catch (error: any) {
      console.error('Error fetching admins:', error);
      toast.error(error.message || 'Failed to load administrators');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <Heading title="Administrators" description="Manage your admin users" />
        <div className="flex items-center gap-4">
          <Button onClick={() => router.push('/admins/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Administrator
          </Button>
        </div>
      </div>
      <Separator />
      <DataTable
        columns={columns}
        data={admins}
        searchKey="email"
        loading={loading}
      />
    </div>
  );
}
