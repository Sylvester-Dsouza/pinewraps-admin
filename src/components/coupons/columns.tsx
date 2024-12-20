"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowUpDown, MoreHorizontal, Trash } from "lucide-react"
import { Coupon } from "@/api/coupons"
import { formatDate } from "@/lib/utils"

export const columns: ColumnDef<Coupon>[] = [
  {
    accessorKey: "code",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Code
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      return type === "PERCENTAGE" ? "Percentage" : "Fixed Amount"
    },
  },
  {
    accessorKey: "value",
    header: "Value",
    cell: ({ row }) => {
      const value = row.getValue("value") as number
      const type = row.original.type
      return type === "PERCENTAGE" ? `${value}%` : `$${value.toFixed(2)}`
    },
  },
  {
    accessorKey: "usageCount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Uses
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const usageCount = row.getValue("usageCount") as number
      const usageLimit = row.original.usageLimit
      return usageLimit ? `${usageCount}/${usageLimit}` : usageCount
    },
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => formatDate(row.original.startDate),
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => {
      const date = row.original.endDate
      return date ? formatDate(date) : "-"
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      return (
        <Badge
          variant={
            status === "ACTIVE"
              ? "success"
              : status === "INACTIVE"
              ? "secondary"
              : "destructive"
          }
        >
          {status}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const coupon = row.original

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
              onClick={() => {
                if (row.original.onEdit) {
                  row.original.onEdit(coupon)
                }
              }}
            >
              Edit Details
            </DropdownMenuItem>
            {coupon.status !== "EXPIRED" && (
              <DropdownMenuItem
                onClick={() => {
                  if (row.original.onStatusChange) {
                    row.original.onStatusChange(
                      coupon.id,
                      coupon.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
                    )
                  }
                }}
              >
                {coupon.status === "ACTIVE" ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => {
                if (row.original.onDelete) {
                  row.original.onDelete(coupon.id)
                }
              }}
            >
              <Trash className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
