import api from '@/lib/api';
import { toast } from 'react-hot-toast';

export interface Address {
  id: string;
  street: string;
  apartment: string;
  emirates: 'ABU_DHABI' | 'DUBAI' | 'SHARJAH' | 'AJMAN' | 'UMM_AL_QUWAIN' | 'RAS_AL_KHAIMAH' | 'FUJAIRAH';
  country: string;
  postalCode: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferences {
  orderUpdates: boolean;
  promotions: boolean;
  newsletter: boolean;
  sms: boolean;
}

export interface RewardHistory {
  id: string;
  points: number;
  type: 'EARNED' | 'REDEEMED';
  description: string;
  orderId?: string;
  createdAt: string;
}

export interface Reward {
  id: string;
  points: number;
  totalPoints: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  history: RewardHistory[];
}

export interface Customer {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  birthDate: string | null;
  createdAt: string;
  updatedAt: string;
  addresses: Address[];
  notifications: NotificationPreferences;
  reward: Reward;
}

export interface CustomersResponse {
  success: boolean;
  data: {
    customers: Customer[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    }
  };
}

export interface CustomerResponse {
  success: boolean;
  data: Customer;
}

export interface RewardResponse {
  success: boolean;
  data: {
    points: number;
    totalPoints: number;
    tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
    history: RewardHistory[];
  };
}

export interface RewardHistoryResponse {
  success: boolean;
  data: {
    history: RewardHistory[];
  };
}

export const customerService = {
  getCustomers: async (page = 1, limit = 10, search?: string): Promise<CustomersResponse> => {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      if (search) {
        params.append('search', search);
      }

      const response = await api.get(`/api/customers?${params.toString()}`);
      console.log('API Response:', response.data); // Debug log
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Please log in as an admin to access this feature');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to access this feature');
      } else {
        toast.error('Failed to fetch customers');
        console.error('Error fetching customers:', error);
      }
      throw error;
    }
  },

  getCustomer: async (customerId: string): Promise<CustomerResponse> => {
    try {
      const response = await api.get(`/api/customers/${customerId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Please log in as an admin to access this feature');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to access this feature');
      } else if (error.response?.status === 404) {
        toast.error('Customer not found');
      } else {
        toast.error('Failed to fetch customer details');
        console.error('Error fetching customer:', error);
      }
      throw error;
    }
  },

  deleteCustomer: async (customerId: string): Promise<void> => {
    try {
      await api.delete(`/api/customers/${customerId}`);
      toast.success('Customer deleted successfully');
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Please log in as an admin to access this feature');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to access this feature');
      } else if (error.response?.status === 404) {
        toast.error('Customer not found');
      } else {
        toast.error('Failed to delete customer');
        console.error('Error deleting customer:', error);
      }
      throw error;
    }
  },

  getCustomerReward: async (customerId: string): Promise<RewardResponse> => {
    try {
      const response = await api.get(`/api/rewards/${customerId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching reward:', error);
      throw error;
    }
  },

  getCustomerRewardHistory: async (customerId: string): Promise<RewardHistoryResponse> => {
    try {
      const response = await api.get(`/api/rewards/${customerId}/history`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching reward history:', error);
      throw error;
    }
  },
};
