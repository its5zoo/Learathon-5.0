import express from 'express';
import { register, login, demoLogin, getMe, updateProfile, logMood } from '../controllers/authController.js';
import protect from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/demo-login', demoLogin);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/mood', protect, logMood);

export default router;
