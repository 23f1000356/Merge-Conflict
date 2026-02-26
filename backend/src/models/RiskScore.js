import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const RiskScore = sequelize.define('RiskScore', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    riskProbability: {
        type: DataTypes.FLOAT,
    },
    brainAge: {
        type: DataTypes.FLOAT,
    },
    cognitiveIndex: {
        type: DataTypes.FLOAT,
    },
    riskLevel: {
        type: DataTypes.ENUM('Low', 'Moderate', 'High'),
        defaultValue: 'Low',
    },
    // Component scores snapshot for rich history & reports
    memoryScore: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    reactionScore: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    attentionScore: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    typingSpeed: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    voiceScore: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
});

export default RiskScore;
