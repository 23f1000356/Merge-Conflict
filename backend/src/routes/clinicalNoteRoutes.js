import express from 'express';
import {
    createClinicalNote,
    getPatientNotes,
    getDoctorNotes,
    updateClinicalNote,
    deleteClinicalNote,
    getNotesDetail,
    getAppointmentNotes,
    getActionItems
} from '../controllers/clinicalNoteController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { verifyPatientAccess, verifyClinicalNoteAccess, logDataAccess, validateMedicalNote } from '../middleware/dataAccessMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);
router.use(authorize('doctor', 'admin'));
router.use(logDataAccess);

// Create clinical note
router.post('/', validateMedicalNote, createClinicalNote);

// Get doctor's notes
router.get('/doctor/notes', getDoctorNotes);

// Get action items
router.get('/doctor/action-items', getActionItems);

// Get patient notes
router.get('/patient/:patientId', verifyPatientAccess, getPatientNotes);

// Get notes for specific appointment
router.get('/appointment/:appointmentId', getAppointmentNotes);

// Get note detail
router.get('/:noteId', getNotesDetail);

// Update note
router.put('/:noteId', verifyClinicalNoteAccess, validateMedicalNote, updateClinicalNote);

// Delete note
router.delete('/:noteId', verifyClinicalNoteAccess, deleteClinicalNote);

export default router;
