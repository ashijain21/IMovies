import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('imovies_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('imovies_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post('/api/auth/refresh', { refreshToken });
          if (res.data?.token) {
            localStorage.setItem('imovies_token', res.data.token);
            originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
            return api(originalRequest);
          }
        } catch (refreshErr) {
          localStorage.removeItem('imovies_token');
          localStorage.removeItem('imovies_refresh_token');
          localStorage.removeItem('imovies_user');
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

