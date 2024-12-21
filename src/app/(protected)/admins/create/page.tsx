'use client';

import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { CreateAdminForm } from "../components/create-admin-form";
import { PermissionGuard } from "@/components/auth/permission-guard";

export default function CreateAdminPage() {
  return (
    <PermissionGuard permission="ADMIN">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="space-y-4">
          <Heading
            title="Create Admin"
            description="Create a new admin user with specific permissions"
          />
          <Separator />
          <div className="max-w-2xl">
            <CreateAdminForm />
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
