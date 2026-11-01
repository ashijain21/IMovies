import mongoose from 'mongoose';

const seatLockSchema = new mongoose.Schema(
  {
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: true,
      index: true,
    },
    seatNumber: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    socketId: {
      type: String,
      default: '',
    },
    lockedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB automatic TTL cleanup
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: a seat for a given show can only be locked once at a time
seatLockSchema.index({ showId: 1, seatNumber: 1 }, { unique: true });

export default mongoose.model('SeatLock', seatLockSchema);

