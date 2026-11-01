import api from './api';

export const movieService = {
  getMovies: async (params = {}) => {
    const res = await api.get('/movies', { params });
    return res.data;
  },

  getFeatured: async () => {
    const res = await api.get('/movies/featured');
    return res.data;
  },

  getMovieById: async (id) => {
    const res = await api.get(`/movies/${id}`);
    return res.data;
  },
};

