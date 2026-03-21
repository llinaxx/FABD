import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const authClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

authClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

authClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await apiClient.post('/auth/refresh', {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return authClient(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const api = {
  register: (userData) => apiClient.post('/auth/register', userData),
  login: (credentials) => apiClient.post('/auth/login', credentials),

  getMe: () => authClient.get('/auth/me'),
  
  // Товары
  getProducts: () => authClient.get('/products'),
  getProductById: (id) => authClient.get(`/products/${id}`),
  createProduct: (product) => authClient.post('/products', product),
  updateProduct: (id, product) => authClient.put(`/products/${id}`, product),
  deleteProduct: (id) => authClient.delete(`/products/${id}`),
  
  // Пользователи (только для админа)
  getUsers: () => authClient.get('/users'),
  getUserById: (id) => authClient.get(`/users/${id}`),
  createUser: (userData) => authClient.post('/users', userData), // ← новый метод
  updateUser: (id, userData) => authClient.put(`/users/${id}`, userData),
  deleteUser: (id) => authClient.delete(`/users/${id}`),
};