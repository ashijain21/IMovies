import api from './api';

export const bookingService = {
  lockSeats: async (showId, seats, socketId = '') => {
    const res = await api.post('/bookings/lock-seats', { showId, seats, socketId });
    return res.data;
  },

  releaseSeats: async (showId, seats) => {
    const res = await api.delete('/bookings/release-seats', { data: { showId, seats } });
    return res.data;
  },

  calculateOrder: async (payload) => {
    const res = await api.post('/bookings/calculate-order', payload);
    return res.data;
  },

  createPaymentOrder: async (amount) => {
    const res = await api.post('/payments/create-order', { amount });
    return res.data;
  },

  verifyPayment: async (payload) => {
    const res = await api.post('/payments/verify', payload);
    return res.data;
  },

  confirmBooking: async (bookingData) => {
    const res = await api.post('/bookings/confirm', bookingData);
    return res.data;
  },

  getMyBookings: async () => {
    const res = await api.get('/bookings/my-bookings');
    return res.data;
  },

  getBookingById: async (id) => {
    const res = await api.get(`/bookings/${id}`);
    return res.data;
  },

  cancelBooking: async (id, reason = '') => {
    const res = await api.patch(`/bookings/${id}/cancel`, { reason });
    return res.data;
  },
};

