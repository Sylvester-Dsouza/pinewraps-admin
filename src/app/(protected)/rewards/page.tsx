"use client"

import { useEffect, useState } from "react"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, Gift, Users, Coins } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "@/components/rewards/columns"
import toast from 'react-hot-toast'
import axios from 'axios'
import { CustomerReward } from "@/types/reward"
import { getAuth } from 'firebase/auth'
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface RewardsAnalytics {
  totalCustomers: number;
  tierDistribution: {
    tier: string;
    count: number;
  }[];
  points: {
    current: number;
    allTime: number;
  };
  recentActivity: any[];
}

export default function RewardsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState<CustomerReward[]>([]);
  const [analytics, setAnalytics] = useState<RewardsAnalytics>({
    totalCustomers: 0,
    tierDistribution: [],
    points: {
      current: 0,
      allTime: 0
    },
    recentActivity: []
  });

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        toast.error('Not authenticated');
        return;
      }

      const token = await user.getIdToken();
      
      // Fetch rewards analytics
      const analyticsResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/rewards/analytics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (analyticsResponse.data.success) {
        setAnalytics(analyticsResponse.data.data);
      }

      // Fetch all customer rewards with history
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/rewards/customers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        const rewardsData = response.data.data;
        // Ensure we have an array of rewards
        const rewardsArray = Array.isArray(rewardsData) ? rewardsData : [rewardsData];
        
        // Sort history by date for each customer
        const rewardsWithSortedHistory = rewardsArray.map((reward: CustomerReward) => ({
          ...reward,
          history: reward.history?.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ) || []
        }));

        setRewards(rewardsWithSortedHistory);
      }
    } catch (error) {
      console.error('Error fetching rewards:', error);
      toast.error('Failed to fetch rewards data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <Heading title="Rewards" description="Manage customer rewards and points" />
        <div className="flex items-center gap-4">
          <Button onClick={() => router.push('/rewards/new')}>Create Reward</Button>
        </div>
      </div>
      <Separator />
      <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Points Issued
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.points.allTime.toLocaleString()} pts
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Customers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.totalCustomers.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Points
            </CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.points.current.toLocaleString()} pts
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Platinum Members
            </CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(analytics.tierDistribution.find(t => t.tier === 'PLATINUM')?.count || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Customer Rewards</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={rewards} 
            searchKey="customerName"
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
