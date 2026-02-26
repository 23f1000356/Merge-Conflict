import express from 'express';
import {
    generatePatientReport,
    generatePatientSummary,
    generateCohortReport
} from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { verifyPatientAccess, logDataAccess } from '../middleware/dataAccessMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);
router.use(authorize('doctor', 'admin'));
router.use(logDataAccess);

// Generate comprehensive PDF report
router.get('/:patientId/pdf', verifyPatientAccess, generatePatientReport);

// Generate text summary report
router.get('/:patientId/summary', verifyPatientAccess, generatePatientSummary);

// Generate cohort analysis
router.get('/cohort/analysis', generateCohortReport);

export default router;
