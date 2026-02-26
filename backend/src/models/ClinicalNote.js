import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ClinicalNote = sequelize.define('ClinicalNote', {
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
    appointmentId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    noteType: {
        type: DataTypes.ENUM('observation', 'diagnosis', 'recommendation', 'follow-up', 'alert'),
        defaultValue: 'observation',
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    severity: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
        defaultValue: 'low',
    },
    actionRequired: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    dueDate: {
        type: DataTypes.DATE,
    },
    tags: {
        type: DataTypes.JSONB,
        defaultValue: [],
    },
}, {
    timestamps: true,
});

export default ClinicalNote;
