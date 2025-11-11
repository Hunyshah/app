import mongoose from "mongoose";
const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  throw new Error("MONGODB_URL is not defined");
}

// Cache the connection to avoid multiple connections in serverless
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true, // Allow buffering for serverless environments
    };

    cached.promise = mongoose.connect(MONGODB_URL, opts).then((mongoose) => {
      console.log("Connected to MongoDB successfully");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    // Ensure connection is ready
    if (mongoose.connection.readyState !== 1) {
      throw new Error("MongoDB connection not ready");
    }
  } catch (e) {
    cached.promise = null;
    console.error("Error connecting to MongoDB", e);
    throw e;
  }

  return cached.conn;
};
