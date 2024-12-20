"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CustomerReward } from "@/types/reward"

export const columns: ColumnDef<CustomerReward>[] = [
  {
    accessorKey: "customer.name",
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
    accessorKey: "customer.email",
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
      const points = row.getValue("points") as number
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
      const tier = row.getValue("tier") as string
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
      const points = row.getValue("totalPointsEarned") as number
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
      const points = row.getValue("totalPointsRedeemed") as number
      return (
        <span className="text-red-600">
          -{points} pts
        </span>
      )
    },
  },
  {
    accessorKey: "history",
    header: "Latest Activity",
    cell: ({ row }) => {
      const history = row.getValue("history") as CustomerReward["history"]
      const latest = history[0]
      if (!latest) return "No activity"
      
      return (
        <div className="flex flex-col gap-1">
          <span className={latest.type === 'EARNED' ? 'text-green-600' : 'text-red-600'}>
            {latest.type === 'EARNED' ? '+' : '-'}{latest.points} pts
          </span>
          <span className="text-sm text-gray-500">
            {new Date(latest.createdAt).toLocaleDateString()}
          </span>
        </div>
      )
    },
  },
]
