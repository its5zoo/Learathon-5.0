import express from 'express';
import protect from '../middlewares/authMiddleware.js';
import {
  createSession,
  sendMessage,
  getSessions,
  getSession,
  deleteSession,
  recordMessageFeedback,
} from '../controllers/chatController.js';

const router = express.Router();

router.use(protect);

router.post('/session', createSession);
router.get('/sessions', getSessions);
router.get('/session/:sessionId', getSession);
router.delete('/session/:sessionId', deleteSession);
router.post('/session/:sessionId/message', sendMessage);
router.post('/session/:sessionId/feedback', recordMessageFeedback);

export default router;
