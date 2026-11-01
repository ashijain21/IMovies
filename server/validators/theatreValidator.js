import { z } from 'zod';

export const theatreSchema = z.object({
  name: z.string().min(2, 'Theatre name is required'),
  location: z.string().min(2, 'Location is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  facilities: z.array(z.string()).optional().default(['Dolby Atmos', 'Recliner Seats']),
  image: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional().default('active'),
});

export const screenSchema = z.object({
  theatreId: z.string().min(1, 'Theatre ID is required'),
  screenName: z.string().min(1, 'Screen name is required'),
  screenType: z.enum(['IMAX 3D', 'Dolby Cinema', '4DX', 'Standard 2D', 'Standard 3D']).optional().default('Standard 2D'),
  totalSeats: z.number().positive().optional().default(70),
  seatCategories: z.array(
    z.object({
      name: z.enum(['VIP Recliner', 'Gold', 'Silver']),
      priceMultiplier: z.number().positive().default(1.0),
      rows: z.array(z.string()),
      seatsPerRow: z.number().positive().default(10),
    })
  ).optional(),
});

