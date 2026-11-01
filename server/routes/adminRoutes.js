import express from 'express';
import {
  getDashboardStats,
  getAnalytics,
  getAllBookings,
  getAllUsers,
  updateUserRole,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/bookings', getAllBookings);
router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);

export default router;

