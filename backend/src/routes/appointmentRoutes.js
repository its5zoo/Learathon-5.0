import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  getAIRecommendations,
  bookAppointment,
  simulateClinicReply,
  getMyAppointments,
  getAppointmentStatus,
} from '../controllers/appointmentController.js';

const router = express.Router();

router.use(protect);

router.post('/recommend', getAIRecommendations);
router.post('/book', bookAppointment);
router.post('/:id/simulate-reply', simulateClinicReply);
router.get('/:id/status', getAppointmentStatus);
router.get('/my', getMyAppointments);

export default router;
