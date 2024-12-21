"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CustomerReward } from "@/types/reward"
import { RewardHistoryDialog } from "./reward-history-dialog"

export const columns: ColumnDef<CustomerReward>[] = [
  {
    id: "customerName",
    accessorFn: (row) => {
      const firstName = row.customer?.firstName || '';
      const lastName = row.customer?.lastName || '';
      return `${firstName} ${lastName}`.trim() || 'N/A';
    },
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Customer Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    id: "customerEmail",
    accessorFn: (row) => row.customer?.email || 'N/A',
    header: "Email",
  },
  {
    accessorKey: "points",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Current Points
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const points = row.getValue("points") as number || 0
      return (
        <Badge variant={points > 0 ? "default" : "secondary"}>
          {points} pts
        </Badge>
      )
    },
  },
  {
    accessorKey: "tier",
    header: "Tier",
    cell: ({ row }) => {
      const tier = row.getValue("tier") as string || 'GREEN'
      return (
        <Badge variant="outline" className={
          tier === 'PLATINUM' ? 'bg-purple-100 text-purple-800 border-purple-200' :
          tier === 'GOLD' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
          tier === 'SILVER' ? 'bg-gray-100 text-gray-800 border-gray-200' :
          'bg-orange-100 text-orange-800 border-orange-200'
        }>
          {tier}
        </Badge>
      )
    },
  },
  {
    accessorKey: "totalPointsEarned",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total Earned
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const points = row.getValue("totalPointsEarned") as number || 0
      return (
        <span className="text-green-600">
          +{points} pts
        </span>
      )
    },
  },
  {
    accessorKey: "totalPointsRedeemed",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total Redeemed
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const points = row.getValue("totalPointsRedeemed") as number || 0
      return (
        <span className="text-red-600">
          -{points} pts
        </span>
      )
    },
  },
  {
    id: "history",
    header: "History",
    cell: ({ row }) => {
      const reward = row.original
      const customerName = reward.customer ? 
        `${reward.customer.firstName} ${reward.customer.lastName}`.trim() : 
        'N/A'
      return (
        <RewardHistoryDialog 
          history={reward.history || []} 
          customerName={customerName}
        />
      )
    },
  },
]
