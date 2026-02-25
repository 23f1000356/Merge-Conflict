import express from 'express';
import { getPatients, getPatientDetail, getAllUsers, updateRole } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/patients', protect, authorize('doctor', 'admin'), getPatients);
router.get('/patients/:id', protect, authorize('doctor', 'admin'), getPatientDetail);
router.get('/all', protect, authorize('admin'), getAllUsers);
router.put('/role/:id', protect, authorize('admin'), updateRole);

export default router;
