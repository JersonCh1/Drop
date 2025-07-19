// frontend/src/services/apiService.ts
import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import toast from 'react-hot-toast';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add admin token if available
        const adminToken = localStorage.getItem('adminToken');
        if (adminToken && config.url?.includes('/admin')) {
          config.headers.Authorization = `Bearer ${adminToken}`;
        }

        // Add session ID for analytics
        const sessionId = sessionStorage.getItem('sessionId');
        if (sessionId) {
          config.headers['X-Session-Id'] = sessionId;
        }

        // Add request timestamp
        config.headers['X-Request-Time'] = new Date().toISOString();

        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log successful requests in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}:`, response.status);
        }
        return response;
      },
      (error: AxiosError) => {
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleApiError(error: AxiosError): void {
    const response = error.response;
    
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ API Error:`, {
        url: error.config?.url,
        method: error.config?.method,
        status: response?.status,
        data: response?.data
      });
    }

    // Handle specific error cases
    switch (response?.status) {
      case 401:
        // Unauthorized - clear tokens and redirect to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('adminToken');
        
        if (window.location.pathname.includes('/admin')) {
          window.location.href = '/admin/login';
        } else {
          toast.error('Sesión expirada. Por favor inicia sesión nuevamente.');
        }
        break;

      case 403:
        toast.error('No tienes permisos para realizar esta acción.');
        break;

      case 404:
        toast.error('Recurso no encontrado.');
        break;

      case 429:
        toast.error('Demasiadas solicitudes. Por favor intenta más tarde.');
        break;

      case 500:
        toast.error('Error interno del servidor. Por favor intenta más tarde.');
        break;

      case 503:
        toast.error('Servicio no disponible. Por favor intenta más tarde.');
        break;

      default:
        if (error.code === 'NETWORK_ERROR' || !response) {
          toast.error('Error de conexión. Verifica tu internet.');
        } else {
          const message = (response?.data as any)?.message || 'Error inesperado';
          toast.error(message);
        }
    }
  }

  // Generic HTTP methods
  async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.get(url, { params });
      return response.data;
    } catch (error) {
      throw this.formatError(error as AxiosError);
    }
  }

  async post<T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.post(url, data, config);
      return response.data;
    } catch (error) {
      throw this.formatError(error as AxiosError);
    }
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.put(url, data);
      return response.data;
    } catch (error) {
      throw this.formatError(error as AxiosError);
    }
  }

  async patch<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.patch(url, data);
      return response.data;
    } catch (error) {
      throw this.formatError(error as AxiosError);
    }
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.delete(url);
      return response.data;
    } catch (error) {
      throw this.formatError(error as AxiosError);
    }
  }

  // File upload with progress
  async uploadFile<T>(
    url: string, 
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });

      return response.data;
    } catch (error) {
      throw this.formatError(error as AxiosError);
    }
  }

  private formatError(error: AxiosError): Error {
    const response = error.response;
    const message = (response?.data as any)?.message || error.message || 'Error de conexión';
    return new Error(message);
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.api.get('/health');
      return true;
    } catch (error) {
      return false;
    }
  }

  // Set auth token
  setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  // Set admin token
  setAdminToken(token: string): void {
    localStorage.setItem('adminToken', token);
  }

  // Clear tokens
  clearTokens(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminToken');
  }

  // Get current tokens
  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getAdminToken(): string | null {
    return localStorage.getItem('adminToken');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  isAdminAuthenticated(): boolean {
    return !!this.getAdminToken();
  }
}

// Specific API methods for different resources

// Products API
export const productsApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    featured?: boolean;
    search?: string;
    sort?: string;
    order?: 'ASC' | 'DESC';
  }) => apiService.get('/products', params),

  getBySlug: (slug: string) => apiService.get(`/products/${slug}`),

  getVariants: (productId: number) => apiService.get(`/products/${productId}/variants`),

  getReviews: (productId: number, params?: { page?: number; limit?: number }) => 
    apiService.get(`/products/${productId}/reviews`, params),

  createReview: (productId: number, data: {
    rating: number;
    title?: string;
    comment?: string;
    customerName?: string;
    customerEmail?: string;
  }) => apiService.post(`/products/${productId}/reviews`, data),

  // Admin only
  create: (data: any) => apiService.post('/products', data),
  update: (id: number, data: any) => apiService.put(`/products/${id}`, data),
  delete: (id: number) => apiService.delete(`/products/${id}`),
  createVariant: (productId: number, data: any) => apiService.post(`/products/${productId}/variants`, data),
  getAnalytics: (productId: number) => apiService.get(`/products/${productId}/analytics`),
};

// Orders API
export const ordersApi = {
  create: (data: {
    customerInfo: any;
    items: any[];
    subtotal: number;
    shippingCost: number;
    total: number;
    paymentMethod?: string;
  }) => apiService.post('/orders', data),

  getByOrderNumber: (orderNumber: string) => apiService.get(`/orders/${orderNumber}`),

  // Admin only
  getAll: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    country?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }) => apiService.get('/orders', params),

  updateStatus: (id: number, data: {
    status: string;
    notes?: string;
    trackingNumber?: string;
    trackingUrl?: string;
  }) => apiService.patch(`/orders/${id}/status`, data),

  processRefund: (id: number, data: { amount?: number; reason?: string }) => 
    apiService.post(`/orders/${id}/refund`, data),

  getStats: (period?: '7d' | '30d' | '90d') => 
    apiService.get('/orders/stats/dashboard', { period }),

  bulkUpdateStatus: (data: { orderIds: number[]; status: string; notes?: string }) => 
    apiService.post('/orders/bulk/status', data),

  bulkSendNotifications: (data: { orderIds: number[]; notificationType: string }) => 
    apiService.post('/orders/bulk/notifications', data),

  getNotifications: (orderId: number) => apiService.get(`/orders/${orderId}/notifications`),

  resendNotification: (orderId: number, type: string) => 
    apiService.post(`/orders/${orderId}/resend-notification`, { type }),

  addNote: (orderId: number, note: string) => 
    apiService.post(`/orders/${orderId}/notes`, { note }),
};

// Categories API
export const categoriesApi = {
  getAll: () => apiService.get('/categories'),
  getBySlug: (slug: string) => apiService.get(`/categories/${slug}`),
  
  // Admin only
  create: (data: any) => apiService.post('/categories', data),
  update: (id: number, data: any) => apiService.put(`/categories/${id}`, data),
  delete: (id: number) => apiService.delete(`/categories/${id}`),
};

// Auth API
export const authApi = {
  login: (email: string, password: string) => 
    apiService.post('/auth/login', { email, password }),

  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => apiService.post('/auth/register', data),

  logout: () => apiService.post('/auth/logout'),

  verifyToken: () => apiService.get('/auth/verify'),

  resetPassword: (email: string) => 
    apiService.post('/auth/reset-password', { email }),

  updatePassword: (data: { currentPassword: string; newPassword: string }) => 
    apiService.post('/auth/update-password', data),

  updateProfile: (data: any) => apiService.patch('/auth/profile', data),

  // Admin auth
  adminLogin: (username: string, password: string) => 
    apiService.post('/admin/login', { username, password }),

  verifyAdminToken: () => apiService.get('/admin/verify'),
};

// Analytics API
export const analyticsApi = {
  track: (data: {
    type: string;
    event: string;
    data?: any;
    sessionId?: string;
    userId?: string;
  }) => apiService.post('/analytics/track', data),

  trackBatch: (events: any[]) => apiService.post('/analytics/batch', { events }),

  // Admin only
  getDashboard: (dateRange?: '7d' | '30d' | '90d') => 
    apiService.get('/analytics/dashboard', { dateRange }),

  getRealtime: () => apiService.get('/analytics/realtime'),

  getTrafficSources: (dateRange?: string) => 
    apiService.get('/analytics/traffic-sources', { dateRange }),
};

// File Upload API
export const uploadApi = {
  uploadImage: (file: File, onProgress?: (progress: number) => void) => 
    apiService.uploadFile('/upload/image', file, onProgress),

  uploadProductImages: (productId: number, files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    formData.append('productId', productId.toString());
    return apiService.post('/upload/product-images', formData);
  },

  deleteImage: (imageId: number) => apiService.delete(`/upload/images/${imageId}`),
};

// Tracking API
export const trackingApi = {
  getOrderStatus: (orderNumber: string) => apiService.get(`/tracking/${orderNumber}`),
  
  // Admin only
  updateTracking: (orderId: number, data: {
    trackingNumber?: string;
    trackingUrl?: string;
    carrier?: string;
    estimatedDelivery?: string;
  }) => apiService.patch(`/tracking/${orderId}`, data),
};

// Settings API
export const settingsApi = {
  // Admin only
  getAll: () => apiService.get('/admin/settings'),
  
  update: (settings: Record<string, any>) => 
    apiService.post('/admin/settings', { settings }),

  getSingle: (key: string) => apiService.get(`/admin/settings/${key}`),

  updateSingle: (key: string, value: any) => 
    apiService.put(`/admin/settings/${key}`, { value }),
};

// Newsletter API
export const newsletterApi = {
  subscribe: (email: string, source?: string) => 
    apiService.post('/newsletter/subscribe', { email, source }),

  // Admin only
  getSubscribers: (params?: { page?: number; limit?: number }) => 
    apiService.get('/admin/newsletter/subscribers', params),

  sendCampaign: (data: {
    subject: string;
    content: string;
    recipients: string[];
  }) => apiService.post('/admin/newsletter/send', data),
};

// Create singleton instance
const apiService = new ApiService();

export default apiService;