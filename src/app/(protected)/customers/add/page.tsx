'use client';

import { useRouter } from 'next/navigation';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { UserForm } from '@/components/users/user-form';

export default function AddUserPage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    // Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading title="Add New User" description="Create a new user account" />
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/users')}
            className="h-10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
        </div>
        <Separator />
        
        <UserForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
