import api from './api';

export const showService = {
  getShows: async (params = {}) => {
    const res = await api.get('/shows', { params });
    return res.data;
  },

  getShowById: async (id) => {
    const res = await api.get(`/shows/${id}`);
    return res.data;
  },

  getShowSeats: async (showId) => {
    const res = await api.get(`/shows/${showId}/seats`);
    return res.data;
  },
};

