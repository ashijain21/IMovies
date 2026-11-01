import mongoose from 'mongoose';

const showSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
      index: true,
    },
    theatreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true,
      index: true,
    },
    screenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screen',
      required: true,
      index: true,
    },
    showDate: {
      type: String, // 'YYYY-MM-DD' for exact day queries
      required: true,
      index: true,
    },
    startTime: {
      type: String, // e.g. '10:00 AM'
      required: true,
    },
    endTime: {
      type: String, // e.g. '01:00 PM'
      required: true,
    },
    basePrice: {
      type: Number,
      required: true,
      default: 250,
    },
    pricing: {
      vip: { type: Number, default: 450 },
      gold: { type: Number, default: 320 },
      silver: { type: Number, default: 220 },
    },
    bookedSeats: {
      type: [String], // e.g. ['A1', 'B4', 'F2']
      default: [],
    },
    availableSeats: {
      type: Number,
      default: 70,
    },
    status: {
      type: String,
      enum: ['scheduled', 'running', 'cancelled', 'completed'],
      default: 'scheduled',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to avoid overlapping shows on the same screen
showSchema.index({ screenId: 1, showDate: 1, startTime: 1 });

export default mongoose.model('Show', showSchema);

