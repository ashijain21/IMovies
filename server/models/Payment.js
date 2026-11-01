import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'upi', 'netbanking', 'wallet', 'mock'],
      default: 'mock',
    },
    paymentStatus: {
      type: String,
      enum: ['created', 'captured', 'failed', 'refunded'],
      default: 'captured',
      index: true,
    },
    paymentGateway: {
      type: String,
      enum: ['razorpay', 'mock'],
      default: 'mock',
    },
    gatewayOrderId: {
      type: String,
      default: '',
    },
    gatewayPaymentId: {
      type: String,
      default: '',
    },
    gatewaySignature: {
      type: String,
      default: '',
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Payment', paymentSchema);

