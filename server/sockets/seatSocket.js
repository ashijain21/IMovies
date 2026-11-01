import SeatLock from '../models/SeatLock.js';
import Show from '../models/Show.js';

let ioInstance = null;

export const initSeatSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    // Join a room for a specific show
    socket.on('join_show_room', async (showId) => {
      if (!showId) return;
      socket.join(`show_${showId}`);
      socket.currentShowId = showId;

      // Clean up expired locks from DB
      await SeatLock.deleteMany({ expiresAt: { $lt: new Date() } });

      // Send current live state of locks for this show
      const activeLocks = await SeatLock.find({
        showId,
        expiresAt: { $gt: new Date() },
      }).select('seatNumber userId expiresAt');

      socket.emit('show_seat_state', {
        showId,
        lockedSeats: activeLocks.map((l) => ({
          seatNumber: l.seatNumber,
          userId: l.userId,
          expiresAt: l.expiresAt,
        })),
      });
    });

    // Leave show room
    socket.on('leave_show_room', (showId) => {
      if (showId) {
        socket.leave(`show_${showId}`);
      }
    });

    // Handle client disconnect: release any locks tied to socket if not persisted by user session
    socket.on('disconnect', async () => {
      // If needed, we can retain user locks until the 5-min TTL or release socket locks
    });
  });

  // Background interval to periodically prune expired locks and broadcast releases
  setInterval(async () => {
    try {
      const now = new Date();
      const expired = await SeatLock.find({ expiresAt: { $lt: now } });
      if (expired.length > 0) {
        await SeatLock.deleteMany({ expiresAt: { $lt: now } });

        // Group expired seats by showId to broadcast
        const showsAffected = {};
        expired.forEach((lock) => {
          if (!showsAffected[lock.showId]) {
            showsAffected[lock.showId] = [];
          }
          showsAffected[lock.showId].push(lock.seatNumber);
        });

        Object.entries(showsAffected).forEach(([showId, seats]) => {
          io.to(`show_${showId}`).emit('seats_expired', {
            showId,
            seats,
          });
        });
      }
    } catch (err) {
      console.error('[SeatLock Daemon Error]:', err.message);
    }
  }, 10000); // Check every 10 seconds
};

export const getIO = () => ioInstance;

export const broadcastSeatLock = (showId, seats, userId, expiresAt) => {
  if (ioInstance) {
    ioInstance.to(`show_${showId}`).emit('seats_locked', {
      showId,
      seats,
      userId,
      expiresAt,
    });
  }
};

export const broadcastSeatRelease = (showId, seats) => {
  if (ioInstance) {
    ioInstance.to(`show_${showId}`).emit('seats_released', {
      showId,
      seats,
    });
  }
};

export const broadcastSeatBooked = (showId, seats) => {
  if (ioInstance) {
    ioInstance.to(`show_${showId}`).emit('seats_booked', {
      showId,
      seats,
    });
  }
};

