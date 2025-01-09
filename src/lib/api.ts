import axios, { AxiosError } from 'axios'
import { auth } from './firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'

if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is not set');
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000, // 10 seconds timeout
});

// Add request interceptor to include authentication token
api.interceptors.request.use(async (config) => {
  try {
    // Check if API is available
    await axios.get(`${BASE_URL}/health`);

    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken(true);
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  } catch (error) {
    // If health check fails, throw a more descriptive error
    if (error instanceof AxiosError && !error.response) {
      throw new Error('Unable to connect to the server. Please check your connection and try again.');
    }
    return Promise.reject(error);
  }
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor to handle token expiration and network errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      throw new Error('Network error: Unable to connect to the server. Please check your connection and try again.');
    }

    // If the error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const user = auth.currentUser;
        if (user) {
          // Get a fresh token
          const token = await user.getIdToken(true);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authApi = {
  // Login with Firebase and get admin access
  login: async (email: string, password: string) => {
    try {
      // First sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      // Then verify admin access with our backend
      const response = await api.post('/api/admin-auth/login', { idToken });
      
      if (!response.data.success) {
        // If backend verification fails, sign out from Firebase
        await auth.signOut();
        throw new Error(response.data.message || 'Not authorized as admin');
      }

      return response;
    } catch (error: any) {
      // Handle Firebase-specific errors
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('Invalid email or password');
      }
      // Handle network errors
      if (error.message.includes('Network Error')) {
        throw new Error('Unable to connect to the server. Please check your connection and try again.');
      }
      throw error;
    }
  },

  // Verify admin token
  verifyAdminToken: async (token: string) => {
    try {
      const response = await api.post('/api/admin-auth/verify', { token });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Token verification failed');
      }

      return response;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Your session has expired. Please login again.');
      }
      throw error;
    }
  },

  // Logout
  logout: async () => {
    await auth.signOut();
    return api.post('/api/admin-auth/logout');
  }
};

// Categories API endpoints
export const categoriesApi = {
  getAll: () => api.get('/api/categories'),
  getById: (id: string) => api.get(`/api/categories/${id}`),
  create: (data: any) => api.post('/api/categories', data),
  update: (id: string, data: any) => api.put(`/api/categories/${id}`, data),
  delete: (id: string) => api.delete(`/api/categories/${id}`)
};

// Products API endpoints
export const productsApi = {
  getAll: () => api.get('/api/products'),
  getById: (id: string) => api.get(`/api/products/${id}`),
  create: (data: FormData) => api.post('/api/products', data),
  update: (id: string, data: any) => api.put(`/api/products/${id}`, data),
  delete: (id: string) => api.delete(`/api/products/${id}`),
  uploadImage: (id: string, data: FormData) => api.post(`/api/products/${id}/media`, data),
  reorderImages: (id: string, imageOrder: string[]) => 
    api.post(`/api/products/${id}/media/reorder`, { imageOrder }),
};

// Users API endpoints
export const usersApi = {
  getAll: () => api.get('/api/users'),
  getById: (id: string) => api.get(`/api/users/${id}`),
  delete: (id: string) => api.delete(`/api/users/${id}`)
};

export default api;
