import express from 'express';
import protect from '../middlewares/authMiddleware.js';
import {
  createSession,
  sendMessage,
  getSessions,
  getSession,
  deleteSession,
} from '../controllers/chatController.js';

const router = express.Router();

// All routes are protected — JWT required
router.use(protect);

// Session management
router.post('/session', createSession);           // POST   /api/chat/session
router.get('/sessions', getSessions);             // GET    /api/chat/sessions
router.get('/session/:sessionId', getSession);    // GET    /api/chat/session/:id
router.delete('/session/:sessionId', deleteSession); // DELETE /api/chat/session/:id

// Messaging
router.post('/session/:sessionId/message', sendMessage); // POST /api/chat/session/:id/message

export default router;
