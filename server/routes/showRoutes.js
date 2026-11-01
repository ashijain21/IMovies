import express from 'express';
import {
  getShows,
  getShowById,
  getShowSeats,
  createShow,
  updateShow,
  deleteShow,
} from '../controllers/showController.js';
import { protect, optionalAuth, authorize } from '../middleware/auth.js';
import { validate } from '../validators/authValidator.js';
import { showSchema } from '../validators/showValidator.js';

const router = express.Router();

router.get('/', getShows);
router.get('/:id', getShowById);
router.get('/:id/seats', optionalAuth, getShowSeats);

// Admin Routes
router.post('/', protect, authorize('admin'), validate(showSchema), createShow);
router.put('/:id', protect, authorize('admin'), updateShow);
router.delete('/:id', protect, authorize('admin'), deleteShow);

export default router;

