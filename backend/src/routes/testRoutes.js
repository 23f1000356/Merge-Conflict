import express from 'express';
import { submitTest, getTestHistory } from '../controllers/testController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/submit', protect, submitTest);
router.get('/history', protect, getTestHistory);

export default router;
