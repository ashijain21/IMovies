import { z } from 'zod';

export const lockSeatsSchema = z.object({
  showId: z.string().min(1, 'Show ID is required'),
  seats: z.array(z.string()).min(1, 'At least one seat must be selected'),
  socketId: z.string().optional().default(''),
});

export const createBookingSchema = z.object({
  showId: z.string().min(1, 'Show ID is required'),
  selectedSeats: z.array(
    z.object({
      seatNumber: z.string().min(1),
      category: z.enum(['VIP Recliner', 'Gold', 'Silver']),
      price: z.number().positive(),
    })
  ).min(1, 'At least one seat must be selected'),
  paymentMethod: z.enum(['card', 'upi', 'netbanking', 'wallet', 'mock']).default('mock'),
  gatewayOrderId: z.string().optional(),
  gatewayPaymentId: z.string().optional(),
  gatewaySignature: z.string().optional(),
});

export const cancelBookingSchema = z.object({
  reason: z.string().optional().default('Customer requested cancellation'),
});

