import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/imovies';
  const forceMemory = process.env.USE_MEMORY_DB === 'true';

  if (!forceMemory) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 2500,
      });
      console.log(`[Database] MongoDB Connected to host: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(`[Database] Direct MongoDB connection failed (${err.message}). Falling back to MongoMemoryServer...`);
    }
  }

  try {
    mongod = await MongoMemoryServer.create();
    const memUri = mongod.getUri();
    const conn = await mongoose.connect(memUri);
    console.log(`[Database] In-Memory MongoDB Started & Connected: ${memUri}`);
    return conn;
  } catch (error) {
    console.error(`[Database] Fatal: Failed to initialize MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};

