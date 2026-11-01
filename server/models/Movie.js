import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Movie description is required'],
    },
    poster: {
      type: String,
      required: [true, 'Poster image URL is required'],
    },
    backdrop: {
      type: String,
      required: [true, 'Backdrop image URL is required'],
    },
    trailerUrl: {
      type: String,
      default: '',
    },
    genre: {
      type: [String],
      required: [true, 'At least one genre is required'],
      index: true,
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      default: 'English',
      index: true,
    },
    duration: {
      type: Number, // in minutes
      required: [true, 'Duration in minutes is required'],
    },
    releaseDate: {
      type: Date,
      required: [true, 'Release date is required'],
    },
    cast: {
      type: [String],
      default: [],
    },
    director: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 8.0,
    },
    votesCount: {
      type: Number,
      default: 1200,
    },
    certification: {
      type: String,
      enum: ['U', 'UA', 'A', 'PG-13', 'R'],
      default: 'UA',
    },
    status: {
      type: String,
      enum: ['now_showing', 'upcoming', 'ended'],
      default: 'now_showing',
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

movieSchema.index(
  { title: 'text', description: 'text' },
  { default_language: 'english', language_override: 'none' }
);

export default mongoose.model('Movie', movieSchema);
