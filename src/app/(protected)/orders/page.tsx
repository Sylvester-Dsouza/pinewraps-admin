'use client';

import { useEffect, useState, useCallback } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { AnalyticsCard } from '@/components/ui/analytics-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { columns } from '@/components/orders/columns';
import { ShoppingBag, TrendingUp, Clock, CheckCircle2, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { orderService, type Order, type OrderAnalytics } from '@/services/order.service';
import { Input } from '@/components/ui/input';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';

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
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const { toast } = useToast();

  const fetchOrders = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const response = await orderService.getOrders({
        page,
        limit,
        status: status === 'all' ? undefined : status,
        search: search || undefined,
      });
      
      console.log('Orders API Response:', {
        success: response.success,
        data: response.data,
        pagination: response.data?.pagination,
        resultsLength: response.data?.results?.length,
      });
      
      if (response.success && response.data) {
        // Debug log for first order
        if (response.data.results?.[0]) {
          console.log('First Order Structure:', {
            id: response.data.results[0].id,
            orderNumber: response.data.results[0].orderNumber,
            customer: response.data.results[0].customer,
            items: response.data.results[0].items,
            status: response.data.results[0].status,
            total: response.data.results[0].total,
          });
        }

        const processedOrders = response.data.results?.map(order => ({
          ...order,
          customer: {
            id: order.customer?.id,
            name: order.customer?.firstName && order.customer?.lastName 
              ? `${order.customer.firstName} ${order.customer.lastName}`
              : 'Unknown Customer',
            email: order.customer?.email || '',
            phone: order.customerPhone || order.customer?.phone || '',
          },
          total: Number(order.total) || 0,
          items: Array.isArray(order.items) ? order.items : [],
        })) || [];

        console.log('Processed Orders:', processedOrders);
        
        setOrders(processedOrders);
        setTotal(response.data.pagination?.total || 0);
        
        if (isRefresh) {
          toast({
            title: 'Updated',
            description: 'Orders list has been refreshed',
          });
        }
      } else {
        console.log('No orders data in response:', response);
        setOrders([]);
        setTotal(0);
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch orders',
        variant: 'destructive',
      });
      setOrders([]);
      setTotal(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, limit, status, search, toast]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await orderService.getAnalytics();
      console.log('Analytics API Response:', response); // Debug log
      if (response.success && response.data) {
        setAnalytics(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch order analytics',
        variant: 'destructive',
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Set up polling for new orders
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders(true);
      fetchAnalytics();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [fetchOrders, fetchAnalytics]);

  const handleRefresh = () => {
    fetchOrders(true);
    fetchAnalytics();
  };

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
      console.error('Error exporting orders:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to export orders',
        variant: 'destructive',
      });
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page when searching
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1); // Reset to first page when changing status
  };

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <Heading title="Orders" description="Manage your orders" />
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={handleExport}>Export Orders</Button>
        </div>
      </div>
      <Separator />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard
          title="Total Orders"
          value={analytics.totalOrders}
          icon={ShoppingBag}
        />
        <AnalyticsCard
          title="Total Revenue"
          value={analytics.totalRevenue}
          isCurrency
          icon={TrendingUp}
          trend={analytics.monthlyGrowth ? {
            value: analytics.monthlyGrowth,
            isPositive: analytics.monthlyGrowth > 0
          } : undefined}
        />
        <AnalyticsCard
          title="Pending Orders"
          value={analytics.pendingOrders}
          icon={Clock}
        />
        <AnalyticsCard
          title="Completed Orders"
          value={analytics.completedOrders}
          icon={CheckCircle2}
        />
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-4 md:max-w-sm">
          <div className="flex-1">
            <Input
              placeholder="Search orders..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="max-w-sm"
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]">
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
        meta={{
          refreshData: () => {
            fetchOrders(true);
            fetchAnalytics();
          }
        }}
      />
    </div>
  );
}
