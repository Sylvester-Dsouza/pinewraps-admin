import api from '@/lib/api';
import { toast } from 'react-hot-toast';

export interface Admin {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  adminAccess: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminsResponse {
  success: boolean;
  data: Admin[];
}

export interface AdminResponse {
  success: boolean;
  data: Admin;
}

export const adminService = {
  getAdmins: async (): Promise<AdminsResponse> => {
    try {
      const response = await api.get('/api/admins/users');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Please log in as an admin to access this feature');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to access this feature');
      } else {
        toast.error('Failed to fetch administrators');
        console.error('Error fetching administrators:', error);
      }
      throw error;
    }
  },

  getAdmin: async (adminId: string): Promise<AdminResponse> => {
    try {
      const response = await api.get(`/api/admins/users/${adminId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Please log in as an admin to access this feature');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to access this feature');
      } else if (error.response?.status === 404) {
        toast.error('Administrator not found');
      } else {
        toast.error('Failed to fetch administrator details');
        console.error('Error fetching administrator:', error);
      }
      throw error;
    }
  },

  createAdmin: async (data: {
    email: string;
    password: string;
    name: string;
    adminAccess?: string[];
  }): Promise<AdminResponse> => {
    try {
      const response = await api.post('/api/admins/users', data);
      toast.success('Administrator created successfully');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Please log in as an admin to access this feature');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to access this feature');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.error.message || 'Invalid data provided');
      } else {
        toast.error('Failed to create administrator');
        console.error('Error creating administrator:', error);
      }
      throw error;
    }
  },

  updateAdmin: async (
    adminId: string,
    data: {
      name?: string;
      password?: string;
      adminAccess?: string[];
    }
  ): Promise<AdminResponse> => {
    try {
      const response = await api.put(`/api/admins/users/${adminId}`, data);
      toast.success('Administrator updated successfully');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Please log in as an admin to access this feature');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to access this feature');
      } else if (error.response?.status === 404) {
        toast.error('Administrator not found');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.error.message || 'Invalid data provided');
      } else {
        toast.error('Failed to update administrator');
        console.error('Error updating administrator:', error);
      }
      throw error;
    }
  },

  deleteAdmin: async (adminId: string): Promise<void> => {
    try {
      await api.delete(`/api/admins/users/${adminId}`);
      toast.success('Administrator deleted successfully');
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Please log in as an admin to access this feature');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to access this feature');
      } else if (error.response?.status === 404) {
        toast.error('Administrator not found');
      } else {
        toast.error('Failed to delete administrator');
        console.error('Error deleting administrator:', error);
      }
      throw error;
    }
  }
};