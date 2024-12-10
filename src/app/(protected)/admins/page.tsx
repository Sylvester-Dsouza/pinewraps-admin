"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { auth } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ApiList } from "@/components/ui/api-list";

import { columns, AdminColumn } from "./columns";

export default function AdminsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AdminColumn[]>([]);

  useEffect(() => {
    const fetchAdmins = async () => {
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
          toast.error('You do not have permission to view this page');
          router.push('/');
          return;
        }

        // Fetch admin users
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        const formattedData = response.data.data.map((item: any) => ({
          id: item.id,
          email: item.email,
          name: item.name || "",
          adminAccess: item.adminAccess || [],
          isActive: item.isActive,
          createdAt: new Date(item.createdAt).toLocaleDateString(),
          firebaseUid: item.firebaseUid,
        }));

        setData(formattedData);
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to fetch admins");
        console.error(error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          router.push('/sign-in');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, [router]);

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading
            title="Admins"
            description="Manage admin users and their permissions"
          />
          <Button onClick={() => router.push(`/admins/new`)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
        </div>
        <Separator />
        <DataTable
          columns={columns}
          data={data}
          searchKey="email"
          loading={loading}
        />
      </div>
    </div>
  );
}
