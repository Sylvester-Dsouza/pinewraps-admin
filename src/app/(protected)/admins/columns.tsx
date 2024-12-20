"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type AdminColumn = {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
};

export const columns: ColumnDef<AdminColumn>[] = [
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <Badge
          className={
            role === "SUPER_ADMIN"
              ? "bg-red-100 text-red-800"
              : "bg-blue-100 text-blue-800"
          }
        >
          {role.replace("_", " ")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const admin = row.original;
      const deleteRow = (table.options.meta as any)?.deleteRow;

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
              onClick={() => navigator.clipboard.writeText(admin.id)}
            >
              Copy admin ID
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.location.href = `/admins/${admin.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this administrator?')) {
                  deleteRow?.(admin.id);
                }
              }}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
