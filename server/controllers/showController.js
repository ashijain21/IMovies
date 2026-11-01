import Show from '../models/Show.js';
import Screen from '../models/Screen.js';
import SeatLock from '../models/SeatLock.js';

// @desc    Get shows with filters (movieId, date, theatreId, city)
// @route   GET /api/shows
// @access  Public
export const getShows = async (req, res, next) => {
  try {
    const { movieId, theatreId, showDate, city } = req.query;
    const query = { status: 'scheduled' };

    if (movieId) query.movieId = movieId;
    if (theatreId) query.theatreId = theatreId;
    if (showDate) query.showDate = showDate;

    let shows = await Show.find(query)
      .populate('movieId', 'title poster duration rating certification language')
      .populate('theatreId', 'name location address city facilities')
      .populate('screenId', 'screenName screenType totalSeats seatCategories')
      .sort({ showDate: 1, startTime: 1 });

    // Filter by theatre city if specified
    if (city && city !== 'All') {
      shows = shows.filter(
        (show) =>
          show.theatreId &&
          show.theatreId.city.toLowerCase() === city.toLowerCase()
      );
    }

    res.status(200).json({
      success: true,
      count: shows.length,
      shows,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single show by ID
// @route   GET /api/shows/:id
// @access  Public
export const getShowById = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movieId')
      .populate('theatreId')
      .populate('screenId');

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found',
      });
    }

    res.status(200).json({
      success: true,
      show,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get seat status for a show (layout + booked + active locks)
// @route   GET /api/shows/:id/seats
// @access  Public (optional auth)
export const getShowSeats = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id).populate('screenId');

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found',
      });
    }

    const currentUserId = req.user ? req.user.id.toString() : null;

    // Prune expired locks
    const now = new Date();
    await SeatLock.deleteMany({ expiresAt: { $lt: now } });

    // Find active locks for this show
    const activeLocks = await SeatLock.find({
      showId: show._id,
      expiresAt: { $gt: now },
    });

    const otherLockedSeats = [];
    const myLockedSeats = [];
    let myLockExpiry = null;

    activeLocks.forEach((lock) => {
      if (currentUserId && lock.userId.toString() === currentUserId) {
        myLockedSeats.push(lock.seatNumber);
        if (!myLockExpiry || lock.expiresAt > myLockExpiry) {
          myLockExpiry = lock.expiresAt;
        }
      } else {
        otherLockedSeats.push(lock.seatNumber);
      }
    });

    res.status(200).json({
      success: true,
      show: {
        id: show._id,
        movieId: show.movieId,
        theatreId: show.theatreId,
        screenId: show.screenId._id,
        screenName: show.screenId.screenName,
        screenType: show.screenId.screenType,
        showDate: show.showDate,
        startTime: show.startTime,
        basePrice: show.basePrice,
        pricing: show.pricing,
      },
      seatCategories: show.screenId.seatCategories,
      bookedSeats: show.bookedSeats || [],
      lockedSeats: otherLockedSeats,
      myLockedSeats,
      myLockExpiry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new show (Admin) with conflict checking
// @route   POST /api/shows
// @access  Private/Admin
export const createShow = async (req, res, next) => {
  try {
    const { movieId, theatreId, screenId, showDate, startTime, endTime, basePrice, pricing } = req.body;

    // Check if screen exists and capacity
    const screen = await Screen.findById(screenId);
    if (!screen) {
      return res.status(404).json({
        success: false,
        message: 'Target screen does not exist',
      });
    }

    // Check conflict on same screen, same date, same startTime
    const conflict = await Show.findOne({
      screenId,
      showDate,
      startTime,
      status: { $ne: 'cancelled' },
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: `Conflict: Screen '${screen.screenName}' already has a show scheduled at ${startTime} on ${showDate}.`,
      });
    }

    const show = await Show.create({
      movieId,
      theatreId,
      screenId,
      showDate,
      startTime,
      endTime,
      basePrice: basePrice || 250,
      pricing: pricing || {
        vip: Math.round(basePrice * 1.6) || 450,
        gold: Math.round(basePrice * 1.25) || 320,
        silver: basePrice || 220,
      },
      availableSeats: screen.totalSeats,
      bookedSeats: [],
    });

    res.status(201).json({
      success: true,
      message: 'Show scheduled successfully',
      show,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update show (Admin)
// @route   PUT /api/shows/:id
// @access  Private/Admin
export const updateShow = async (req, res, next) => {
  try {
    const show = await Show.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Show updated successfully',
      show,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete or cancel show (Admin)
// @route   DELETE /api/shows/:id
// @access  Private/Admin
export const deleteShow = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id);

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found',
      });
    }

    await Show.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Show deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

