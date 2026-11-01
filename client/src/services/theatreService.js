import api from './api';

export const theatreService = {
  getTheatres: async (params = {}) => {
    const res = await api.get('/theatres', { params });
    return res.data;
  },

  getCities: async () => {
    const res = await api.get('/theatres/cities');
    return res.data;
  },

  getTheatreById: async (id) => {
    const res = await api.get(`/theatres/${id}`);
    return res.data;
  },
};

