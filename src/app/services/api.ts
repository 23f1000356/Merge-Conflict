import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    register: (data: any) => api.post('/auth/register', data),
    login: (data: any) => api.post('/auth/login', data),
};

export const testService = {
    submit: (data: any) => api.post('/tests/submit', data),
    getHistory: () => api.get('/tests/history'),
};

export const userService = {
    getPatients: () => api.get('/users/patients'),
    getPatientDetail: (id: string) => api.get(`/users/patients/${id}`),
    getAllUsers: () => api.get('/users/all'),
};

// Doctor Dashboard
export const doctorService = {
    getDashboard: () => api.get('/doctor/dashboard'),
    getPatients: (sortBy?: string, filterRisk?: string) => 
        api.get('/doctor/patients', { params: { sortBy, filterRisk } }),
    getPatientOverview: (patientId: string) => 
        api.get(`/doctor/patient/${patientId}/overview`),
    getAvailableDoctors: () => api.get('/users/doctors'),
    getAllDoctors: () => api.get('/users/doctors'),
};

// Appointments
export const appointmentService = {
    create: (data: any) => api.post('/appointments', data),
    bookAppointment: (data: any) => api.post('/appointments', data),
    getAvailableSlots: (doctorId: string, date: string) => 
        api.get(`/appointments/available-slots`, { params: { doctorId, date } }),
    getDoctorAppointments: (status?: string, startDate?: string, endDate?: string) =>
        api.get('/appointments/doctor', { params: { status, startDate, endDate } }),
    getPatientAppointments: (patientId: string) =>
        api.get(`/appointments/patient/${patientId}`),
    update: (appointmentId: string, data: any) =>
        api.put(`/appointments/${appointmentId}`, data),
    cancel: (appointmentId: string, reason: string) =>
        api.delete(`/appointments/${appointmentId}/cancel`, { data: { reason } }),
    getDetail: (appointmentId: string) =>
        api.get(`/appointments/${appointmentId}`),
};

// Risk Alerts
export const riskAlertService = {
    getAlerts: (status?: string, severity?: string, limit?: number) =>
        api.get('/alerts', { params: { status, severity, limit } }),
    analyzePatient: (patientId: string) =>
        api.post(`/alerts/analyze/${patientId}`),
    getPatientAlerts: (patientId: string) =>
        api.get(`/alerts/patient/${patientId}`),
    getDetail: (alertId: string) =>
        api.get(`/alerts/${alertId}`),
    updateAlert: (alertId: string, data: any) =>
        api.put(`/alerts/${alertId}`, data),
};

// Clinical Notes
export const clinicalNoteService = {
    create: (data: any) => api.post('/clinical-notes', data),
    getPatientNotes: (patientId: string, noteType?: string) =>
        api.get(`/clinical-notes/patient/${patientId}`, { params: { noteType } }),
    getDoctorNotes: (noteType?: string, actionRequired?: boolean, limit?: number) =>
        api.get('/clinical-notes/doctor/notes', { params: { noteType, actionRequired, limit } }),
    getAppointmentNotes: (appointmentId: string) =>
        api.get(`/clinical-notes/appointment/${appointmentId}`),
    getDetail: (noteId: string) =>
        api.get(`/clinical-notes/${noteId}`),
    update: (noteId: string, data: any) =>
        api.put(`/clinical-notes/${noteId}`, data),
    delete: (noteId: string) =>
        api.delete(`/clinical-notes/${noteId}`),
    getActionItems: (dueBy?: string) =>
        api.get('/clinical-notes/doctor/action-items', { params: { dueBy } }),
};

// Follow-ups
export const followUpService = {
    create: (data: any) => api.post('/follow-ups', data),
    getDoctorFollowUps: (status?: string, priority?: string) =>
        api.get('/follow-ups', { params: { status, priority } }),
    getPatientFollowUps: (patientId: string) =>
        api.get(`/follow-ups/patient/${patientId}`),
    update: (followUpId: string, data: any) =>
        api.put(`/follow-ups/${followUpId}`, data),
    getDetail: (followUpId: string) =>
        api.get(`/follow-ups/${followUpId}`),
    getOverdue: () => api.get('/follow-ups/overdue'),
    sendReminders: () => api.post('/follow-ups/reminders/send'),
};

// Patient Metrics & Trends
export const metricsService = {
    getPatientTrends: (patientId: string) =>
        api.get(`/metrics/${patientId}/trends`),
    getPatientComparison: (patientId: string) =>
        api.get(`/metrics/${patientId}/comparison`),
    getBaselineComparison: (patientId: string) =>
        api.get(`/metrics/${patientId}/baseline`),
};

// Reports
export const reportService = {
    generatePDF: (patientId: string, includeCharts?: boolean) =>
        api.get(`/reports/${patientId}/pdf?includeCharts=${includeCharts}`, { 
            responseType: 'blob' 
        }),
    generateSummary: (patientId: string) =>
        api.get(`/reports/${patientId}/summary`),
    generateCohortReport: (filterRisk?: string) =>
        api.get('/reports/cohort/analysis', { params: { filterRisk } }),
};

// Audit Logs & Security
export const auditLogService = {
    getAuditLogs: (limit?: number, startDate?: string, endDate?: string, action?: string) =>
        api.get('/audit-logs', { params: { limit, startDate, endDate, action } }),
    getSecurityStats: () =>
        api.get('/audit-logs/security-stats'),
    getFailedLogins: (limit?: number) =>
        api.get('/audit-logs/failed-logins', { params: { limit } }),
    getActiveSessions: () =>
        api.get('/audit-logs/active-sessions'),
    exportLogs: (startDate?: string, endDate?: string) =>
        api.get('/audit-logs/export', { params: { startDate, endDate }, responseType: 'blob' }),
};

export default api;
