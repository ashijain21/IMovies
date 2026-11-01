import crypto from 'crypto';
import Booking from '../models/Booking.js';
import Show from '../models/Show.js';
import SeatLock from '../models/SeatLock.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';
import { generateQRCode } from '../utils/qrHelper.js';
import { broadcastSeatLock, broadcastSeatRelease, broadcastSeatBooked } from '../sockets/seatSocket.js';

// @desc    Lock seats temporarily (5 min TTL)
// @route   POST /api/bookings/lock-seats
// @access  Private
export const lockSeats = async (req, res, next) => {
  try {
    const { showId, seats, socketId } = req.body;
    const userId = req.user.id;

    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    // 1. Check if any seat is already booked
    const alreadyBooked = seats.filter((seat) => show.bookedSeats.includes(seat));
    if (alreadyBooked.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Seats [${alreadyBooked.join(', ')}] are already booked. Please choose other seats.`,
      });
    }

    // 2. Prune expired locks
    const now = new Date();
    await SeatLock.deleteMany({ expiresAt: { $lt: now } });

    // 3. Check if any seat is currently locked by another user
    const conflictingLocks = await SeatLock.find({
      showId,
      seatNumber: { $in: seats },
      userId: { $ne: userId },
      expiresAt: { $gt: now },
    });

    if (conflictingLocks.length > 0) {
      const lockedByOthers = conflictingLocks.map((l) => l.seatNumber);
      return res.status(409).json({
        success: false,
        message: `Seats [${lockedByOthers.join(', ')}] are currently held by another customer. Please select different seats.`,
      });
    }

    // 4. Release any existing locks by this user on other seats for this show
    await SeatLock.deleteMany({ showId, userId });

    // 5. Create new 5-minute locks
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const lockDocs = seats.map((seat) => ({
      showId,
      seatNumber: seat,
      userId,
      socketId: socketId || '',
      expiresAt,
    }));

    await SeatLock.insertMany(lockDocs);

    // 6. Broadcast seat lock event
    broadcastSeatLock(showId, seats, userId, expiresAt);

    res.status(200).json({
      success: true,
      message: 'Seats locked successfully for 5 minutes',
      lockedSeats: seats,
      expiresAt,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Release temporarily locked seats
// @route   DELETE /api/bookings/release-seats
// @access  Private
export const releaseSeats = async (req, res, next) => {
  try {
    const { showId, seats } = req.body;
    const userId = req.user.id;

    const query = { showId, userId };
    if (seats && seats.length > 0) {
      query.seatNumber = { $in: seats };
    }

    const locksToRemove = await SeatLock.find(query);
    const releasedSeats = locksToRemove.map((l) => l.seatNumber);

    await SeatLock.deleteMany(query);

    if (releasedSeats.length > 0) {
      broadcastSeatRelease(showId, releasedSeats);
    }

    res.status(200).json({
      success: true,
      message: 'Seats released successfully',
      releasedSeats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create booking order (pricing calculations)
// @route   POST /api/bookings/calculate-order
// @access  Private
export const calculateOrder = async (req, res, next) => {
  try {
    const { showId, selectedSeats } = req.body;

    const show = await Show.findById(showId).populate('movieId theatreId screenId');
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    const subtotal = selectedSeats.reduce((acc, seat) => acc + (seat.price || show.basePrice), 0);
    const convenienceFee = Math.round(selectedSeats.length * 25);
    const taxes = Math.round((subtotal + convenienceFee) * 0.18); // 18% GST
    const discount = req.body.couponCode === 'IMOVIES50' ? Math.min(100, Math.round(subtotal * 0.2)) : 0;
    const totalAmount = Math.max(0, subtotal + convenienceFee + taxes - discount);

    res.status(200).json({
      success: true,
      summary: {
        movieTitle: show.movieId.title,
        theatreName: show.theatreId.name,
        screenName: show.screenId.screenName,
        showDate: show.showDate,
        startTime: show.startTime,
        selectedSeats,
        seatCount: selectedSeats.length,
        subtotal,
        convenienceFee,
        taxes,
        discount,
        totalAmount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm booking atomically after payment verification
// @route   POST /api/bookings/confirm
// @access  Private
export const confirmBooking = async (req, res, next) => {
  try {
    const {
      showId,
      selectedSeats,
      paymentMethod = 'mock',
      gatewayOrderId,
      gatewayPaymentId,
      gatewaySignature,
    } = req.body;

    const userId = req.user.id;

    const show = await Show.findById(showId).populate('movieId theatreId screenId');
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    const seatNumbers = selectedSeats.map((s) => s.seatNumber);

    // Verify seats aren't already booked
    const alreadyBooked = seatNumbers.filter((seat) => show.bookedSeats.includes(seat));
    if (alreadyBooked.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Seats [${alreadyBooked.join(', ')}] were already purchased.`,
      });
    }

    // Calculate amounts
    const subtotal = selectedSeats.reduce((acc, seat) => acc + seat.price, 0);
    const convenienceFee = Math.round(selectedSeats.length * 25);
    const taxes = Math.round((subtotal + convenienceFee) * 0.18);
    const discount = req.body.discount || 0;
    const totalAmount = Math.max(0, subtotal + convenienceFee + taxes - discount);

    // Generate readable Unique Booking ID: IMV-YYYYMMDD-XXXX
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const dateStr = show.showDate.replace(/-/g, '');
    const bookingId = `IMV-${dateStr}-${randomSuffix}`;

    // Generate QR code with ticket verification payload
    const qrData = {
      bookingId,
      movie: show.movieId.title,
      theatre: show.theatreId.name,
      screen: show.screenId.screenName,
      date: show.showDate,
      time: show.startTime,
      seats: seatNumbers,
      totalAmount,
      bookedBy: req.user.email,
    };
    const qrCode = await generateQRCode(qrData);

    // Create Booking Document
    const booking = await Booking.create({
      bookingId,
      userId,
      showId,
      movieId: show.movieId._id,
      theatreId: show.theatreId._id,
      selectedSeats,
      subtotal,
      convenienceFee,
      taxes,
      discount,
      totalAmount,
      bookingStatus: 'confirmed',
      paymentStatus: 'paid',
      qrCode,
    });

    // Create Payment Record
    const transactionId = gatewayPaymentId || `TXN-${Date.now()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    const payment = await Payment.create({
      bookingId: booking._id,
      userId,
      transactionId,
      amount: totalAmount,
      paymentMethod,
      paymentStatus: 'captured',
      paymentGateway: paymentMethod === 'mock' ? 'mock' : 'razorpay',
      gatewayOrderId: gatewayOrderId || '',
      gatewayPaymentId: gatewayPaymentId || '',
      gatewaySignature: gatewaySignature || '',
    });

    booking.paymentId = payment._id;
    await booking.save();

    // Atomically push bookedSeats to Show
    await Show.findByIdAndUpdate(showId, {
      $push: { bookedSeats: { $each: seatNumbers } },
      $inc: { availableSeats: -seatNumbers.length },
    });

    // Remove seat locks for this user
    await SeatLock.deleteMany({ showId, seatNumber: { $in: seatNumbers } });

    // Create user notification
    await Notification.create({
      userId,
      title: 'Booking Confirmed! 🍿',
      message: `Your booking for ${show.movieId.title} (${seatNumbers.join(', ')}) at ${show.theatreId.name} on ${show.showDate} is confirmed. Booking ID: ${bookingId}`,
      type: 'booking_confirmation',
      data: {
        bookingId: booking._id,
        link: `/booking/confirmation/${booking._id}`,
      },
    });

    // Broadcast seat booked event to all users watching this show
    broadcastSeatBooked(showId, seatNumbers);

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      booking: {
        _id: booking._id,
        bookingId: booking.bookingId,
        movie: show.movieId,
        theatre: show.theatreId,
        screen: show.screenId,
        showDate: show.showDate,
        startTime: show.startTime,
        selectedSeats: booking.selectedSeats,
        totalAmount: booking.totalAmount,
        qrCode: booking.qrCode,
        bookingStatus: booking.bookingStatus,
        paymentStatus: booking.paymentStatus,
        createdAt: booking.createdAt,
      },
      payment: {
        transactionId: payment.transactionId,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's bookings history
// @route   GET /api/bookings/my-bookings
// @access  Private
export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate('movieId', 'title poster backdrop duration certification language')
      .populate('theatreId', 'name location city address')
      .populate('showId', 'showDate startTime screenId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking details by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('movieId')
      .populate('theatreId')
      .populate({
        path: 'showId',
        populate: { path: 'screenId' },
      })
      .populate('userId', 'name email phone')
      .populate('paymentId');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Only owner or admin can view
    if (booking.userId._id.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel eligible booking
// @route   PATCH /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('movieId')
      .populate('theatreId')
      .populate('showId');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.userId.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    // Cancellation policy: 20% cancellation fee, 80% refund
    const cancellationFee = Math.round(booking.totalAmount * 0.2);
    const refundAmount = booking.totalAmount - cancellationFee;

    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    booking.cancellationDetails = {
      cancelledAt: new Date(),
      cancellationFee,
      refundAmount,
      reason: req.body.reason || 'Customer cancelled reservation',
    };
    await booking.save();

    // Release seats from Show
    const seatNumbers = booking.selectedSeats.map((s) => s.seatNumber);
    if (booking.showId) {
      await Show.findByIdAndUpdate(booking.showId._id, {
        $pull: { bookedSeats: { $in: seatNumbers } },
        $inc: { availableSeats: seatNumbers.length },
      });

      broadcastSeatRelease(booking.showId._id, seatNumbers);
    }

    // Create cancellation notification
    await Notification.create({
      userId: booking.userId,
      title: 'Booking Cancelled',
      message: `Your booking ${booking.bookingId} for ${booking.movieId?.title || 'movie'} has been cancelled. Refund of ₹${refundAmount} has been processed.`,
      type: 'cancellation',
      data: {
        bookingId: booking._id,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. Refund processed.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

