import { z } from 'zod';

export const showSchema = z.object({
  movieId: z.string().min(1, 'Movie ID is required'),
  theatreId: z.string().min(1, 'Theatre ID is required'),
  screenId: z.string().min(1, 'Screen ID is required'),
  showDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'showDate must be in YYYY-MM-DD format'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  basePrice: z.number().positive().default(250),
  pricing: z.object({
    vip: z.number().positive().optional().default(450),
    gold: z.number().positive().optional().default(320),
    silver: z.number().positive().optional().default(220),
  }).optional(),
});

