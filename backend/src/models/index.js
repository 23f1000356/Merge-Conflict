import User from './User.js';
import TestResult from './TestResult.js';
import RiskScore from './RiskScore.js';

User.hasMany(TestResult, { foreignKey: 'userId' });
TestResult.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(RiskScore, { foreignKey: 'userId' });
RiskScore.belongsTo(User, { foreignKey: 'userId' });

// Self-referential for Doctor-Patient relationship
User.hasMany(User, { as: 'Patients', foreignKey: 'doctorId' });
User.belongsTo(User, { as: 'Doctor', foreignKey: 'doctorId' });

export { User, TestResult, RiskScore };
