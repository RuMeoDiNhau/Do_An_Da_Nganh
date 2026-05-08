/// <reference types="vite/client" />
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm token vào header nếu có
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Auth
  login: (identifier: string, password: string) =>
    apiClient.post('/users/login', { identifier, password }),
  register: (data: any) =>
    apiClient.post('/users/register', {
      username: data?.username || data?.displayName || data?.fullName,
      displayName: data?.displayName || data?.fullName,
      email: data?.email,
      password: data?.password,
    }),

  // Devices
  getDevices: () => apiClient.get('/devices'),
  getDevice: (id: string) => apiClient.get(`/devices/${id}`),
  updateDevice: (id: string, data: any) => apiClient.put(`/devices/${id}`, data),
  controlDevice: (id: string, action: any) =>
    apiClient.post(`/devices/${id}/control`, action),

  // Environment
  getEnvironment: () => apiClient.get('/environment'),
  
  // Users
  getUsers: () => apiClient.get('/users'),
  getUser: (id: string) => apiClient.get(`/users/${id}`),
};

export default apiClient;
