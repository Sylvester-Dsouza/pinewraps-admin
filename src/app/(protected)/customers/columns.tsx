'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';

export type UserColumn = {
  id: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  createdAt: string;
  lastOrderDate?: string;
  totalOrders?: number;
};

export const columns: ColumnDef<UserColumn>[] = [
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'displayName',
    header: 'Name',
  },
  {
    accessorKey: 'phoneNumber',
    header: 'Phone',
  },
  {
    accessorKey: 'lastOrderDate',
    header: 'Last Order',
  },
  {
    accessorKey: 'totalOrders',
    header: 'Total Orders',
  },
  {
    accessorKey: 'createdAt',
    header: 'Joined Date',
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
