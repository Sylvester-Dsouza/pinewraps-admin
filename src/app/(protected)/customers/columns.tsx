"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, ShoppingBag } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Customer } from "@/services/customer.service";
import { useRouter } from "next/navigation";

export const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const firstName = row.original.firstName || '';
      const lastName = row.original.lastName || '';
      const fullName = firstName || lastName ? `${firstName} ${lastName}`.trim() : '-';
      const router = useRouter();
      
      return (
        <Button 
          variant="link" 
          className="p-0 h-auto font-normal"
          onClick={() => router.push(`/customers/${row.original.id}`)}
        >
          {fullName}
        </Button>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => row.original.phone || "-",
  },
  {
    accessorKey: "reward.points",
    header: "Points",
    cell: ({ row }) => row.original.reward?.points || 0,
  },
  {
    accessorKey: "reward.tier",
    header: "Tier",
    cell: ({ row }) => (
      <Badge variant={getTierVariant(row.original.reward?.tier)}>
        {row.original.reward?.tier || "BRONZE"}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => {
      return new Date(row.original.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const router = useRouter();
      const customer = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/customers/${customer.id}`)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/orders?customerId=${customer.id}`)}>
              <ShoppingBag className="mr-2 h-4 w-4" />
              View Orders
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

function getTierVariant(tier?: string) {
  switch (tier) {
    case 'PLATINUM':
      return 'default';
    case 'GOLD':
      return 'warning';
    case 'SILVER':
      return 'secondary';
    default:
      return 'outline';
  }
}
