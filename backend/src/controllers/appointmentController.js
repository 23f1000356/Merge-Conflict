import { Appointment, User, ClinicalNote, FollowUp } from '../models/index.js';
import { Op } from 'sequelize';

// Create appointment
export const createAppointment = async (req, res) => {
    try {
        const { patientId, appointmentDate, duration, appointmentType, reason, location, videoCallLink } = req.body;
        const doctorId = req.user.id;

        // Validate patient belongs to doctor
        const patient = await User.findOne({
            where: { id: patientId, doctorId }
        });

        if (!patient) {
            return res.status(403).json({ message: 'Patient not found or access denied' });
        }

        // Check for booking conflicts
        const conflict = await Appointment.findOne({
            where: {
                doctorId,
                appointmentDate: new Date(appointmentDate),
                status: { [Op.in]: ['scheduled', 'in-progress'] }
            }
        });

        if (conflict) {
            return res.status(400).json({ message: 'Time slot already booked' });
        }

        const appointment = await Appointment.create({
            patientId,
            doctorId,
            appointmentDate: new Date(appointmentDate),
            duration: duration || 30,
            appointmentType: appointmentType || 'consultation',
            reason,
            location,
            videoCallLink
        });

        res.status(201).json({
            success: true,
            message: 'Appointment created successfully',
            appointment
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get doctor's appointments
export const getDoctorAppointments = async (req, res) => {
    try {
        const doctorId = req.user.id;
        const { status = null, startDate = null, endDate = null } = req.query;

        let where = { doctorId };

        if (status) {
            where.status = status;
        }

        if (startDate && endDate) {
            where.appointmentDate = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const appointments = await Appointment.findAll({
            where,
            include: [
                { model: User, as: 'Patient', attributes: ['id', 'fullName', 'email', 'phone'] }
            ],
            order: [['appointmentDate', 'ASC']]
        });

        res.json({
            success: true,
            count: appointments.length,
            appointments
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get patient appointments
export const getPatientAppointments = async (req, res) => {
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

        const appointments = await Appointment.findAll({
            where: { patientId },
            include: [
                { model: User, as: 'Doctor', attributes: ['fullName'] }
            ],
            order: [['appointmentDate', 'DESC']]
        });

        res.json({
            success: true,
            appointments
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update appointment
export const updateAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const doctorId = req.user.id;
        const updates = req.body;

        const appointment = await Appointment.findOne({
            where: { id: appointmentId, doctorId }
        });

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Only allow updating certain fields
        const allowedFields = ['status', 'notes', 'location', 'videoCallLink', 'duration', 'reason'];
        const filteredUpdates = {};
        
        allowedFields.forEach(field => {
            if (updates.hasOwnProperty(field)) {
                filteredUpdates[field] = updates[field];
            }
        });

        await appointment.update(filteredUpdates);

        res.json({
            success: true,
            message: 'Appointment updated successfully',
            appointment
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Cancel appointment
export const cancelAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const doctorId = req.user.id;
        const { reason } = req.body;

        const appointment = await Appointment.findOne({
            where: { id: appointmentId, doctorId }
        });

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        await appointment.update({
            status: 'cancelled',
            notes: `Cancelled: ${reason || 'No reason provided'}`
        });

        res.json({
            success: true,
            message: 'Appointment cancelled successfully'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get appointment details
export const getAppointmentDetails = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const doctorId = req.user.id;

        const appointment = await Appointment.findOne({
            where: { id: appointmentId, doctorId },
            include: [
                { model: User, as: 'Patient', attributes: ['id', 'fullName', 'email', 'phone', 'age'] },
                { model: User, as: 'Doctor', attributes: ['fullName'] }
            ]
        });

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Get related clinical notes
        const clinicalNotes = await ClinicalNote.findAll({
            where: { appointmentId },
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            appointment,
            clinicalNotes
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
