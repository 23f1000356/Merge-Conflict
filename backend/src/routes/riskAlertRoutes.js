import express from 'express';
import {
    analyzePatientRisk,
    getDoctorAlerts,
    getPatientAlerts,
    updateAlert,
    getAlertDetail
} from '../controllers/riskAlertController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { verifyPatientAccess, logDataAccess } from '../middleware/dataAccessMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);
router.use(authorize('doctor', 'admin'));
router.use(logDataAccess);

// Get all alerts for doctor
router.get('/', getDoctorAlerts);

// Analyze patient risk and generate alerts
router.post('/analyze/:patientId', verifyPatientAccess, analyzePatientRisk);

// Get patient alerts
router.get('/patient/:patientId', verifyPatientAccess, getPatientAlerts);

// Get alert detail
router.get('/:alertId', getAlertDetail);

// Update alert status
router.put('/:alertId', updateAlert);

export default router;
