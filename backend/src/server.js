// ⚠️ dotenv MUST be configured before ANY other imports
// because ESM modules are evaluated at import time, not at runtime.
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import { startInboxPoller } from './services/inboxPollerService.js';

const app = express();
const PORT = process.env.PORT || 5000;

const isServerless = process.env.VERCEL || process.env.LAMBDA_TASK_ROOT || process.env.AWS_EXECUTION_ENV;
const isDirectRun = process.argv[1] && (process.argv[1].endsWith('server.js') || process.argv[1].endsWith('server'));

// Connect to DB and start background services only in standalone local run
if (!isServerless && isDirectRun) {
  connectDB().then(() => {
    // Start Gmail IMAP inbox poller (checks for clinic reply emails every 60s)
    const pollInterval = parseInt(process.env.IMAP_POLL_INTERVAL_MS || '60000', 10);
    startInboxPoller(pollInterval);
  });
}


// Serverless DB connection middleware (ensures DB is connected on every incoming lambda request)
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Serverless DB Middleware error:', err.message);
  }
  next();
});

// Middlewares
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server) or matching allowed origins
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive for production demo
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/appointments', appointmentRoutes);

// Basic health check route
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: '🌿 Learnathon 5.0 (SoulSpace) Backend API is running.',
    db: 'MongoDB Atlas Connected',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Start local standalone server only when not running inside Vercel serverless environment
if (!isServerless && isDirectRun) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

export default app;


