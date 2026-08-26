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

// Connect to MongoDB Atlas, then start background services
connectDB().then(() => {
  // Start Gmail IMAP inbox poller (checks for clinic reply emails every 60s)
  const pollInterval = parseInt(process.env.IMAP_POLL_INTERVAL_MS || '60000', 10);
  startInboxPoller(pollInterval);
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: 'http://localhost:5173', // Vite frontend dev server
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
