import express from 'express';
import {
  getTheatres,
  getCities,
  getTheatreById,
  createTheatre,
  updateTheatre,
  deleteTheatre,
  getScreens,
  createScreen,
  updateScreen,
  deleteScreen,
} from '../controllers/theatreController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../validators/authValidator.js';
import { theatreSchema, screenSchema } from '../validators/theatreValidator.js';

const router = express.Router();

router.get('/', getTheatres);
router.get('/cities', getCities);
router.get('/screens', getScreens);
router.get('/:id', getTheatreById);

// Admin Routes
router.post('/', protect, authorize('admin'), validate(theatreSchema), createTheatre);
router.put('/:id', protect, authorize('admin'), updateTheatre);
router.delete('/:id', protect, authorize('admin'), deleteTheatre);

router.post('/screens', protect, authorize('admin'), validate(screenSchema), createScreen);
router.put('/screens/:id', protect, authorize('admin'), updateScreen);
router.delete('/screens/:id', protect, authorize('admin'), deleteScreen);

export default router;

