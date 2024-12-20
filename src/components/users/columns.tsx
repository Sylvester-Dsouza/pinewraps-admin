'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, MoreHorizontal, UserCog } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from 'next/navigation';
import { userService } from '@/services/user.service';
import { toast } from 'react-hot-toast';

export type User = {
  id: string;
  name: string | null;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
  phone: string | null;
  gender: string | null;
  birthDate: string | null;
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'email',
    header: 'User',
    cell: ({ row }) => {
      const email = row.getValue('email') as string;
      const name = row.original.name;
      return (
        <div>
          {name && <div className="font-medium">{name}</div>}
          <div className="text-sm text-muted-foreground">{email}</div>
        </div>
      );
    },
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.getValue('role') as string;
      return (
        <Badge
          className={
            role === 'ADMIN'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-blue-100 text-blue-800'
          }
        >
          {role.charAt(0) + role.slice(1).toLowerCase()}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ row }) => {
      const phone = row.getValue('phone') as string;
      return phone || '-';
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Joined Date',
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string;
      if (!date) return '-';
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const router = useRouter();
      const user = row.original;

      const handleRoleChange = async () => {
        try {
          const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
          await userService.updateUserRole(user.id, newRole);
          router.refresh();
        } catch (error) {
          console.error('Error changing role:', error);
          toast.error('Failed to change user role');
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={() => router.push(`/users/${user.id}`)}
            >
              <Eye className="mr-2 h-4 w-4" /> View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleRoleChange}>
              <UserCog className="mr-2 h-4 w-4" /> 
              Make {user.role === 'ADMIN' ? 'User' : 'Admin'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
