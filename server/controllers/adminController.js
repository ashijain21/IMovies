import User from '../models/User.js';
import Movie from '../models/Movie.js';
import Theatre from '../models/Theatre.js';
import Screen from '../models/Screen.js';
import Show from '../models/Show.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';

// @desc    Get Admin Dashboard Overview Stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalMovies = await Movie.countDocuments();
    const totalTheatres = await Theatre.countDocuments({ status: 'active' });
    const totalScreens = await Screen.countDocuments({ status: 'active' });
    const totalShows = await Show.countDocuments({ status: { $ne: 'cancelled' } });
    const totalBookings = await Booking.countDocuments({ bookingStatus: 'confirmed' });

    // Revenue calculation
    const revenueAgg = await Booking.aggregate([
      { $match: { bookingStatus: 'confirmed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    // Today's bookings
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayBookingsCount = await Booking.countDocuments({
      createdAt: { $gte: startOfToday },
      bookingStatus: 'confirmed',
    });

    // Recent 5 bookings
    const recentBookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('movieId', 'title poster')
      .populate('theatreId', 'name city')
      .sort({ createdAt: -1 })
      .limit(5);

    // Upcoming 5 shows
    const todayStr = new Date().toISOString().split('T')[0];
    const upcomingShows = await Show.find({
      showDate: { $gte: todayStr },
      status: 'scheduled',
    })
      .populate('movieId', 'title poster duration')
      .populate('theatreId', 'name city')
      .populate('screenId', 'screenName')
      .sort({ showDate: 1, startTime: 1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalMovies,
        totalTheatres,
        totalScreens,
        totalShows,
        totalBookings,
        totalRevenue,
        todayBookingsCount,
      },
      recentBookings,
      upcomingShows,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed Analytics and Reports
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAnalytics = async (req, res, next) => {
  try {
    // 1. Revenue over the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyRevenueAgg = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          bookingStatus: 'confirmed',
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          bookingsCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill missing days with zero
    const dailyRevenue = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found = dailyRevenueAgg.find((item) => item._id === dateStr);
      dailyRevenue.push({
        date: dateStr,
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: found ? found.revenue : 0,
        bookings: found ? found.bookingsCount : 0,
      });
    }

    // 2. Most Popular Movies (by booking count)
    const popularMoviesAgg = await Booking.aggregate([
      { $match: { bookingStatus: 'confirmed' } },
      {
        $group: {
          _id: '$movieId',
          bookingCount: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { bookingCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'movies',
          localField: '_id',
          foreignField: '_id',
          as: 'movie',
        },
      },
      { $unwind: '$movie' },
      {
        $project: {
          title: '$movie.title',
          poster: '$movie.poster',
          bookingCount: 1,
          totalRevenue: 1,
        },
      },
    ]);

    // 3. Payment Method breakdown
    const paymentMethodsAgg = await Payment.aggregate([
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          amount: { $sum: '$amount' },
        },
      },
    ]);

    // 4. Most Visited Theatres
    const theatrePopularityAgg = await Booking.aggregate([
      { $match: { bookingStatus: 'confirmed' } },
      {
        $group: {
          _id: '$theatreId',
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { totalBookings: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'theatres',
          localField: '_id',
          foreignField: '_id',
          as: 'theatre',
        },
      },
      { $unwind: '$theatre' },
      {
        $project: {
          name: '$theatre.name',
          city: '$theatre.city',
          totalBookings: 1,
          totalRevenue: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      dailyRevenue,
      popularMovies: popularMoviesAgg,
      theatrePopularity: theatrePopularityAgg,
      paymentBreakdown: paymentMethodsAgg,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/admin/bookings
// @access  Private/Admin
export const getAllBookings = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 15 } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.bookingStatus = status;
    }

    if (search) {
      query.$or = [
        { bookingId: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('userId', 'name email phone')
      .populate('movieId', 'title poster')
      .populate('theatreId', 'name city')
      .populate('showId', 'showDate startTime')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 15 } = req.query;
    const query = {};

    if (role && role !== 'All') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role or status (Admin)
// @route   PATCH /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

