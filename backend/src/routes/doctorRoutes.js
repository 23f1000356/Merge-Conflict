import express from 'express';
import {
    getDoctorDashboard,
    getPatientOverview,
    getDashboardPatients
} from '../controllers/doctorController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { logDataAccess } from '../middleware/dataAccessMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);
router.use(authorize('doctor', 'admin'));
router.use(logDataAccess);

// Dashboard endpoint
router.get('/dashboard', getDoctorDashboard);

// Get all patients assigned to doctor with metrics
router.get('/patients', getDashboardPatients);

// Get quick overview for specific patient
router.get('/patient/:patientId/overview', getPatientOverview);

export default router;
