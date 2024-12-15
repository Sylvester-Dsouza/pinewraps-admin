import { apiClient } from "./client";

export type CouponType = "PERCENTAGE" | "FIXED_AMOUNT";
export type CouponStatus = "ACTIVE" | "INACTIVE" | "EXPIRED";

// Frontend Coupon type
export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  description?: string;
  minOrderAmount?: number;  // Frontend field name
  maxDiscount?: number;     // Frontend field name
  status: CouponStatus;
  startDate: string;
  endDate?: string;
  usageLimit?: number;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  onEdit?: (coupon: Coupon) => void;
  onStatusChange?: (id: string, status: CouponStatus) => void;
  onDelete?: (id: string) => void;
}

// API DTO types
export interface CreateCouponDTO {
  code: string;
  type: CouponType;
  value: number;
  description?: string;
  minOrderAmount?: number;  // API field name
  maxDiscount?: number;     // API field name
  startDate: string;
  endDate?: string;
  usageLimit?: number;
  status?: CouponStatus;
}

export interface APIResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export const getCoupons = async () => {
  const response = await apiClient.get<APIResponse<Coupon[]>>("/coupons");
  return response.data.data;
};

export const getCoupon = async (id: string) => {
  const response = await apiClient.get<APIResponse<Coupon>>(`/coupons/${id}`);
  return response.data.data;
};

export const createCoupon = async (data: CreateCouponDTO) => {
  const response = await apiClient.post<APIResponse<Coupon>>("/coupons", data);
  return response.data.data;
};

export const updateCoupon = async (id: string, data: Partial<CreateCouponDTO>) => {
  console.log('Making API request to update coupon:', { id, data });
  try {
    const response = await apiClient.put<APIResponse<Coupon>>(`/coupons/${id}`, data);
    console.log('Update coupon response:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Error updating coupon:', error);
    throw error;
  }
};

export const deleteCoupon = async (id: string) => {
  const response = await apiClient.delete<APIResponse<void>>(`/coupons/${id}`);
  return response.data;
};
