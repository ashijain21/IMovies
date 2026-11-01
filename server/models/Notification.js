import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['booking_confirmation', 'cancellation', 'reminder', 'system', 'offer'],
      default: 'system',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    data: {
      bookingId: String,
      link: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Notification', notificationSchema);

