import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add session ID for guest carts
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId && !config.headers['X-Session-ID']) {
      config.headers['X-Session-ID'] = sessionId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  logout: () => api.post('/auth/logout'),
};

// Products API
export const productsAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return api.get(`/products?${params}`);
  },
  getById: (id) => api.get(`/products/${id}`),
  getFeatured: () => api.get('/products/featured/list'),
  getByMood: (category, limit) => {
    const params = limit ? `?limit=${limit}` : '';
    return api.get(`/products/mood/${category}${params}`);
  },
  search: (query, limit) => {
    const params = new URLSearchParams({ q: query });
    if (limit) params.append('limit', limit);
    return api.get(`/products/search/query?${params}`);
  },
  admin: {
    create: (productData) => api.post('/admin/products', productData),
    update: (id, productData) => api.put(`/admin/products/${id}`, productData),
    delete: (id) => api.delete(`/admin/products/${id}`),
    getAll: (filters = {}) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      return api.get(`/admin/products?${params}`);
    },
    getLowStock: (threshold = 10) => api.get(`/admin/products/low-stock?threshold=${threshold}`),
  },
};

// Cart API
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (productId, quantity = 1) => api.post('/cart/add', { product_id: productId, quantity }),
  update: (productId, quantity) => api.put('/cart/update', { product_id: productId, quantity }),
  remove: (productId) => api.delete(`/cart/remove/${productId}`),
  clear: () => api.delete('/cart/clear'),
  getCount: () => api.get('/cart/count'),
  merge: (sessionId) => api.post('/cart/merge', { session_id: sessionId }),
};

// Checkout API
export const checkoutAPI = {
  preview: (orderData) => api.post('/checkout/preview', orderData),
  process: (orderData) => api.post('/checkout/process', orderData),
  createPaymentIntent: (amount, currency = 'usd') =>
    api.post('/checkout/create-payment-intent', { amount, currency }),
  createPayPalOrder: (amount) => api.post('/checkout/create-paypal-order', { amount }),
  capturePayPalOrder: (orderId) => api.post('/checkout/capture-paypal-order', { order_id: orderId }),
};

// Orders API
export const ordersAPI = {
  getUserOrders: () => api.get('/orders'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  trackOrder: (id, email) => {
    const params = email ? `?email=${encodeURIComponent(email)}` : '';
    return api.get(`/orders/${id}/track${params}`);
  },
  admin: {
    getAll: (filters = {}) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      return api.get(`/admin/orders?${params}`);
    },
    getById: (id) => api.get(`/admin/orders/${id}`),
    updateStatus: (id, status, trackingNumber) =>
      api.put(`/admin/orders/${id}/status`, { status, tracking_number: trackingNumber }),
  },
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getSalesAnalytics: (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    return api.get(`/admin/analytics/sales?${params}`);
  },
};

// Utility function to handle API errors
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.error || 'Something went wrong';
    const details = error.response.data?.details;
    return { message, details, status: error.response.status };
  } else if (error.request) {
    // Request was made but no response received
    return { message: 'Network error. Please check your connection.', status: 0 };
  } else {
    // Something else happened
    return { message: error.message || 'An unexpected error occurred', status: 500 };
  }
};

export default api;