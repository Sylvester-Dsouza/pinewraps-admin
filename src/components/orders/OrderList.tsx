'use client';

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const orders = [
  {
    id: "1",
    number: "ORD-001",
    customer: "John Doe",
    status: "Pending",
    total: 150
  },
  {
    id: "2",
    number: "ORD-002",
    customer: "Jane Smith",
    status: "Completed",
    total: 250
  }
];

export default function OrderList() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Orders</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.number}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell className="text-right">AED {order.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
