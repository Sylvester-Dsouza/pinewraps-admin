'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

interface FormData {
  name: string;
  password: string;
  access: string[];
}

const EditAdminPage = () => {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    password: "",
    access: [],
  });

  const accessOptions = [
    { id: "DASHBOARD", label: "Dashboard" },
    { id: "PRODUCTS", label: "Products" },
    { id: "ORDERS", label: "Orders" },
    { id: "USERS", label: "Users" },
    { id: "ADMIN", label: "Admin" },
    { id: "REWARDS", label: "Rewards" },
    { id: "COUPONS", label: "Coupons" },
  ];

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          router.push('/sign-in');
          return;
        }

        const token = await currentUser.getIdToken();
        
        // First verify if user is a super admin
        const verifyResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/admin/verify`,
          { token },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const userData = verifyResponse.data.data.user;
        if (userData.role !== 'SUPER_ADMIN') {
          toast.error('You do not have permission to edit admins');
          router.push('/');
          return;
        }

        // Fetch admin details
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${params.adminId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        setFormData({
          name: response.data.data.name || "",
          password: "",
          access: response.data.data.adminAccess || [],
        });
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Error loading admin details");
        console.error(error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          router.push('/sign-in');
        }
      } finally {
        setInitialLoading(false);
      }
    };

    fetchAdmin();
  }, [params.adminId, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.access.length === 0) {
      toast.error("Please select at least one access permission");
      return;
    }

    try {
      setLoading(true);

      const currentUser = auth.currentUser;
      if (!currentUser) {
        router.push('/sign-in');
        return;
      }

      const token = await currentUser.getIdToken();
      
      // Only include password in the request if it's not empty
      const data: any = {
        name: formData.name,
        access: formData.access,
      };
      if (formData.password) {
        data.password = formData.password;
      }

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${params.adminId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      router.refresh();
      router.push("/admins");
      toast.success("Admin updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
      if (error.response?.status === 401 || error.response?.status === 403) {
        router.push('/sign-in');
      }
    } finally {
      setLoading(false);
    }
  };

  const onAccessChange = (checked: boolean, id: string) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        access: [...prev.access, id],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        access: prev.access.filter((item) => item !== id),
      }));
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading title="Edit Admin" description="Edit admin details and permissions" />
        </div>
        <Separator />
        <form onSubmit={onSubmit} className="space-y-8 w-full">
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-3">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    disabled={loading}
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">New Password (optional)</label>
                  <Input
                    disabled={loading}
                    type="password"
                    placeholder="Leave blank to keep current password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Menu Access</label>
                  <p className="text-sm text-gray-500 mb-4">
                    Select which menu items this admin can access. The admin will only see the selected menu items in their sidebar.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {accessOptions.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={option.id}
                          checked={formData.access.includes(option.id)}
                          onCheckedChange={(checked) =>
                            onAccessChange(checked as boolean, option.id)
                          }
                        />
                        <label
                          htmlFor={option.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save changes"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default EditAdminPage;
