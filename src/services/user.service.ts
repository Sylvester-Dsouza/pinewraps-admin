import api from '@/lib/api';
import { toast } from 'react-hot-toast';

export interface Address {
  id: string;
  type: 'SHIPPING' | 'BILLING';
  isDefault: boolean;
  firstName: string;
  lastName: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface NotificationPreferences {
  orderUpdates: boolean;
  promotions: boolean;
  newsletter: boolean;
  sms: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
  phone: string | null;
  gender: string | null;
  birthDate: string | null;
  addresses?: Address[];
  notifications?: NotificationPreferences;
}

export interface UsersResponse {
  success: boolean;
  data: {
    users: User[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface UserResponse {
  success: boolean;
  data: User;
}

export const userService = {
  getUsers: async (page = 1, limit = 10, role?: string, search?: string): Promise<UsersResponse> => {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      if (role && role !== 'all') {
        params.append('role', role);
      }
      
      if (search) {
        params.append('search', search);
      }

      const response = await api.get(`/api/users?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Please log in as an admin to access this feature');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to access this feature');
      } else {
        toast.error('Failed to fetch users');
        console.error('Error fetching users:', error);
      }
      throw error;
    }
  },

  getUser: async (userId: string): Promise<UserResponse> => {
    try {
      const response = await api.get(`/api/users/${userId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Please log in as an admin to access this feature');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to access this feature');
      } else if (error.response?.status === 404) {
        toast.error('User not found');
      } else {
        toast.error('Failed to fetch user details');
        console.error('Error fetching user:', error);
      }
      throw error;
    }
  },

  updateUserRole: async (userId: string, role: 'USER' | 'ADMIN'): Promise<UserResponse> => {
    try {
      const response = await api.patch(`/api/users/${userId}/role`, { role });
      toast.success('User role updated successfully');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Please log in as an admin to access this feature');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to access this feature');
      } else if (error.response?.status === 404) {
        toast.error('User not found');
      } else {
        toast.error('Failed to update user role');
        console.error('Error updating user role:', error);
      }
      throw error;
    }
  },

  deleteUser: async (userId: string): Promise<void> => {
    try {
      await api.delete(`/api/users/${userId}`);
      toast.success('User deleted successfully');
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Please log in as an admin to access this feature');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to access this feature');
      } else if (error.response?.status === 404) {
        toast.error('User not found');
      } else {
        toast.error('Failed to delete user');
        console.error('Error deleting user:', error);
      }
      throw error;
    }
  }
};
