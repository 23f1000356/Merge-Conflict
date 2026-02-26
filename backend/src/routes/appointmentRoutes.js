import express from 'express';
import {
    createAppointment,
    getDoctorAppointments,
    getPatientAppointments,
    updateAppointment,
    cancelAppointment,
    getAppointmentDetails
} from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { verifyPatientAccess, verifyAppointmentAccess, logDataAccess } from '../middleware/dataAccessMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);
router.use(logDataAccess);

// Doctor endpoints
router.post('/', authorize('doctor', 'admin'), createAppointment);
router.get('/doctor', authorize('doctor', 'admin'), getDoctorAppointments);
router.put('/:appointmentId', authorize('doctor', 'admin'), verifyAppointmentAccess, updateAppointment);
router.delete('/:appointmentId/cancel', authorize('doctor', 'admin'), verifyAppointmentAccess, cancelAppointment);
router.get('/:appointmentId', verifyAppointmentAccess, getAppointmentDetails);

// Patient endpoints
router.get('/patient/:patientId', verifyPatientAccess, getPatientAppointments);

export default router;
