import express from 'express';
import { saveAssessment, getAssessmentHistory } from '../controllers/assessmentController.js';
import protect from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/save', saveAssessment);
router.get('/history', getAssessmentHistory);

export default router;
