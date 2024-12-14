import api from '@/lib/api';

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  items: Array<{
    id?: string;
    name: string;
    variant: string;
    price: number;
    quantity: number;
    cakeWriting?: string;
  }>;
  date: string;
  isGift?: boolean;
  giftWrapCharge?: number;
  delivery?: {
    type: 'delivery' | 'pickup';
    requestedDate: string;
    requestedTime: string;
    instructions?: string;
    storeLocation?: string;
  };
  deliveryFee?: number;
  couponDiscount?: number;
  rewardsUsed?: number;
  customer: {
    id: number;
    name: string;
    email: string;
    phone: string;
    address?: {
      street: string;
      apartment?: string;
      building?: string;
      floor?: string;
      area?: string;
      landmark?: string;
      emirates: string;
      city?: string;
      country: string;
      postalCode?: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    };
  };
  adminNotes?: string;
}

export interface OrdersResponse {
  success: boolean;
  data: {
    results: Order[];
    pagination: {
      total: number;
      page: number;
      limit: number;
    }
  }
}

export interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  monthlyGrowth: number;
}

export const orderService = {
  // Get orders list with pagination and filters
  getOrders: async (params: { 
    page?: number; 
    limit?: number; 
    status?: string;
    search?: string;
  }) => {
    try {
      const response = await api.get<OrdersResponse>('/api/orders', { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch orders');
    }
  },

  // Get order analytics
  getAnalytics: async () => {
    try {
      const response = await api.get<{ success: boolean; data: OrderAnalytics }>('/api/orders/analytics');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch analytics');
    }
  },

  // Get single order details
  getOrder: async (orderId: string) => {
    try {
      const response = await api.get<{ success: boolean; data: Order }>(`/api/orders/${orderId}`);
      if (!response.data.success) {
        throw new Error(response.data?.error?.message || 'Failed to fetch order');
      }
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching order:', error);
      throw new Error(error.response?.data?.error?.message || 'Failed to fetch order');
    }
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: string) => {
    try {
      const response = await api.put(`/api/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error: any) {
      console.error('Error updating order status:', error);
      throw new Error(error.response?.data?.message || 'Failed to update order status');
    }
  },

  // Update admin notes
  updateAdminNotes: async (orderId: string, adminNotes: string) => {
    try {
      const response = await api.patch(`/api/orders/${orderId}/notes`, { adminNotes });
      return response.data;
    } catch (error: any) {
      console.error('Error updating admin notes:', error);
      throw new Error(error.response?.data?.message || 'Failed to update admin notes');
    }
  },

  // Send email to customer
  sendEmail: async (orderId: string, subject: string, body: string) => {
    try {
      const response = await api.post(`/api/orders/${orderId}/email`, { subject, body });
      return response.data;
    } catch (error: any) {
      console.error('Error sending email:', error);
      throw new Error(error.response?.data?.message || 'Failed to send email');
    }
  },

  // Export orders
  exportOrders: async () => {
    const response = await api.get('/api/orders/export', { responseType: 'blob' });
    return response.data;
  },

  // Get order snapshot
  getOrderSnapshot: async (orderId: string) => {
    try {
      const response = await api.get(`/api/orders/${orderId}/snapshot`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching order snapshot:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch order snapshot');
    }
  },

  // Delete order
  deleteOrder: async (orderId: string) => {
    try {
      const response = await api.delete(`/api/orders/${orderId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting order:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete order');
    }
  }
};
