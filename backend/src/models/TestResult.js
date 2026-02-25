import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TestResult = sequelize.define('TestResult', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    memoryScore: {
        type: DataTypes.FLOAT,
    },
    reactionTime: {
        type: DataTypes.FLOAT,
    },
    attentionScore: {
        type: DataTypes.FLOAT,
    },
    typingSpeed: {
        type: DataTypes.FLOAT,
    },
    voiceMetrics: {
        type: DataTypes.JSONB,
    },
    rawData: {
        type: DataTypes.JSONB,
    },
});

export default TestResult;
