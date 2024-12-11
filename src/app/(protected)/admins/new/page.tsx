'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Heading } from '@/components/ui/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { auth } from '@/lib/firebase';
import axios from 'axios';

const ADMIN_ACCESS_OPTIONS = [
  { value: 'PRODUCTS', label: 'Products' },
  { value: 'CATEGORIES', label: 'Categories' },
  { value: 'ORDERS', label: 'Orders' },
  { value: 'CUSTOMERS', label: 'Customers' },
  { value: 'USERS', label: 'Users' },
  { value: 'SETTINGS', label: 'Settings' },
];

export default function NewAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    adminAccess: [] as string[],
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.adminAccess.length === 0) {
      toast.error('Please select at least one access permission');
      return;
    }

    try {
      setLoading(true);

      // Get the current user's token
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Not authenticated');
      }
      const token = await currentUser.getIdToken();

      // Create admin through the API
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, {
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName,
        access: formData.adminAccess,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      router.push('/admins');
      toast.success('Admin created successfully');
    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to create admin');
    } finally {
      setLoading(false);
    }
  };

  const toggleAccess = (access: string) => {
    setFormData(prev => ({
      ...prev,
      adminAccess: prev.adminAccess.includes(access)
        ? prev.adminAccess.filter(a => a !== access)
        : [...prev.adminAccess, access]
    }));
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <Heading title="Create Admin" description="Add a new admin user" />
      </div>
      <Separator />
      <form onSubmit={onSubmit} className="space-y-8 w-full">
        <div className="grid grid-cols-3 gap-8">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              disabled={loading}
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              disabled={loading}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              disabled={loading}
              value={formData.displayName}
              onChange={(e) =>
                setFormData({ ...formData, displayName: e.target.value })
              }
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <Label>Access Permissions</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {ADMIN_ACCESS_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={option.value}
                  checked={formData.adminAccess.includes(option.value)}
                  onCheckedChange={() => toggleAccess(option.value)}
                  disabled={loading}
                />
                <Label htmlFor={option.value} className="font-normal">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Button disabled={loading} type="submit">
          {loading ? 'Creating...' : 'Create Admin'}
        </Button>
      </form>
    </div>
  );
}
