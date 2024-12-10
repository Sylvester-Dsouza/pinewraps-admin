'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';

export type AdminColumn = {
  id: string;
  email: string;
  name: string;
  adminAccess: string[];
  isActive: boolean;
  createdAt: string;
  firebaseUid: string;
};

export const columns: ColumnDef<AdminColumn>[] = [
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'adminAccess',
    header: 'Access',
    cell: ({ row }) => {
      const access = row.original.adminAccess;
      return (
        <div className="flex flex-wrap gap-1">
          {access.map((item) => (
            <Badge key={item} variant="outline">
              {item}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <Badge variant={isActive ? "success" : "destructive"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
