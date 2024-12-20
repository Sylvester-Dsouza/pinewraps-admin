'use client';

import { useState } from 'react';
import { Edit, MoreHorizontal, Trash, ShoppingBag } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AlertModal } from '@/components/modals/alert-modal';
import { UserColumn } from './columns';
import { usersApi } from '@/lib/api';

interface CellActionProps {
  data: UserColumn;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const onDelete = async () => {
    try {
      setLoading(true);
      await usersApi.delete(data.id);
      router.refresh();
      toast.success('Customer deleted.');
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => router.push(`/users/${data.id}`)}>
            <Edit className="mr-2 h-4 w-4" /> View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(`/users/${data.id}/orders`)}>
            <ShoppingBag className="mr-2 h-4 w-4" /> View Orders
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
