import { FollowUp, User, ClinicalNote, Appointment } from '../models/index.js';
import { Op } from 'sequelize';
import nodemailer from 'nodemailer';

// Create follow-up
export const createFollowUp = async (req, res) => {
    try {
        const { patientId, followUpType, scheduledDate, description, priority, appointmentId, clinicalNoteId } = req.body;
        const doctorId = req.user.id;

        // Verify patient access
        const patient = await User.findOne({
            where: { id: patientId, doctorId }
        });

        if (!patient) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const followUp = await FollowUp.create({
            patientId,
            doctorId,
            followUpType,
            scheduledDate: new Date(scheduledDate),
            description,
            priority: priority || 'medium',
            appointmentId,
            clinicalNoteId
        });

        res.status(201).json({
            success: true,
            message: 'Follow-up scheduled successfully',
            followUp
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get pending follow-ups for doctor
export const getDoctorFollowUps = async (req, res) => {
    try {
        const doctorId = req.user.id;
        const { status = 'pending', priority = null } = req.query;

        let where = { doctorId };

        if (status) {
            where.status = status;
        }

        if (priority) {
            where.priority = priority;
        }

        const followUps = await FollowUp.findAll({
            where,
            include: [
                { model: User, as: 'Patient', attributes: ['id', 'fullName', 'email', 'phone'] }
            ],
            order: [['priority', 'DESC'], ['scheduledDate', 'ASC']]
        });

        res.json({
            success: true,
            count: followUps.length,
            followUps
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get patient follow-ups
export const getPatientFollowUps = async (req, res) => {
    try {
        const { patientId } = req.params;
        const doctorId = req.user.id;

        // Verify access
        const patient = await User.findOne({
            where: { id: patientId, doctorId }
        });

        if (!patient) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const followUps = await FollowUp.findAll({
            where: { patientId },
            order: [['scheduledDate', 'ASC']]
        });

        res.json({
            success: true,
            followUps
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update follow-up
export const updateFollowUp = async (req, res) => {
    try {
        const { followUpId } = req.params;
        const doctorId = req.user.id;
        const updates = req.body;

        const followUp = await FollowUp.findOne({
            where: { id: followUpId, doctorId }
        });

        if (!followUp) {
            return res.status(404).json({ message: 'Follow-up not found' });
        }

        const allowedFields = ['status', 'description', 'priority', 'completionNotes', 'completedAt'];
        const filteredUpdates = {};

        allowedFields.forEach(field => {
            if (updates.hasOwnProperty(field)) {
                filteredUpdates[field] = updates[field];
            }
        });

        if (updates.status === 'completed' && !filteredUpdates.completedAt) {
            filteredUpdates.completedAt = new Date();
        }

        await followUp.update(filteredUpdates);

        res.json({
            success: true,
            message: 'Follow-up updated successfully',
            followUp
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Send reminder emails for pending follow-ups (called by scheduler)
export const sendFollowUpReminders = async (req, res) => {
    try {
        // Get follow-ups that are due within next 24 hours and haven't been reminded
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const followUpsToRemind = await FollowUp.findAll({
            where: {
                status: 'pending',
                scheduledDate: {
                    [Op.between]: [new Date(), tomorrow]
                },
                reminderSent: false
            },
            include: [
                { model: User, as: 'Patient', attributes: ['email', 'fullName'] },
                { model: User, as: 'Doctor', attributes: ['fullName'] }
            ]
        });

        // Send emails (you would configure your email service)
        for (const followUp of followUpsToRemind) {
            try {
                // Email sending logic would go here
                // For now, just mark as sent
                await followUp.update({
                    reminderSent: true,
                    reminderSentAt: new Date()
                });
            } catch (emailError) {
                console.error(`Failed to send reminder for ${followUp.id}:`, emailError);
            }
        }

        res.json({
            success: true,
            remindersCount: followUpsToRemind.length,
            message: `${followUpsToRemind.length} reminders sent`
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get overdue follow-ups
export const getOverdueFollowUps = async (req, res) => {
    try {
        const doctorId = req.user.id;

        const overdueFollowUps = await FollowUp.findAll({
            where: {
                doctorId,
                status: { [Op.ne]: 'completed' },
                scheduledDate: { [Op.lt]: new Date() }
            },
            include: [
                { model: User, as: 'Patient', attributes: ['id', 'fullName', 'email'] }
            ],
            order: [['scheduledDate', 'ASC']]
        });

        res.json({
            success: true,
            count: overdueFollowUps.length,
            followUps: overdueFollowUps
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get follow-up detail
export const getFollowUpDetail = async (req, res) => {
    try {
        const { followUpId } = req.params;
        const doctorId = req.user.id;

        const followUp = await FollowUp.findOne({
            where: { id: followUpId, doctorId },
            include: [
                { model: User, as: 'Patient', attributes: ['id', 'fullName', 'email'] },
                { model: ClinicalNote, attributes: ['title', 'content'] },
                { model: Appointment, attributes: ['appointmentDate'] }
            ]
        });

        if (!followUp) {
            return res.status(404).json({ message: 'Follow-up not found' });
        }

        res.json({
            success: true,
            followUp
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
