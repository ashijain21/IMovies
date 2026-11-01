import { z } from 'zod';

export const movieSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  poster: z.string().min(1, 'Poster URL is required'),
  backdrop: z.string().min(1, 'Backdrop URL is required'),
  trailerUrl: z.string().optional().default(''),
  genre: z.array(z.string()).min(1, 'At least one genre is required'),
  language: z.string().min(1, 'Language is required'),
  duration: z.number().positive('Duration must be positive in minutes'),
  releaseDate: z.string().or(z.date()),
  cast: z.array(z.string()).optional().default([]),
  director: z.string().optional().default(''),
  rating: z.number().min(0).max(10).optional().default(8.0),
  certification: z.enum(['U', 'UA', 'A', 'PG-13', 'R']).optional().default('UA'),
  status: z.enum(['now_showing', 'upcoming', 'ended']).optional().default('now_showing'),
  featured: z.boolean().optional().default(false),
});

