'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Product } from '@/types/product';

type ProductActionsProps = {
  onEdit: (productId: string) => void;
  onDelete: (product: Product) => void;
  getStatusBadgeClass: (status: string) => string;
};

export const createColumns = ({ onEdit, onDelete, getStatusBadgeClass }: ProductActionsProps): ColumnDef<Product>[] => [
  {
    accessorKey: 'name',
    header: 'Product Name',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge
          className={getStatusBadgeClass(status)}
        >
          {status.charAt(0) + status.slice(1).toLowerCase()}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'basePrice',
    header: 'Base Price',
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('basePrice') as string);
      return formatPrice(price);
    },
  },
  {
    accessorKey: 'stock',
    header: 'Stock',
    cell: ({ row }) => {
      const variations = row.original.variations || [];
      const totalStock = variations.reduce((sum, variation) => sum + (variation.stock || 0), 0);
      const stockColor = totalStock <= 10 ? 'text-red-600' : 'text-gray-900';
      return <span className={stockColor}>{totalStock} units</span>;
    },
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => row.original.category?.name || 'N/A',
  },
  {
    accessorKey: 'updatedAt',
    header: 'Last Updated',
    cell: ({ row }) => {
      const date = new Date(row.getValue('updatedAt') as string);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const product = row.original;

      return (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(product.id)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => onDelete(product)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
