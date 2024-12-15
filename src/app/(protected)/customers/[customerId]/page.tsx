'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { customerService, type Customer, type RewardHistory } from '@/services/customer.service';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { auth } from '@/lib/firebase';
import { Heading } from '@/components/ui/heading';

export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pointsToAdd, setPointsToAdd] = useState<number>(0);
  const [savingPoints, setSavingPoints] = useState(false);
  const [rewardPoints, setRewardPoints] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [rewardTier, setRewardTier] = useState('BRONZE');
  const [rewardHistory, setRewardHistory] = useState<RewardHistory[]>([]);

  useEffect(() => {
    if (params.customerId) {
      loadData();
    }
  }, [params.customerId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load customer details
      const customerResponse = await customerService.getCustomer(params.customerId as string);
      setCustomer(customerResponse.data);

      // Load reward details
      const rewardResponse = await customerService.getCustomerReward(params.customerId as string);
      setRewardPoints(rewardResponse.data.points);
      setTotalPoints(rewardResponse.data.totalPoints);
      setRewardTier(rewardResponse.data.tier);

      // Load reward history
      const historyResponse = await customerService.getCustomerRewardHistory(params.customerId as string);
      setRewardHistory(historyResponse.data.history);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPoints = async () => {
    if (!params.customerId) return;

    try {
      setSavingPoints(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rewards/${params.customerId}/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          points: pointsToAdd,
          description: 'Points added by admin'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add points');
      }

      // Reload reward data after adding points
      const rewardResponse = await customerService.getCustomerReward(params.customerId);
      setRewardPoints(rewardResponse.data.points);
      setTotalPoints(rewardResponse.data.totalPoints);
      setRewardTier(rewardResponse.data.tier);

      // Reload history
      const historyResponse = await customerService.getCustomerRewardHistory(params.customerId);
      setRewardHistory(historyResponse.data.history);

      setPointsToAdd(0);
      toast.success('Points added successfully');
    } catch (error) {
      console.error('Error adding points:', error);
      toast.error('Failed to add points');
    } finally {
      setSavingPoints(false);
    }
  };

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <Heading title="Customer Details" description="View and manage customer information" />
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
      <Separator />
      
      {loading ? (
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex h-[400px] flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={loadData}>Try Again</Button>
        </div>
      ) : customer && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Customer's personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={customer.email} readOnly />
              </div>

              <div className="space-y-2">
                <Label>Name</Label>
                <Input 
                  value={`${customer.firstName || ''} ${customer.lastName || ''}`.trim() || '-'} 
                  readOnly 
                />
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={customer.phone || ''} readOnly />
              </div>

              <div className="space-y-2">
                <Label>Birth Date</Label>
                <Input 
                  type="date" 
                  value={customer.birthDate ? new Date(customer.birthDate).toISOString().split('T')[0] : ''} 
                  readOnly 
                />
              </div>

              <Separator className="my-4" />

              {/* Rewards Section */}
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Current Points</Label>
                    <div className="text-2xl font-bold">
                      {rewardPoints}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Total Points</Label>
                    <div className="text-2xl font-bold text-muted-foreground">
                      {totalPoints}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Tier</Label>
                    <div className="space-y-2">
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        {rewardTier}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {rewardTier === 'BRONZE' && 'Earn 7% points on all orders'}
                        {rewardTier === 'SILVER' && 'Earn 12% points on all orders + Free shipping on orders over 50 AED'}
                        {rewardTier === 'GOLD' && 'Earn 15% points on all orders + Free shipping on all orders'}
                        {rewardTier === 'PLATINUM' && 'Earn 20% points on all orders + Free shipping + Priority support'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Add Points Form */}
                <div className="space-y-4">
                  <Label>Add Points</Label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input
                        type="number"
                        min="0"
                        value={pointsToAdd}
                        onChange={(e) => setPointsToAdd(parseInt(e.target.value) || 0)}
                        placeholder="Enter points to add"
                      />
                    </div>
                    <Button 
                      onClick={handleAddPoints} 
                      disabled={pointsToAdd <= 0 || savingPoints}
                    >
                      {savingPoints ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Add Points
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Customer's notification settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Order Updates</Label>
                    <div className="text-sm text-muted-foreground">
                      Receive updates about order status
                    </div>
                  </div>
                  <Switch checked={customer.notifications?.orderUpdates} disabled />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Promotions</Label>
                    <div className="text-sm text-muted-foreground">
                      Receive promotional offers and deals
                    </div>
                  </div>
                  <Switch checked={customer.notifications?.promotions} disabled />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Newsletter</Label>
                    <div className="text-sm text-muted-foreground">
                      Subscribe to our newsletter
                    </div>
                  </div>
                  <Switch checked={customer.notifications?.newsletter} disabled />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Updates</Label>
                    <div className="text-sm text-muted-foreground">
                      Receive updates via SMS
                    </div>
                  </div>
                  <Switch checked={customer.notifications?.sms} disabled />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Points History */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Points History</CardTitle>
              <CardDescription>History of points earned and redeemed</CardDescription>
            </CardHeader>
            <CardContent>
              {rewardHistory.length > 0 ? (
                <div className="space-y-6">
                  {/* Points Summary */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Total Points Earned</div>
                      <div className="text-2xl font-bold text-green-600">
                        +{rewardHistory.reduce((sum, record) => sum + (record.pointsEarned || 0), 0)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Total Points Redeemed</div>
                      <div className="text-2xl font-bold text-red-600">
                        -{rewardHistory.reduce((sum, record) => sum + (record.pointsRedeemed || 0), 0)}
                      </div>
                    </div>
                  </div>

                  {/* History List */}
                  <div className="space-y-4">
                    {rewardHistory.map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {record.pointsEarned > 0 && (
                              <span className="text-green-600 font-medium">
                                +{record.pointsEarned} earned
                              </span>
                            )}
                            {record.pointsRedeemed > 0 && (
                              <span className="text-red-600 font-medium">
                                -{record.pointsRedeemed} redeemed
                              </span>
                            )}
                            {record.orderTotal > 0 && (
                              <span className="text-sm text-muted-foreground">
                                (Order: AED {record.orderTotal})
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {record.description}
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(record.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No points history available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
