import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  getAIRecommendations,
  bookAppointment,
  simulateClinicReply,
  getMyAppointments,
} from '../controllers/appointmentController.js';

const router = express.Router();

// All routes protected (user must be logged in)
router.use(protect);

router.post('/recommend',          getAIRecommendations);  // AI match top 3
router.post('/book',               bookAppointment);        // book + send email
router.post('/:id/simulate-reply', simulateClinicReply);    // demo: simulate clinic reply
router.get('/my',                  getMyAppointments);      // user's appointments

export default router;
