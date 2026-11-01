import mongoose from 'mongoose';

const selectedSeatSchema = new mongoose.Schema(
  {
    seatNumber: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['VIP Recliner', 'Gold', 'Silver'],
      default: 'Silver',
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: true,
      index: true,
    },
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
    },
    theatreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true,
    },
    selectedSeats: {
      type: [selectedSeatSchema],
      required: true,
      validate: [val => val.length > 0, 'At least one seat must be selected'],
    },
    subtotal: {
      type: Number,
      required: true,
    },
    convenienceFee: {
      type: Number,
      default: 40,
    },
    taxes: {
      type: Number,
      default: 20,
    },
    discount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'failed', 'refunded'],
      default: 'unpaid',
      index: true,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    qrCode: {
      type: String, // Data URL
      default: '',
    },
    cancellationDetails: {
      cancelledAt: Date,
      refundAmount: Number,
      cancellationFee: Number,
      reason: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Booking', bookingSchema);

