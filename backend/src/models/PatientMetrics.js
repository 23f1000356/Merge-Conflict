import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PatientMetrics = sequelize.define('PatientMetrics', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    // Test Performance Scores
    memoryScore: {
        type: DataTypes.FLOAT,
    },
    reactionTimeScore: {
        type: DataTypes.FLOAT,
    },
    attentionScore: {
        type: DataTypes.FLOAT,
    },
    typingSpeedScore: {
        type: DataTypes.FLOAT,
    },
    voiceScore: {
        type: DataTypes.FLOAT,
    },
    overallScore: {
        type: DataTypes.FLOAT,
    },
    // Brain Age Analysis
    biologicalAge: {
        type: DataTypes.INTEGER, // in years
    },
    chronologicalAge: {
        type: DataTypes.INTEGER, // in years
    },
    brainAgeGap: {
        type: DataTypes.FLOAT, // difference in years
    },
    // Trend indicators
    weeklyTrend: {
        type: DataTypes.ENUM('improving', 'stable', 'declining'),
    },
    monthlyTrend: {
        type: DataTypes.ENUM('improving', 'stable', 'declining'),
    },
    // Performance tracking
    testCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    lastTestDate: {
        type: DataTypes.DATE,
    },
    consistencyScore: {
        type: DataTypes.FLOAT, // how consistent performance is
    },
    // Baseline comparison
    baselineScore: {
        type: DataTypes.FLOAT,
    },
    changeFromBaseline: {
        type: DataTypes.FLOAT, // percentage change
    },
    metricsSnapshot: {
        type: DataTypes.JSONB, // stores detailed metrics for historical comparison
    },
}, {
    timestamps: true,
});

export default PatientMetrics;
