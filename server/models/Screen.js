import mongoose from 'mongoose';

const seatCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ['VIP Recliner', 'Gold', 'Silver'],
    },
    priceMultiplier: {
      type: Number,
      default: 1.0,
    },
    rows: {
      type: [String], // e.g. ['A', 'B']
      required: true,
    },
    seatsPerRow: {
      type: Number,
      required: true,
      default: 10,
    },
  },
  { _id: false }
);

const screenSchema = new mongoose.Schema(
  {
    theatreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true,
      index: true,
    },
    screenName: {
      type: String,
      required: [true, 'Screen name is required'],
      trim: true,
    },
    screenType: {
      type: String,
      enum: ['IMAX 3D', 'Dolby Cinema', '4DX', 'Standard 2D', 'Standard 3D'],
      default: 'Standard 2D',
    },
    totalSeats: {
      type: Number,
      required: true,
      default: 70,
    },
    seatCategories: {
      type: [seatCategorySchema],
      default: [
        { name: 'VIP Recliner', priceMultiplier: 1.5, rows: ['A', 'B'], seatsPerRow: 10 },
        { name: 'Gold', priceMultiplier: 1.2, rows: ['C', 'D', 'E'], seatsPerRow: 12 },
        { name: 'Silver', priceMultiplier: 1.0, rows: ['F', 'G', 'H'], seatsPerRow: 12 },
      ],
    },
    status: {
      type: String,
      enum: ['active', 'maintenance'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Screen', screenSchema);

