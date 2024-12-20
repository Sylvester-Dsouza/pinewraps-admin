import axios from 'axios'
import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is not set');
}

const instance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add a request interceptor to include the auth token
instance.interceptors.request.use(
  (config) => {
    const token = Cookies.get('admin-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add a response interceptor to handle errors
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      Cookies.remove('admin-token')
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)

export default instance
