'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { customerService, type Customer } from '@/services/customer.service';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const [rewardPoints, setRewardPoints] = useState<number>(0);

  useEffect(() => {
    if (params.customerId) {
      loadCustomer();
      loadRewardPoints();
    }
  }, [params.customerId]);

  const loadCustomer = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await customerService.getCustomer(params.customerId as string);
      setCustomer(response.data);
    } catch (error) {
      console.error('Error loading customer:', error);
      setError('Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

  const loadRewardPoints = async () => {
    if (!params.customerId) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rewards/${params.customerId}`, {
        headers: {
          'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRewardPoints(data.data.points || 0);
      }
    } catch (error) {
      console.error('Error loading reward points:', error);
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

      await loadRewardPoints();
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
          <Button onClick={loadCustomer}>Try Again</Button>
        </div>
      ) : customer && (
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Customer Details</h1>
              <p className="text-sm text-muted-foreground">
                View and manage customer information
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/users')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customers
            </Button>
          </div>

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
                  <Input value={customer.name || ''} readOnly />
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
              </CardContent>
            </Card>

            {/* Role Management */}
            <Card>
              <CardHeader>
                <CardTitle>Role & Permissions</CardTitle>
                <CardDescription>Manage customer access level</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>User Role</Label>
                  <Select
                    value={customer.role}
                    disabled={true}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator className="my-4" />

                <div className="space-y-4">
                  <Label>Account Status</Label>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label>Account Created</Label>
                      <div className="text-sm text-muted-foreground">
                        {new Date(customer.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reward Points Section */}
            <Card>
              <CardHeader>
                <CardTitle>Reward Points</CardTitle>
                <CardDescription>Manage customer reward points and loyalty tier</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Current Status */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Current Points</Label>
                      <div className="text-3xl font-bold">{rewardPoints}</div>
                    </div>
                    <div className="space-y-2">
                      <Label>Total Points Earned</Label>
                      <div className="text-3xl font-bold text-muted-foreground">
                        {customer.reward?.totalPoints || 0}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Loyalty Tier</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          {customer.reward?.tier || 'BRONZE'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Add Points Form */}
                  <div className="space-y-4">
                    <Label>Add Points</Label>
                    <div className="flex gap-4">
                      <div className="flex-1 space-y-2">
                        <Input
                          type="number"
                          min="0"
                          value={pointsToAdd}
                          onChange={(e) => setPointsToAdd(parseInt(e.target.value) || 0)}
                          placeholder="Enter points to add"
                        />
                        <p className="text-sm text-muted-foreground">
                          Points will be added to the customer's current balance
                        </p>
                      </div>
                      <Button 
                        onClick={handleAddPoints} 
                        disabled={pointsToAdd <= 0 || savingPoints}
                        className="h-10"
                      >
                        {savingPoints ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adding Points...
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

                  <Separator />

                  {/* Points History */}
                  {customer.reward?.history && customer.reward.history.length > 0 ? (
                    <div className="space-y-4">
                      <Label>Points History</Label>
                      <div className="space-y-2">
                        {customer.reward.history.map((record, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div className="space-y-1">
                              <p className="font-medium">
                                {record.type === 'EARNED' ? '+' : '-'}{record.points} points
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {record.description}
                              </p>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(record.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
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
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            {customer.notifications ? (
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
                      <Switch checked={customer.notifications.orderUpdates} disabled />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Promotions</Label>
                        <div className="text-sm text-muted-foreground">
                          Receive promotional offers
                        </div>
                      </div>
                      <Switch checked={customer.notifications.promotions} disabled />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Newsletter</Label>
                        <div className="text-sm text-muted-foreground">
                          Subscribe to newsletter
                        </div>
                      </div>
                      <Switch checked={customer.notifications.newsletter} disabled />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>SMS Updates</Label>
                        <div className="text-sm text-muted-foreground">
                          Receive SMS notifications
                        </div>
                      </div>
                      <Switch checked={customer.notifications.sms} disabled />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Addresses */}
            {customer.addresses && customer.addresses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Addresses</CardTitle>
                  <CardDescription>Customer's saved addresses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {customer.addresses.map((address) => (
                    <div
                      key={address.id}
                      className="rounded-lg border p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <Label>Delivery Address</Label>
                        {address.isDefault && (
                          <Badge variant="outline">Default</Badge>
                        )}
                      </div>
                      <div className="text-sm space-y-1 text-muted-foreground">
                        <p>{address.street}</p>
                        {address.apartment && <p>{address.apartment}</p>}
                        <p>{address.emirates.replace(/_/g, ' ')}</p>
                        <p>{address.postalCode}</p>
                        <p>{address.country}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
