import User from './User.js';
import TestResult from './TestResult.js';
import RiskScore from './RiskScore.js';
import Appointment from './Appointment.js';
import ClinicalNote from './ClinicalNote.js';
import FollowUp from './FollowUp.js';
import PatientMetrics from './PatientMetrics.js';
import RiskAlert from './RiskAlert.js';

// TestResult associations
User.hasMany(TestResult, { foreignKey: 'userId' });
TestResult.belongsTo(User, { foreignKey: 'userId' });

// RiskScore associations
User.hasMany(RiskScore, { foreignKey: 'userId' });
RiskScore.belongsTo(User, { foreignKey: 'userId' });

// Appointment associations
User.hasMany(Appointment, { as: 'DoctorAppointments', foreignKey: 'doctorId' });
User.hasMany(Appointment, { as: 'PatientAppointments', foreignKey: 'patientId' });
Appointment.belongsTo(User, { as: 'Patient', foreignKey: 'patientId' });
Appointment.belongsTo(User, { as: 'Doctor', foreignKey: 'doctorId' });

// ClinicalNote associations
User.hasMany(ClinicalNote, { as: 'DoctorNotes', foreignKey: 'doctorId' });
User.hasMany(ClinicalNote, { as: 'PatientNotes', foreignKey: 'patientId' });
ClinicalNote.belongsTo(User, { as: 'Patient', foreignKey: 'patientId' });
ClinicalNote.belongsTo(User, { as: 'Doctor', foreignKey: 'doctorId' });
ClinicalNote.belongsTo(Appointment, { foreignKey: 'appointmentId' });

// FollowUp associations
User.hasMany(FollowUp, { as: 'DoctorFollowUps', foreignKey: 'doctorId' });
User.hasMany(FollowUp, { as: 'PatientFollowUps', foreignKey: 'patientId' });
FollowUp.belongsTo(User, { as: 'Patient', foreignKey: 'patientId' });
FollowUp.belongsTo(User, { as: 'Doctor', foreignKey: 'doctorId' });
FollowUp.belongsTo(ClinicalNote, { foreignKey: 'clinicalNoteId' });
FollowUp.belongsTo(Appointment, { foreignKey: 'appointmentId' });

// PatientMetrics associations
User.hasMany(PatientMetrics, { foreignKey: 'userId' });
PatientMetrics.belongsTo(User, { foreignKey: 'userId' });

// RiskAlert associations
User.hasMany(RiskAlert, { as: 'PatientAlerts', foreignKey: 'patientId' });
User.hasMany(RiskAlert, { as: 'AssignedAlerts', foreignKey: 'doctorId' });
RiskAlert.belongsTo(User, { as: 'Patient', foreignKey: 'patientId' });
RiskAlert.belongsTo(User, { as: 'Doctor', foreignKey: 'doctorId' });

// Self-referential for Doctor-Patient relationship
User.hasMany(User, { as: 'Patients', foreignKey: 'doctorId' });
User.belongsTo(User, { as: 'AssignedDoctor', foreignKey: 'doctorId' });

export { User, TestResult, RiskScore, Appointment, ClinicalNote, FollowUp, PatientMetrics, RiskAlert };
