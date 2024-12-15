import api from '@/lib/api';
import { toast } from 'react-hot-toast';

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount: number;
  maxUses: number;
  currentUses: number;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponsResponse {
  success: boolean;
  data: Coupon[];
}

export interface CouponResponse {
  success: boolean;
  data: Coupon;
}

export const couponService = {
  getCoupons: async (): Promise<CouponsResponse> => {
    try {
      const response = await api.get('/api/coupons');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Please log in to access coupons');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to access coupons');
      } else {
        toast.error('Failed to fetch coupons');
        console.error('Error fetching coupons:', error);
      }
      throw error;
    }
  },

  getCoupon: async (couponId: string): Promise<CouponResponse> => {
    try {
      const response = await api.get(`/api/coupons/${couponId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Please log in to access this coupon');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to access this coupon');
      } else if (error.response?.status === 404) {
        toast.error('Coupon not found');
      } else {
        toast.error('Failed to fetch coupon');
        console.error('Error fetching coupon:', error);
      }
      throw error;
    }
  },

  createCoupon: async (data: Omit<Coupon, 'id' | 'currentUses' | 'createdAt' | 'updatedAt'>): Promise<CouponResponse> => {
    try {
      const response = await api.post('/api/coupons', data);
      toast.success('Coupon created successfully');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Please log in to create a coupon');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to create coupons');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.error.message || 'Invalid coupon data');
      } else {
        toast.error('Failed to create coupon');
        console.error('Error creating coupon:', error);
      }
      throw error;
    }
  },

  updateCoupon: async (
    couponId: string,
    data: Partial<Omit<Coupon, 'id' | 'currentUses' | 'createdAt' | 'updatedAt'>>
  ): Promise<CouponResponse> => {
    try {
      const response = await api.put(`/api/coupons/${couponId}`, data);
      toast.success('Coupon updated successfully');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Please log in to update this coupon');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to update coupons');
      } else if (error.response?.status === 404) {
        toast.error('Coupon not found');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.error.message || 'Invalid coupon data');
      } else {
        toast.error('Failed to update coupon');
        console.error('Error updating coupon:', error);
      }
      throw error;
    }
  },

  deleteCoupon: async (couponId: string): Promise<void> => {
    try {
      await api.delete(`/api/coupons/${couponId}`);
      toast.success('Coupon deleted successfully');
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Please log in to delete this coupon');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to delete coupons');
      } else if (error.response?.status === 404) {
        toast.error('Coupon not found');
      } else {
        toast.error('Failed to delete coupon');
        console.error('Error deleting coupon:', error);
      }
      throw error;
    }
  }
};
