// services/apiService.ts
import axios, { 
  type AxiosInstance, 
  type AxiosRequestConfig, 
  type InternalAxiosRequestConfig 
} from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://affiliate-website-backend.onrender.com/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Request interceptor to add token and handle FormData
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log(`🔑 Request: ${config.method?.toUpperCase()} ${config.url} - Token added`);
        } else {
          console.log(`ℹ️ Request: ${config.method?.toUpperCase()} ${config.url} - No token`);
        }

        // ✅ CRITICAL FIX: If data is FormData, remove Content-Type to let browser set it
        if (config.data instanceof FormData) {
          console.log('📤 Uploading FormData - Removing Content-Type header');
          delete config.headers['Content-Type'];
        }

        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => {
        console.log(`✅ Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
        return response;
      },
      (error) => {
        // Handle 401 errors
        if (error.response?.status === 401) {
          console.log('🔒 401 Unauthorized - Token invalid or expired');
          
          // Don't redirect if we're on login page or auth endpoints
          const currentPath = window.location.pathname;
          const isAuthPage = currentPath.includes('/login') || 
                           currentPath.includes('/signup') || 
                           currentPath.includes('/forgot-password') ||
                           currentPath.includes('/reset-password');
          
          if (!isAuthPage && !error.config?.url?.includes('/auth/verify-token')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            console.log('🔒 Redirecting to login');
            window.location.href = '/login';
          }
        }
        
        // Handle network errors
        if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
          console.error('❌ Network error occurred');
        }

        // Log error details for debugging
        if (error.response) {
          console.error('❌ API Error Response:', {
            status: error.response.status,
            data: error.response.data,
            url: error.config?.url,
            method: error.config?.method,
          });
        }

        return Promise.reject(error);
      }
    );
  }

  public get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.api.get(url, config).then((res) => res.data);
  }

  public post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    // ✅ If data is FormData, let the interceptor handle it
    return this.api.post(url, data, config).then((res) => res.data);
  }

  public put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    // ✅ If data is FormData, let the interceptor handle it
    return this.api.put(url, data, config).then((res) => res.data);
  }

  public delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.api.delete(url, config).then((res) => res.data);
  }

  public patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    // ✅ If data is FormData, let the interceptor handle it
    return this.api.patch(url, data, config).then((res) => res.data);
  }
}

export default new ApiService();