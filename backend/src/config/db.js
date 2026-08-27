import mongoose from 'mongoose';

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  try {
    const uri = process.env.MONGO_URI;
    if (!uri) return null;

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false,
    });

    return conn;
  } catch (error) {
    console.error('Database connection error:', error.message);
    return null;
  }
};

export default connectDB;
