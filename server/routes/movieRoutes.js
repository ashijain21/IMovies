import express from 'express';
import {
  getMovies,
  getFeaturedAndTrending,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} from '../controllers/movieController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../validators/authValidator.js';
import { movieSchema } from '../validators/movieValidator.js';

const router = express.Router();

router.get('/', getMovies);
router.get('/featured', getFeaturedAndTrending);
router.get('/:id', getMovieById);

// Protected Admin Routes
router.post('/', protect, authorize('admin'), validate(movieSchema), createMovie);
router.put('/:id', protect, authorize('admin'), updateMovie);
router.delete('/:id', protect, authorize('admin'), deleteMovie);

export default router;

