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

export default function RewardsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState<CustomerReward[]>([]);
  const [analytics, setAnalytics] = useState({
    totalPoints: 0,
    totalCustomers: 0,
    averagePoints: 0,
    activeCustomers: 0,
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

      setAnalytics(analyticsResponse.data);

      // Fetch all customer rewards
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/rewards`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRewards(response.data);
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
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <Heading title="Rewards" description="Manage your reward programs" />
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
              {analytics.totalPoints.toLocaleString()} pts
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
              Average Points
            </CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.averagePoints.toLocaleString()} pts
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Customers
            </CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.activeCustomers.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable 
        columns={columns} 
        data={rewards} 
        searchKey="customer.name"
        loading={loading}
      />
    </div>
  );
}
