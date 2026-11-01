import api from './api';

export const adminService = {
  getDashboard: async () => {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },

  getAnalytics: async () => {
    const res = await api.get('/admin/analytics');
    return res.data;
  },

  getAllBookings: async (params = {}) => {
    const res = await api.get('/admin/bookings', { params });
    return res.data;
  },

  getAllUsers: async (params = {}) => {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  updateUserRole: async (id, role) => {
    const res = await api.patch(`/admin/users/${id}/role`, { role });
    return res.data;
  },

  // Movie Management
  createMovie: async (movieData) => {
    const res = await api.post('/movies', movieData);
    return res.data;
  },
  updateMovie: async (id, movieData) => {
    const res = await api.put(`/movies/${id}`, movieData);
    return res.data;
  },
  deleteMovie: async (id) => {
    const res = await api.delete(`/movies/${id}`);
    return res.data;
  },

  // Theatre Management
  createTheatre: async (theatreData) => {
    const res = await api.post('/theatres', theatreData);
    return res.data;
  },
  updateTheatre: async (id, theatreData) => {
    const res = await api.put(`/theatres/${id}`, theatreData);
    return res.data;
  },
  deleteTheatre: async (id) => {
    const res = await api.delete(`/theatres/${id}`);
    return res.data;
  },

  // Screen Management
  getScreens: async (params = {}) => {
    const res = await api.get('/theatres/screens', { params });
    return res.data;
  },
  createScreen: async (screenData) => {
    const res = await api.post('/theatres/screens', screenData);
    return res.data;
  },
  deleteScreen: async (id) => {
    const res = await api.delete(`/theatres/screens/${id}`);
    return res.data;
  },

  // Show Management
  createShow: async (showData) => {
    const res = await api.post('/shows', showData);
    return res.data;
  },
  deleteShow: async (id) => {
    const res = await api.delete(`/shows/${id}`);
    return res.data;
  },
};

