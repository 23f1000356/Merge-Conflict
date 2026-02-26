import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const FollowUp = sequelize.define('FollowUp', {
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
    clinicalNoteId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    appointmentId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    followUpType: {
        type: DataTypes.ENUM('phone-call', 'video-consultation', 'in-person', 'email', 'test-reminder'),
        allowNull: false,
    },
    scheduledDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    status: {
        type: DataTypes.ENUM('pending', 'in-progress', 'completed', 'cancelled'),
        defaultValue: 'pending',
    },
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium',
    },
    reminderSent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    reminderSentAt: {
        type: DataTypes.DATE,
    },
    completedAt: {
        type: DataTypes.DATE,
    },
    completionNotes: {
        type: DataTypes.TEXT,
    },
}, {
    timestamps: true,
});

export default FollowUp;
