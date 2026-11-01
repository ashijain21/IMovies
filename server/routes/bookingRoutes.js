import express from 'express';
import {
  lockSeats,
  releaseSeats,
  calculateOrder,
  confirmBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
} from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../validators/authValidator.js';
import {
  lockSeatsSchema,
  createBookingSchema,
  cancelBookingSchema,
} from '../validators/bookingValidator.js';

const router = express.Router();

// Real-time seat reservation & locking
router.post('/lock-seats', protect, validate(lockSeatsSchema), lockSeats);
router.delete('/release-seats', protect, releaseSeats);

// Order calculation & Atomic booking confirmation
router.post('/calculate-order', protect, calculateOrder);
router.post('/confirm', protect, validate(createBookingSchema), confirmBooking);

// User booking history & management
router.get('/my-bookings', protect, getMyBookings);
router.get('/:id', protect, getBookingById);
router.patch('/:id/cancel', protect, validate(cancelBookingSchema), cancelBooking);

export default router;

