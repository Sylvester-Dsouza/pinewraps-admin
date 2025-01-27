'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from "@/components/ui/separator";
import Image from 'next/image';
import api from '@/lib/api';
import { 
  ArrowLeft, Calendar, MapPin, Phone, Mail, Truck, Clock, 
  FileText, AlertCircle, Package, DollarSign, CreditCard, 
  Gift, MessageSquare, ShoppingCart, Loader2, User, ArrowRight, Store 
} from 'lucide-react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { orderService, type Order, type OrderStatus, type OrderItem } from '@/services/order.service';
import { useRouter } from 'next/navigation';

export default function OrderDetailsPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderSnapshot, setOrderSnapshot] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>(order?.status || 'PENDING');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingPaymentStatus, setIsUpdatingPaymentStatus] = useState(false);
  const [isSendingPaymentLink, setIsSendingPaymentLink] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const fetchOrder = async () => {
    try {
      setLoading(true);
      if (!params.orderId) {
        throw new Error('Order ID is required');
      }

      const orderResponse = await orderService.getOrder(params.orderId as string);
      
      if (orderResponse) {
        console.log('Order Response:', JSON.stringify(orderResponse, null, 2)); // Debug log
        setOrder(orderResponse);
        setSelectedStatus(orderResponse.status as string);
        setSelectedPaymentStatus(orderResponse.payment?.status || '');
      }

      try {
        const snapshotResponse = await orderService.getOrderSnapshot(params.orderId as string);
        if (snapshotResponse) {
          console.log('Snapshot Response:', JSON.stringify(snapshotResponse, null, 2)); // Debug log
          setOrderSnapshot(snapshotResponse);
        }
      } catch (snapshotError) {
        console.warn('Order snapshot not found:', snapshotError);
      }

    } catch (error: any) {
      console.error('Error fetching order:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch order details",
        variant: "destructive"
      });
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Current order state:', order); // Debug log
    console.log('Current snapshot state:', orderSnapshot); // Debug log
  }, [order, orderSnapshot]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AED'
    }).format(value);
  };

  const formatPaymentMethod = (method: string | undefined) => {
    if (!method) return 'Not specified';
    
    const methodMap: Record<string, string> = {
      'CREDIT_CARD': 'Credit Card',
      'DEBIT_CARD': 'Debit Card',
      'BANK_TRANSFER': 'Bank Transfer',
      'CASH': 'Cash',
      'OTHER': 'Other'
    };
    
    return methodMap[method] || method;
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200',
      READY_FOR_PICKUP: 'bg-purple-50 text-purple-700 border-purple-200',
      OUT_FOR_DELIVERY: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      DELIVERED: 'bg-green-50 text-green-700 border-green-200',
      COMPLETED: 'bg-green-50 text-green-700 border-green-200',
      CANCELLED: 'bg-red-50 text-red-700 border-red-200',
      REFUNDED: 'bg-gray-50 text-gray-700 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatStatus = (status: string | undefined) => {
    if (!status) return '';
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'authorized':
        return 'bg-blue-100 text-blue-800';
      case 'captured':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string | undefined | null) => {
    if (!date) return '';
    try {
      return format(parseISO(date), 'PPp');
    } catch (error) {
      console.error('Error formatting date:', error);
      return date;
    }
  };

  const formatDeliveryDate = (dateString?: string | Date | null) => {
    if (!dateString) return 'Not specified';
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
      return format(date, 'MMMM d, yyyy');
    } catch (error) {
      console.error('Error formatting delivery date:', error);
      return 'Invalid date';
    }
  };

  const formatAddress = (order?: any) => {
    if (!order) return 'No address provided';
    
    const parts = [
      order.streetAddress,
      order.apartment && `Apartment ${order.apartment}`,
      order.city,
      order.emirate,
      order.country,
      order.pincode
    ].filter(Boolean);

    return parts.join('\n');
  };

  const formatVariant = (variant: string) => {
    // Split the variant string by semicolon if multiple variations exist
    const variations = variant.split(';');
    
    return variations.map(variation => {
      // Split each variation into type and value
      const [type, value] = variation.split(':').map(part => part.trim());
      
      if (!value) return type; // Return just the type if no value exists
      
      // Capitalize the type and value
      const formattedType = type
        .replace(/[_-]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      const formattedValue = value
        .replace(/[_-]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      return `${formattedType} - ${formattedValue}`;
    }).join('\n');
  };

  const renderOrderItems = () => {
    if (!order?.items) return null;
    
    const items: OrderItem[] = typeof order.items === 'string' 
      ? JSON.parse(order.items) 
      : order.items;

    return items.map((item, index) => (
      <div key={index} className="flex items-start justify-between py-4 border-b last:border-0">
        <div className="flex items-start space-x-4">
          <div className="flex items-center justify-center h-24 w-24 rounded-lg bg-gray-100">
            <ShoppingCart className="h-8 w-8 text-gray-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{item.name}</h3>
                {item.variant && (
                  <p className="text-sm text-gray-500 whitespace-pre-line">{formatVariant(item.variant)}</p>
                )}
                {item.cakeWriting && (
                  <div className="mt-1 p-2 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Cake Message:</span> {item.cakeWriting}
                    </p>
                  </div>
                )}
                <div className="mt-1 flex items-center gap-4">
                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  <p className="text-sm text-gray-500">Price: {formatCurrency(item.price)}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
          </div>
        </div>
      </div>
    ));
  };

  const calculateSubtotal = (items: any) => {
    if (!items) return 0;
    const parsedItems: OrderItem[] = typeof items === 'string' ? JSON.parse(items) : items;
    return parsedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value as OrderStatus);
  };

  const updateOrderStatus = async (newStatus: string) => {
    try {
      setIsUpdatingStatus(true);
      const updatedOrder = await orderService.updateOrderStatus(params.orderId as string, newStatus);
      
      // Update the order state with the new data
      setOrder(updatedOrder);
      setSelectedStatus(updatedOrder.status as string);
      
      toast({
        title: "Status Updated",
        description: `Order status has been updated to ${formatStatus(newStatus)}`,
      });
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive"
      });
      // Reset the selected status to the current order status
      if (order) {
        setSelectedStatus(order.status as string);
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSendPaymentLink = async () => {
    try {
      setIsSendingPaymentLink(true);
      await orderService.sendPaymentLink(params.orderId as string);
      toast({
        title: "Success",
        description: "Payment link sent to customer",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send payment link",
        variant: "destructive"
      });
    } finally {
      setIsSendingPaymentLink(false);
    }
  };

  const handlePaymentStatusChange = async (newStatus: string) => {
    try {
      setIsUpdatingPaymentStatus(true);
      await orderService.updatePaymentStatus(params.orderId as string, newStatus);
      setSelectedPaymentStatus(newStatus);
      await fetchOrder(); // Refresh order data
      toast({
        title: "Success",
        description: "Payment status updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update payment status",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingPaymentStatus(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [params.orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading order details...</span>
        </div>
      </div>
    );
  }

  if (!order || !orderSnapshot) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <h2 className="text-lg font-medium">Order not found</h2>
          <p className="text-gray-500 mt-1">The requested order could not be found.</p>
          <Link href="/orders" className="mt-4 inline-block">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Link href="/orders">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold">Order #{order.orderNumber}</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-gray-500">{formatDate(order.createdAt || order.date)}</p>
                <span className="text-gray-300">•</span>
                <Badge 
                  variant="outline" 
                  className={order?.deliveryMethod === 'PICKUP' 
                    ? "bg-purple-50 text-purple-700 border-purple-200 text-sm"
                    : "bg-blue-50 text-blue-700 border-blue-200 text-sm"
                  }
                >
                  {order?.deliveryMethod === 'PICKUP' ? 'Store Pickup' : 'Delivery'}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-4">
              <Select 
                value={selectedStatus} 
                onValueChange={handleStatusChange}
                disabled={isUpdatingStatus}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue>
                    {selectedStatus && (
                      <Badge variant="outline" className={getStatusColor(selectedStatus)}>
                        {formatStatus(selectedStatus)}
                      </Badge>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      Pending
                    </Badge>
                  </SelectItem>
                  <SelectItem value="PROCESSING">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Processing
                    </Badge>
                  </SelectItem>
                  <SelectItem value="READY_FOR_PICKUP">
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      Ready for Pickup
                    </Badge>
                  </SelectItem>
                  <SelectItem value="OUT_FOR_DELIVERY">
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                      Out for Delivery
                    </Badge>
                  </SelectItem>
                  <SelectItem value="DELIVERED">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Delivered
                    </Badge>
                  </SelectItem>
                  <SelectItem value="COMPLETED">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Completed
                    </Badge>
                  </SelectItem>
                  <SelectItem value="CANCELLED">
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      Cancelled
                    </Badge>
                  </SelectItem>
                  <SelectItem value="REFUNDED">
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                      Refunded
                    </Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="secondary"
                disabled={isUpdatingStatus || selectedStatus === order.status}
                onClick={() => updateOrderStatus(selectedStatus)}
              >
                {isUpdatingStatus ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Update Status'
                )}
              </Button>
              <Button variant="outline">Print Order</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Order Details */}
          <div className="col-span-2 space-y-6">
            {/* Order Summary Card */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Order Summary</h2>
                <Badge 
                  variant="outline" 
                  className={getStatusColor(order?.status)}
                >
                  {formatStatus(order?.status)}
                </Badge>
              </div>
　
　
              <div className="divide-y divide-gray-200">
                {renderOrderItems()}
              </div>

              {/* Price Breakdown */}
              <div className="mt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatCurrency(calculateSubtotal(order.items))}</span>
                </div>

                {/* Coupon Discount */}
                {(order.couponCode || order.pricing?.couponDiscount) && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Gift className="h-4 w-4" />
                      Coupon Discount {order.couponCode && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                          {order.couponCode}
                        </span>
                      )}
                    </span>
                    <span className="text-red-600">
                      -{formatCurrency(order.pricing?.couponDiscount || 0)}
                    </span>
                  </div>
                )}

                {/* Points Redemption */}
                {(order.pricing?.pointsRedeemed || order.pricing?.pointsValue) && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Rewards Points ({order.pricing?.pointsRedeemed || 0} points)
                    </span>
                    <span className="text-red-600">
                      -{formatCurrency(order.pricing?.pointsValue || 0)}
                    </span>
                  </div>
                )}

                {/* Delivery Charge */}
                {(order.delivery?.charge || order.pricing?.deliveryCharge) && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Delivery Charge
                      {order.deliveryMethod && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-700">
                          {order.deliveryMethod}
                        </span>
                      )}
                    </span>
                    <span>{formatCurrency(order.delivery?.charge || order.pricing?.deliveryCharge || 0)}</span>
                  </div>
                )}

                <Separator className="my-2" />

                {/* Total */}
                <div className="flex justify-between text-base font-medium">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>

                {/* Savings Summary */}
                {(order.pricing?.couponDiscount || order.pricing?.pointsValue) && (
                  <div className="mt-2 p-2 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700 flex items-center gap-2">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Total Savings: {formatCurrency(
                        (order.pricing?.couponDiscount || 0) +
                        (order.pricing?.pointsValue || 0)
                      )}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Delivery Details Block */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {order?.deliveryMethod === 'PICKUP' ? (
                    <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                      <Store className="h-5 w-5 text-purple-600" />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <Truck className="h-5 w-5 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-semibold">
                      {order?.deliveryMethod === 'PICKUP' ? 'Store Pickup' : 'Delivery'} Details
                    </h2>
                    <p className="text-sm text-gray-500">
                      {order?.deliveryMethod === 'PICKUP' 
                        ? 'Pickup from store location'
                        : 'Delivery to specified address'
                      }
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className={
                  order?.deliveryMethod === 'PICKUP'
                    ? "bg-purple-50 text-purple-700 border-purple-200"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }>
                  {order?.deliveryMethod === 'PICKUP' ? 'Store Pickup' : 'Delivery'}
                </Badge>
              </div>

              {order?.deliveryMethod === 'PICKUP' ? (
                <div className="space-y-6">
                  {/* Pickup Schedule */}
                  <div className="grid grid-cols-2 gap-6 p-4 bg-purple-50/50 rounded-lg border border-purple-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-purple-700">
                        <Calendar className="h-4 w-4" />
                        <p className="text-sm font-medium">Pickup Date</p>
                      </div>
                      <p className="text-base pl-6">
                        {formatDeliveryDate(order?.pickupDate)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-purple-700">
                        <Clock className="h-4 w-4" />
                        <p className="text-sm font-medium">Pickup Time</p>
                      </div>
                      <p className="text-base pl-6">
                        {order?.pickupTimeSlot || 'Not specified'}
                      </p>
                    </div>
                  </div>

                  {/* Store Location */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Store className="h-4 w-4" />
                      <p className="text-sm font-medium">Store Location</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <p className="text-base">{order?.storeLocation || 'Location not specified'}</p>
                    </div>
                  </div>

                  {/* Pickup Instructions */}
                  {order?.deliveryInstructions && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-gray-700">
                        <MessageSquare className="h-4 w-4" />
                        <p className="text-sm font-medium">Pickup Instructions</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <p className="text-base">{order.deliveryInstructions}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Delivery Schedule */}
                  <div className="grid grid-cols-2 gap-6 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-blue-700">
                        <Calendar className="h-4 w-4" />
                        <p className="text-sm font-medium">Delivery Date</p>
                      </div>
                      <p className="text-base pl-6">
                        {formatDeliveryDate(order?.deliveryDate)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-blue-700">
                        <Clock className="h-4 w-4" />
                        <p className="text-sm font-medium">Delivery Time</p>
                      </div>
                      <p className="text-base pl-6">
                        {order?.deliveryTimeSlot || 'Not specified'}
                      </p>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="h-4 w-4" />
                      <p className="text-sm font-medium">Delivery Address</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <p className="text-base whitespace-pre-line">
                        {formatAddress(order)}
                      </p>
                    </div>
                  </div>

                  {/* Delivery Instructions */}
                  {order?.deliveryInstructions && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-gray-700">
                        <MessageSquare className="h-4 w-4" />
                        <p className="text-sm font-medium">Delivery Instructions</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <p className="text-base">{order.deliveryInstructions}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Gift Information */}
            {(order?.isGift || order?.giftRecipientName || order?.giftRecipientPhone || order?.giftMessage) && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-pink-50 flex items-center justify-center">
                      <Gift className="h-4 w-4 text-pink-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">Gift Information</h2>
                      <p className="text-sm text-gray-500">Gift recipient and message details</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                    Gift Order
                  </Badge>
                </div>

                {/* Gift Recipient Details */}
                <div className="space-y-4">
                  {/* Recipient Name */}
                  {order.giftRecipientName && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gray-700">
                        <User className="h-4 w-4" />
                        <p className="text-sm font-medium">Recipient Name</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <p className="text-base">{order.giftRecipientName}</p>
                      </div>
                    </div>
                  )}

                  {/* Recipient Phone */}
                  {order.giftRecipientPhone && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="h-4 w-4" />
                        <p className="text-sm font-medium">Recipient Phone</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <p className="text-base">{order.giftRecipientPhone}</p>
                      </div>
                    </div>
                  )}

                  {/* Gift Message */}
                  {order.giftMessage && (
                    <div className="mt-4">
                      <div className="flex items-center gap-2 text-gray-700 mb-2">
                        <MessageSquare className="h-4 w-4" />
                        <p className="text-sm font-medium">Gift Message</p>
                      </div>
                      <div className="bg-pink-50/50 rounded-lg p-4 border border-pink-100">
                        <div className="relative">
                          <div className="absolute -top-2 -left-2 text-pink-400 transform -rotate-12">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9 17V7m0 10a2 2 0 0 1-2-2V5a2 2 0 1 1 4 0v10a2 2 0 0 1-2 2z"/>
                              <path d="M15 17V7m0 10a2 2 0 0 1-2-2V5a2 2 0 1 1 4 0v10a2 2 0 0 1-2 2z"/>
                            </svg>
                          </div>
                          <p className="text-base whitespace-pre-line pl-6 pr-4 py-2 text-gray-700">
                            {order.giftMessage}
                          </p>
                          <div className="absolute -bottom-2 -right-2 text-pink-400 transform rotate-12">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9 17V7m0 10a2 2 0 0 1-2-2V5a2 2 0 1 1 4 0v10a2 2 0 0 1-2 2z"/>
                              <path d="M15 17V7m0 10a2 2 0 0 1-2-2V5a2 2 0 1 1 4 0v10a2 2 0 0 1-2 2z"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Gift Note */}
                  {order.giftNote && (
                    <div className="mt-4">
                      <div className="flex items-center gap-2 text-gray-700 mb-2">
                        <FileText className="h-4 w-4" />
                        <p className="text-sm font-medium">Additional Gift Note</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <p className="text-base whitespace-pre-line">{order.giftNote}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Customer Details */}
          <div className="space-y-6">
            {/* Customer Information Card */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Details
                </h2>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  <Link href={`/customers/${order?.customer?.id}`} className="flex items-center gap-1">
                    View Profile
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="space-y-4">
                {/* Customer Information */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">
                        {order?.customer?.firstName && order?.customer?.lastName 
                          ? `${order.customer.firstName} ${order.customer.lastName}`
                          : order?.customer?.name || 'Guest Customer'}
                      </p>
                      <p className="text-xs text-gray-500">Customer Name</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{order?.customer?.email || 'No email provided'}</p>
                      <p className="text-xs text-gray-500">Email Address</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{order.customerPhone || order?.customer?.phone || 'No phone provided'}</p>
                      <p className="text-xs text-gray-500">Phone Number</p>
                    </div>
                  </div>
                </div>

                {/* Current Address */}
                {order?.streetAddress && (
                  <div className="pt-4 mt-4 border-t">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Current Address</p>
                        <div className="text-sm text-gray-600 mt-1 space-y-1">
                          <p>{order.streetAddress}</p>
                          {order.apartment && <p>Apartment: {order.apartment}</p>}
                          <p>{order.emirate}</p>
                          {order.city && <p>{order.city}</p>}
                          {order.pincode && <p>Postal Code: {order.pincode}</p>}
                          <p>{order.country || "United Arab Emirates"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Payment Information */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </h2>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Payment Method:</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {formatPaymentMethod(order.payment?.paymentMethod || order.paymentMethod || 'N/A')}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      {/* <span className="text-sm text-gray-600">Payment Status:</span> */}
                      <div className="flex items-center gap-2">
                        <Select 
                          value={selectedPaymentStatus} 
                          onValueChange={setSelectedPaymentStatus}
                          disabled={isUpdatingPaymentStatus}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue>
                              {selectedPaymentStatus && (
                                <Badge variant="outline" className={getPaymentStatusColor(selectedPaymentStatus)}>
                                  {selectedPaymentStatus.toUpperCase()}
                                </Badge>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                Pending
                              </Badge>
                            </SelectItem>
                            <SelectItem value="authorized">
                              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                Authorized
                              </Badge>
                            </SelectItem>
                            <SelectItem value="captured">
                              <Badge variant="outline" className="bg-green-100 text-green-800">
                                Captured
                              </Badge>
                            </SelectItem>
                            <SelectItem value="failed">
                              <Badge variant="outline" className="bg-red-100 text-red-800">
                                Failed
                              </Badge>
                            </SelectItem>
                            <SelectItem value="cancelled">
                              <Badge variant="outline" className="bg-gray-100 text-gray-800">
                                Cancelled
                              </Badge>
                            </SelectItem>
                            <SelectItem value="refunded">
                              <Badge variant="outline" className="bg-purple-100 text-purple-800">
                                Refunded
                              </Badge>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="secondary"
                          disabled={isUpdatingPaymentStatus || selectedPaymentStatus === order.payment?.status}
                          onClick={() => handlePaymentStatusChange(selectedPaymentStatus)}
                          size="sm"
                        >
                          {isUpdatingPaymentStatus ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Update'
                          )}
                        </Button>
                      </div>
                    </div>
                    {order.paymentStatus === 'pending' && (
                      <Button 
                        variant="secondary"
                        disabled={isSendingPaymentLink}
                        onClick={handleSendPaymentLink}
                        className="w-full"
                        size="sm"
                      >
                        {isSendingPaymentLink ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CreditCard className="h-4 w-4 mr-2" />
                        )}
                        Send Payment Link
                      </Button>
                    )}
                  </div>
                  {order.payment?.merchantOrderId && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Transaction ID:</span>
                      <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {order.payment.merchantOrderId}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Amount:</span>
                    <span className="text-base font-medium">{formatCurrency(order.total || 0)}</span>
                  </div>
                  {order.payment?.errorMessage && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                      <p className="text-sm text-red-600 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {order.payment.errorMessage}
                      </p>
                    </div>
                  )}
                </div>

                {/* Payment Timeline */}
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium mb-3">Payment Timeline</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500"></div>
                      <div>
                        <p className="text-sm font-medium">Order Placed</p>
                        <p className="text-xs text-gray-500">{formatDate(order.createdAt || order.date)}</p>
                      </div>
                    </div>
                    {order.payment?.status === 'PENDING' && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-yellow-500"></div>
                        <div>
                          <p className="text-sm font-medium">Payment Pending</p>
                          <p className="text-xs text-gray-500">Awaiting payment confirmation</p>
                        </div>
                      </div>
                    )}
                    {order.payment?.status === 'AUTHORIZED' && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500"></div>
                        <div>
                          <p className="text-sm font-medium">Payment Authorized</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(order.payment.updatedAt)}
                          </p>
                        </div>
                      </div>
                    )}
                    {order.payment?.status === 'CAPTURED' && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-green-500"></div>
                        <div>
                          <p className="text-sm font-medium">Payment Captured</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(order.payment.updatedAt)}
                          </p>
                        </div>
                      </div>
                    )}
                    {order.payment?.status === 'FAILED' && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-red-500"></div>
                        <div>
                          <p className="text-sm font-medium">Payment Failed</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(order.payment.updatedAt)}
                            {order.payment.errorMessage && (
                              <span className="block text-red-500">{order.payment.errorMessage}</span>
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                    {order.payment?.status === 'CANCELLED' && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-gray-500"></div>
                        <div>
                          <p className="text-sm font-medium">Payment Cancelled</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(order.payment.updatedAt)}
                          </p>
                        </div>
                      </div>
                    )}
                    {order.payment?.status === 'REFUNDED' && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-purple-500"></div>
                        <div>
                          <p className="text-sm font-medium">Payment Refunded</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(order.payment.updatedAt)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Gateway Response */}
                {order.payment?.gatewayResponse && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium">Gateway Details</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          const el = document.createElement('textarea');
                          el.value = JSON.stringify(order.payment.gatewayResponse, null, 2);
                          document.body.appendChild(el);
                          el.select();
                          document.execCommand('copy');
                          document.body.removeChild(el);
                          toast({
                            title: "Copied!",
                            description: "Gateway response copied to clipboard",
                          });
                        }}
                      >
                        Copy Raw Data
                      </Button>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-2">
                      {order.payment.paymentOrderId && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Payment Order ID:</span>
                          <span className="font-mono">{order.payment.paymentOrderId}</span>
                        </div>
                      )}
                      {order.payment.merchantOrderId && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Merchant Order ID:</span>
                          <span className="font-mono">{order.payment.merchantOrderId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
