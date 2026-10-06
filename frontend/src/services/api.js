import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Attach JWT access token if present in localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fn_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Standardize response unpacking
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response && error.response.data) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject({
      success: false,
      data: null,
      error: {
        code: 'NETWORK_ERROR',
        message: error.message || 'Unable to connect to FixNearby servers. Please check your internet connection.',
      },
    });
  }
);

export const api = {
  // Authentication
  auth: {
    register: (data) => apiClient.post('/auth/register', data),
    login: (data) => apiClient.post('/auth/login', data),
    me: () => apiClient.get('/auth/me'),
    updateProfile: (data) => apiClient.patch('/auth/profile', data),
  },

  // Services & Categories
  services: {
    getCategories: () => apiClient.get('/categories'),
    getCategoryProblems: (categoryId) => apiClient.get(`/categories/${categoryId}/problems`),
  },

  // Technicians
  technicians: {
    getAll: (params) => apiClient.get('/technicians', { params }),
    getById: (id, params) => apiClient.get(`/technicians/${id}`, { params }),
  },

  // Badge Verification
  verification: {
    verifyBadge: (badgeCode) => apiClient.get(`/verify/${badgeCode.toUpperCase()}`),
  },

  // Emergency Requests
  requests: {
    create: (data) => apiClient.post('/requests', data),
    getById: (id) => apiClient.get(`/requests/${id}`),
    assign: (id, technicianId) => apiClient.patch(`/requests/${id}/assign`, { technicianId }),
    updateStatus: (id, data) => apiClient.patch(`/requests/${id}/status`, data),
    review: (id, data) => apiClient.post(`/requests/${id}/review`, data),
    getMyRequests: () => apiClient.get('/requests/my-requests'),
  },

  // Live Tracking
  tracking: {
    getTracking: (requestId) => apiClient.get(`/tracking/${requestId}`),
    simulate: (requestId) => apiClient.post(`/tracking/${requestId}/simulate`),
  },

  // Provider Portal
  provider: {
    toggleDuty: (isOnDuty) => apiClient.patch('/provider/duty', { isOnDuty }),
    updateLocation: (data) => apiClient.post('/provider/location', data),
    getRequests: () => apiClient.get('/provider/requests'),
    respondRequest: (id, action) => apiClient.patch(`/provider/requests/${id}/respond`, { action }),
  },

  // Admin Portal
  admin: {
    getDashboard: () => apiClient.get('/admin/dashboard'),
    getTechnicians: () => apiClient.get('/admin/technicians'),
    updateCredentials: (id, data) => apiClient.patch(`/admin/technicians/${id}/credentials`, data),
    deleteTechnician: (id) => apiClient.delete(`/admin/technicians/${id}`),
  },
};

export default api;

