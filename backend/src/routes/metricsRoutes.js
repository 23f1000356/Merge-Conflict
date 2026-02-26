import express from 'express';
import {
    getPatientTrends,
    getPatientComparison,
    getBaselineComparison
} from '../controllers/patientMetricsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { verifyPatientAccess, logDataAccess } from '../middleware/dataAccessMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);
router.use(authorize('doctor', 'admin'));
router.use(logDataAccess);

// Get patient trend analysis
router.get('/:patientId/trends', verifyPatientAccess, getPatientTrends);

// Get patient comparison (vs cohort)
router.get('/:patientId/comparison', verifyPatientAccess, getPatientComparison);

// Get baseline comparison
router.get('/:patientId/baseline', verifyPatientAccess, getBaselineComparison);

export default router;
