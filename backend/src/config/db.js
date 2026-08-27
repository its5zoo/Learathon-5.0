import mongoose from 'mongoose';

let isConnecting = false;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (isConnecting) {
    return null;
  }

  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.warn('MONGO_URI is not set. Running in offline/in-memory mode.');
      return null;
    }

    isConnecting = true;
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnecting = false;

    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    isConnecting = false;
    console.error('Database connection error:', error.message);
    return null;
  }
};

export default connectDB;
