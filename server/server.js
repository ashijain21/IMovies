import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import { initSeatSocket } from './sockets/seatSocket.js';
import Movie from './models/Movie.js';
import { seedDatabase } from './utils/seed.js';

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  },
});

// Setup Real-Time Seat Engine
initSeatSocket(io);

// Start server after connecting to database
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is empty
    const movieCount = await Movie.countDocuments();
    if (movieCount === 0) {
      console.log('[Startup] No movies found in database. Running initial database seeding...');
      await seedDatabase();
    } else {
      console.log(`[Startup] Database already contains ${movieCount} movies. Ready!`);
    }

    server.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🎬 IMOVIES BACKEND & REAL-TIME SERVER RUNNING ON PORT ${PORT}`);
      console.log(`🚀 Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Base URL: http://localhost:${PORT}`);
      console.log(`🔌 Socket.IO: Connected & Listening on port ${PORT}`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Fatal Server Boot Error:', error);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
});

