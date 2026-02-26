import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const RiskAlert = sequelize.define('RiskAlert', {
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
        allowNull: true, // may not be assigned initially
    },
    alertType: {
        type: DataTypes.ENUM('sudden-decline', 'sudden-jump', 'below-baseline', 'anomaly', 'missed-test', 'health-threshold'),
        allowNull: false,
    },
    severity: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    // What triggered the alert
    triggeringMetric: {
        type: DataTypes.STRING, // e.g., 'memoryScore', 'reactionTime'
    },
    previousValue: {
        type: DataTypes.FLOAT,
    },
    currentValue: {
        type: DataTypes.FLOAT,
    },
    changePercentage: {
        type: DataTypes.FLOAT,
    },
    // Status of the alert
    status: {
        type: DataTypes.ENUM('active', 'acknowledged', 'resolved', 'false-positive'),
        defaultValue: 'active',
    },
    acknowledgedAt: {
        type: DataTypes.DATE,
    },
    acknowledgedBy: {
        type: DataTypes.UUID,
    },
    resolvedAt: {
        type: DataTypes.DATE,
    },
    resolutionNotes: {
        type: DataTypes.TEXT,
    },
    // For urgent alerts
    flaggedUrgent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    recommendedAction: {
        type: DataTypes.TEXT,
    },
}, {
    timestamps: true,
});

export default RiskAlert;
