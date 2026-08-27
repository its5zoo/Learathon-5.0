import mongoose from 'mongoose';

let isConnected = false;

const connectDB = async () => {
  // If already connected, reuse existing connection (Serverless warm container)
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.warn('⚠️ MONGO_URI is not defined in environment variables.');
      return null;
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false,
    });

    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // DO NOT use process.exit(1) in serverless environments as it crashes the lambda invocation
    return null;
  }
};


// Mongoose event listeners for connection health monitoring
mongoose.connection.on('connected', () => {
  console.log('🟢 Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('disconnected', () => {
  console.log('🔴 Mongoose disconnected from MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
  console.error(`⚠️  Mongoose connection error: ${err.message}`);
});

export default connectDB;
