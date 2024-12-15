'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTable } from '@/components/ui/data-table';
import { Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { columns, type AdminColumn } from './columns';
import { adminService } from '@/services/admin.service';

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
      const response = await adminService.getAdmins();
      
      if (response.success) {
        setAdmins(response.data.map(admin => ({
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          createdAt: admin.createdAt
        })));
      }
    } catch (error: any) {
      console.error('Error fetching admins:', error);
      // Error is already handled by the service
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (adminId: string) => {
    try {
      await adminService.deleteAdmin(adminId);
      fetchAdmins(); // Refresh the list after deletion
    } catch (error) {
      // Error is already handled by the service
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
        deleteRow={handleDelete}
      />
    </div>
  );
}
