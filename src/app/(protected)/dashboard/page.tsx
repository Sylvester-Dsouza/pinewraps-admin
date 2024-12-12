'use client';

import { useEffect, useState } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { AnalyticsCard } from '@/components/ui/analytics-card';
import { ShoppingBag, Users, DollarSign, TrendingUp, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'react-hot-toast';
import { getAuth } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';

interface Analytics {
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  growthRate: number;
}

const timeRanges = [
  { value: '7d', label: 'Last 7 days' },
  { value: '14d', label: 'Last 14 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '3m', label: 'Last 3 months' },
  { value: 'all', label: 'All time' },
];

export default function Page() {
  const [timeRange, setTimeRange] = useState('7d');
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [user] = useAuthState(getAuth());

  const fetchAnalytics = async () => {
    try {
      if (!user) {
        toast.error('Authentication required');
        return;
      }

      setIsRefreshing(true);
      const token = await user.getIdToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/analytics?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.message || 'Failed to fetch analytics');
      }
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch analytics');
      }
      setAnalytics(data.data);
    } catch (error) {
      toast.error('Failed to load analytics data');
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [timeRange, user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <Heading title="Dashboard" description="Welcome to your dashboard" />
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={fetchAnalytics}
            disabled={isRefreshing}
            size="icon"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      <Separator />
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard
          title="Total Orders"
          value={analytics?.totalOrders || 0}
          icon={ShoppingBag}
        />
        <AnalyticsCard
          title="Total Customers"
          value={analytics?.totalCustomers || 0}
          icon={Users}
        />
        <AnalyticsCard
          title="Total Revenue"
          value={analytics?.totalRevenue || 0}
          icon={DollarSign}
          isCurrency
        />
        <AnalyticsCard
          title="Growth Rate"
          value={typeof analytics?.growthRate === 'number' ? analytics.growthRate : 0}
          icon={TrendingUp}
          trend={typeof analytics?.growthRate === 'number' ? {
            value: Math.abs(analytics.growthRate),
            isPositive: analytics.growthRate >= 0
          } : undefined}
        />
      </div>
    </div>
  );
}
