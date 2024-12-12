"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Coupon } from "@/services/coupon.service";

export const columns: ColumnDef<Coupon>[] = [
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => (
      <span className="font-mono uppercase">{row.original.code}</span>
    ),
  },
  {
    accessorKey: "discount",
    header: "Discount",
    cell: ({ row }) => {
      const discount = row.original.discount;
      return (
        <span>
          {discount.type === 'PERCENTAGE' ? `${discount.value}%` : `AED ${discount.value}`}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.original.status === 'ACTIVE';
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {row.original.status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "usageLimit",
    header: "Usage",
    cell: ({ row }) => {
      const used = row.original.usageCount || 0;
      const limit = row.original.usageLimit || '∞';
      return `${used} / ${limit}`;
    },
  },
  {
    accessorKey: "expiresAt",
    header: "Expires",
    cell: ({ row }) => {
      const date = row.original.expiresAt;
      if (!date) return "Never";
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const coupon = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => window.location.href = `/coupons/${coupon.id}`}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.location.href = `/coupons/${coupon.id}/edit`}>
              Edit Coupon
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
