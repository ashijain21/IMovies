import mongoose from 'mongoose';

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theatre name is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location/Area is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Complete address is required'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true,
    },
    facilities: {
      type: [String],
      default: ['Dolby Atmos', 'Recliner Seats', 'F&B Service', 'Parking'],
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

theatreSchema.virtual('screens', {
  ref: 'Screen',
  localField: '_id',
  foreignField: 'theatreId',
});

export default mongoose.model('Theatre', theatreSchema);

