import express from 'express';
import {
    createFollowUp,
    getDoctorFollowUps,
    getPatientFollowUps,
    updateFollowUp,
    sendFollowUpReminders,
    getOverdueFollowUps,
    getFollowUpDetail
} from '../controllers/followUpController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { verifyPatientAccess, logDataAccess } from '../middleware/dataAccessMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);
router.use(authorize('doctor', 'admin'));
router.use(logDataAccess);

// Create follow-up
router.post('/', createFollowUp);

// Get doctor's follow-ups
router.get('/', getDoctorFollowUps);

// Get overdue follow-ups
router.get('/overdue', getOverdueFollowUps);

// Send reminders (could be called by scheduler)
router.post('/reminders/send', sendFollowUpReminders);

// Get patient follow-ups
router.get('/patient/:patientId', verifyPatientAccess, getPatientFollowUps);

// Get follow-up detail
router.get('/:followUpId', getFollowUpDetail);

// Update follow-up
router.put('/:followUpId', updateFollowUp);

export default router;
