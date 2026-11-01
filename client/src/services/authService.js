import api from './api';

export const authService = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    if (res.data.token) {
      localStorage.setItem('imovies_token', res.data.token);
      localStorage.setItem('imovies_refresh_token', res.data.refreshToken);
      localStorage.setItem('imovies_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.token) {
      localStorage.setItem('imovies_token', res.data.token);
      localStorage.setItem('imovies_refresh_token', res.data.refreshToken);
      localStorage.setItem('imovies_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('imovies_token');
      localStorage.removeItem('imovies_refresh_token');
      localStorage.removeItem('imovies_user');
    }
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  updateProfile: async (profileData) => {
    const res = await api.put('/auth/profile', profileData);
    if (res.data.user) {
      localStorage.setItem('imovies_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  forgotPassword: async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  resetPassword: async (token, password) => {
    const res = await api.post('/auth/reset-password', { token, password });
    return res.data;
  },
};

