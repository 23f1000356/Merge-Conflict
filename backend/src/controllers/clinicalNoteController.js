import { ClinicalNote, User, Appointment, FollowUp } from '../models/index.js';
import { Op } from 'sequelize';

// Create clinical note
export const createClinicalNote = async (req, res) => {
    try {
        const { patientId, appointmentId, noteType, title, content, severity, actionRequired, dueDate, tags } = req.body;
        const doctorId = req.user.id;

        // Verify patient access
        const patient = await User.findOne({
            where: { id: patientId, doctorId }
        });

        if (!patient) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const note = await ClinicalNote.create({
            patientId,
            doctorId,
            appointmentId,
            noteType: noteType || 'observation',
            title,
            content,
            severity: severity || 'low',
            actionRequired: actionRequired || false,
            dueDate,
            tags: tags || []
        });

        res.status(201).json({
            success: true,
            message: 'Clinical note created successfully',
            note
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get patient's clinical notes
export const getPatientNotes = async (req, res) => {
    try {
        const { patientId } = req.params;
        const doctorId = req.user.id;
        const { noteType = null } = req.query;

        // Verify access
        const patient = await User.findOne({
            where: { id: patientId, doctorId }
        });

        if (!patient) {
            return res.status(403).json({ message: 'Access denied' });
        }

        let where = { patientId };
        if (noteType) {
            where.noteType = noteType;
        }

        const notes = await ClinicalNote.findAll({
            where,
            include: [
                { model: User, as: 'Doctor', attributes: ['fullName'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            count: notes.length,
            notes
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get doctor's recent clinical notes
export const getDoctorNotes = async (req, res) => {
    try {
        const doctorId = req.user.id;
        const { noteType = null, actionRequired = null, limit = 20 } = req.query;

        let where = { doctorId };

        if (noteType) {
            where.noteType = noteType;
        }

        if (actionRequired !== null) {
            where.actionRequired = actionRequired === 'true';
        }

        const notes = await ClinicalNote.findAll({
            where,
            include: [
                { model: User, as: 'Patient', attributes: ['id', 'fullName'] }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit)
        });

        res.json({
            success: true,
            count: notes.length,
            notes
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update clinical note
export const updateClinicalNote = async (req, res) => {
    try {
        const { noteId } = req.params;
        const doctorId = req.user.id;
        const updates = req.body;

        const note = await ClinicalNote.findOne({
            where: { id: noteId, doctorId }
        });

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        const allowedFields = ['title', 'content', 'severity', 'actionRequired', 'dueDate', 'tags', 'noteType'];
        const filteredUpdates = {};

        allowedFields.forEach(field => {
            if (updates.hasOwnProperty(field)) {
                filteredUpdates[field] = updates[field];
            }
        });

        await note.update(filteredUpdates);

        res.json({
            success: true,
            message: 'Clinical note updated',
            note
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete clinical note
export const deleteClinicalNote = async (req, res) => {
    try {
        const { noteId } = req.params;
        const doctorId = req.user.id;

        const note = await ClinicalNote.findOne({
            where: { id: noteId, doctorId }
        });

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        await note.destroy();

        res.json({
            success: true,
            message: 'Clinical note deleted'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get clinical note detail
export const getNotesDetail = async (req, res) => {
    try {
        const { noteId } = req.params;
        const doctorId = req.user.id;

        const note = await ClinicalNote.findOne({
            where: { id: noteId, doctorId },
            include: [
                { model: User, as: 'Patient', attributes: ['id', 'fullName', 'email'] },
                { model: Appointment, attributes: ['appointmentDate', 'appointmentType'] }
            ]
        });

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        res.json({
            success: true,
            note
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get notes for an appointment
export const getAppointmentNotes = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const doctorId = req.user.id;

        // Verify appointment belongs to doctor
        const appointment = await Appointment.findOne({
            where: { id: appointmentId, doctorId }
        });

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        const notes = await ClinicalNote.findAll({
            where: { appointmentId },
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            notes
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get action items (notes with actionRequired = true)
export const getActionItems = async (req, res) => {
    try {
        const doctorId = req.user.id;
        const { dueBy = null } = req.query;

        let where = {
            doctorId,
            actionRequired: true
        };

        if (dueBy) {
            where.dueDate = {
                [Op.lte]: new Date(dueBy)
            };
        }

        const actionItems = await ClinicalNote.findAll({
            where,
            include: [
                { model: User, as: 'Patient', attributes: ['id', 'fullName'] }
            ],
            order: [['dueDate', 'ASC']]
        });

        res.json({
            success: true,
            count: actionItems.length,
            actionItems
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
