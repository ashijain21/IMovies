import Movie from '../models/Movie.js';

// @desc    Get all movies with filters, search, and pagination
// @route   GET /api/movies
// @access  Public
export const getMovies = async (req, res, next) => {
  try {
    const {
      search,
      genre,
      language,
      status,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { director: { $regex: search, $options: 'i' } },
        { cast: { $regex: search, $options: 'i' } },
      ];
    }

    if (genre && genre !== 'All') {
      query.genre = { $in: [new RegExp(`^${genre}$`, 'i')] };
    }

    if (language && language !== 'All') {
      query.language = { $regex: new RegExp(`^${language}$`, 'i') };
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    let sortOption = { releaseDate: -1 };
    if (sort === 'rating') {
      sortOption = { rating: -1 };
    } else if (sort === 'title') {
      sortOption = { title: 1 };
    } else if (sort === 'newest') {
      sortOption = { releaseDate: -1 };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Movie.countDocuments(query);
    const movies = await Movie.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: movies.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      movies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured and trending movies for homepage hero and carousels
// @route   GET /api/movies/featured
// @access  Public
export const getFeaturedAndTrending = async (req, res, next) => {
  try {
    const featured = await Movie.find({ featured: true, status: 'now_showing' }).limit(5);
    const nowShowing = await Movie.find({ status: 'now_showing' }).sort({ rating: -1 }).limit(10);
    const upcoming = await Movie.find({ status: 'upcoming' }).sort({ releaseDate: 1 }).limit(10);
    const trending = await Movie.find().sort({ votesCount: -1, rating: -1 }).limit(8);

    res.status(200).json({
      success: true,
      featured: featured.length > 0 ? featured : nowShowing.slice(0, 3),
      nowShowing,
      upcoming,
      trending,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single movie by ID
// @route   GET /api/movies/:id
// @access  Public
export const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    res.status(200).json({
      success: true,
      movie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new movie (Admin)
// @route   POST /api/movies
// @access  Private/Admin
export const createMovie = async (req, res, next) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Movie created successfully',
      movie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update movie (Admin)
// @route   PUT /api/movies/:id
// @access  Private/Admin
export const updateMovie = async (req, res, next) => {
  try {
    let movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Movie updated successfully',
      movie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete movie (Admin)
// @route   DELETE /api/movies/:id
// @access  Private/Admin
export const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    await Movie.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Movie deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

