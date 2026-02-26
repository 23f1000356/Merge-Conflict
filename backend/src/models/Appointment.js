import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Appointment = sequelize.define('Appointment', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    patientId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    doctorId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    appointmentDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    duration: {
        type: DataTypes.INTEGER, // in minutes
        defaultValue: 30,
    },
    status: {
        type: DataTypes.ENUM('scheduled', 'in-progress', 'completed', 'cancelled', 'no-show'),
        defaultValue: 'scheduled',
    },
    appointmentType: {
        type: DataTypes.ENUM('consultation', 'follow-up', 'initial-assessment', 'review'),
        defaultValue: 'consultation',
    },
    reason: {
        type: DataTypes.TEXT,
    },
    notes: {
        type: DataTypes.TEXT,
    },
    location: {
        type: DataTypes.STRING,
    },
    videoCallLink: {
        type: DataTypes.STRING,
    },
    reminderSent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    reminderSentAt: {
        type: DataTypes.DATE,
    },
}, {
    timestamps: true,
});

export default Appointment;
