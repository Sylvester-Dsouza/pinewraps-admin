'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { AnalyticsCard } from '@/components/ui/analytics-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { columns } from '@/components/orders/columns';
import { ShoppingBag, TrendingUp, Clock, CheckCircle2, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { orderService, type Order, type OrderAnalytics } from '@/services/order.service';
import { Input } from '@/components/ui/input';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<OrderAnalytics>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
    monthlyGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrders({
        page,
        limit,
        status: status === 'all' ? undefined : status,
        search: search || undefined,
      });
      
      if (response.success) {
        setOrders(response.data.results);
        setTotal(response.data.pagination.total);
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await orderService.getAnalytics();
      if (response.success && response.data) {
        setAnalytics(response.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch order analytics',
        variant: 'destructive',
      });
      // Set default values for analytics
      setAnalytics({
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        processingOrders: 0,
        completedOrders: 0,
        monthlyGrowth: 0
      });
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, limit, status, search]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleExport = async () => {
    try {
      const blob = await orderService.exportOrders();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Success',
        description: 'Orders exported successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to export orders',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AED'
    }).format(value);
  };

  return (
    <div className="flex-1 space-y-6 p-8 bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
          <p className="mt-1 text-sm text-gray-500">Manage and track your orders</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleExport}>Export Orders</Button>
          <Button>Create Order</Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard
          title="Total Orders"
          value={(analytics?.totalOrders ?? 0).toString()}
          description="All time orders"
          icon={ShoppingBag}
          className="bg-white shadow-sm hover:shadow-md transition-shadow"
        />
        <AnalyticsCard
          title="Total Revenue"
          value={formatCurrency(analytics?.totalRevenue ?? 0)}
          description="All time revenue"
          icon={TrendingUp}
          trend={analytics?.monthlyGrowth ? {
            value: analytics.monthlyGrowth,
            isPositive: analytics.monthlyGrowth > 0
          } : undefined}
          className="bg-white shadow-sm hover:shadow-md transition-shadow"
        />
        <AnalyticsCard
          title="Pending Orders"
          value={(analytics?.pendingOrders ?? 0).toString()}
          description="Awaiting processing"
          icon={Clock}
          className="bg-white shadow-sm hover:shadow-md transition-shadow"
        />
        <AnalyticsCard
          title="Completed Orders"
          value={(analytics?.completedOrders ?? 0).toString()}
          description="Successfully delivered"
          icon={CheckCircle2}
          className="bg-white shadow-sm hover:shadow-md transition-shadow"
        />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          <div className="flex items-center gap-3">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <DataTable
          columns={columns}
          data={orders}
          loading={loading}
          pagination={{
            page,
            pageSize: limit,
            total,
            onPageChange: setPage,
          }}
        />
      </div>
    </div>
  );
}
