'use client';

import { useRouter } from 'next/navigation';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { UserForm } from '@/components/users/user-form';

export default function EditUserPage({ params }: { params: { userId: string } }) {
  const router = useRouter();

  // Mock data - Replace with actual API call
  const mockUser = {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'customer',
    rewardPoints: 100,
  };

  const handleSubmit = async (data: any) => {
    // Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading title="Edit User" description="Modify user account details" />
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
        
        <UserForm 
          initialData={mockUser}
          onSubmit={handleSubmit}
          isEdit
        />
      </div>
    </div>
  );
}
