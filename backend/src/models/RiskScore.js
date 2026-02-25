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
});

export default RiskScore;
