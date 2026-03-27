import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Products
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getLowStock: (threshold) => api.get('/products/alerts/low-stock', { params: { threshold } }),
};

// Customers
export const customerAPI = {
  getAll: (params) => api.get('/customers', { params }),
  getOne: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
  getTopCustomers: (limit) => api.get('/customers/analytics/top-customers', { params: { limit } }),
};

// Invoices
export const invoiceAPI = {
  getAll: (params) => api.get('/invoices', { params }),
  getOne: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  updateStatus: (id, status) => api.patch(`/invoices/${id}/status`, { paymentStatus: status }),
  delete: (id) => api.delete(`/invoices/${id}`),
  downloadPDF: (id) => api.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),
};

// Analytics
export const analyticsAPI = {
  getDashboard: (period) => api.get('/analytics/dashboard', { params: { period } }),
  getSalesChart: (period) => api.get('/analytics/sales-chart', { params: { period } }),
  getTopProducts: (limit) => api.get('/analytics/top-products', { params: { limit } }),
  getPaymentMethods: () => api.get('/analytics/payment-methods'),
};

export default api;
