import { User, RiskScore, TestResult, Appointment, PatientMetrics, RiskAlert, ClinicalNote, FollowUp } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

// Helper: Calculate trend from test scores
const calculateTrend = (scores) => {
    if (scores.length < 2) return 'stable';
    
    const recent = scores.slice(-3).map(s => 
        ((s.memoryScore || 0) + (s.attentionScore || 0) + (s.reactionTime || 0)) / 3
    );
    
    if (recent.length < 2) return 'stable';
    
    const slope = (recent[recent.length - 1] - recent[0]) / (recent.length - 1);
    
    if (slope < -5) return 'declining';
    if (slope > 5) return 'improving';
    return 'stable';
};

// Helper: Get trend emoji
const getTrendEmoji = (trend) => {
    if (trend === 'declining') return '📉 Declining';
    if (trend === 'improving') return '📈 Improving';
    return '➡️ Stable';
};

// Main Dashboard: Complete KPI Data Aggregation
export const getDoctorDashboard = async (req, res) => {
    try {
        const doctorId = req.user.id;
        
        // 1️⃣ Get all patients assigned to this doctor
        const patients = await User.findAll({
            where: { doctorId },
            attributes: ['id', 'fullName', 'email', 'age', 'gender', 'baselineCompleted'],
        });

        const patientIds = patients.map(p => p.id);

        if (patientIds.length === 0) {
            return res.json({
                success: true,
                totalPatients: 0,
                highRiskCount: 0,
                moderateRiskCount: 0,
                lowRiskCount: 0,
                followUpDueCount: 0,
                todayAppointmentsCount: 0,
                activeAlertsCount: 0,
                patientList: [],
                todayAppointments: [],
                activeAlerts: [],
                summary: {}
            });
        }

        // 2️⃣ Get latest risk scores for all patients
        const riskScores = await RiskScore.findAll({
            where: { userId: { [Op.in]: patientIds } },
            order: [['userId', 'ASC'], ['createdAt', 'DESC']],
            raw: true
        });

        // Get only latest per patient
        const latestRiskByPatient = {};
        riskScores.forEach(score => {
            if (!latestRiskByPatient[score.userId]) {
                latestRiskByPatient[score.userId] = score;
            }
        });

        // 3️⃣ Count by risk level
        const riskCounts = {
            high: 0,
            moderate: 0,
            low: 0
        };

        Object.values(latestRiskByPatient).forEach(score => {
            const risk = score.riskProbability || 0;
            if (risk > 60) riskCounts.high++;
            else if (risk >= 30) riskCounts.moderate++;
            else riskCounts.low++;
        });

        // 4️⃣ Get test trends for all patients (last 3 tests each)
        const allTests = await TestResult.findAll({
            where: { userId: { [Op.in]: patientIds } },
            order: [['userId', 'ASC'], ['createdAt', 'DESC']],
            raw: true
        });

        const testsByPatient = {};
        patientIds.forEach(pid => {
            testsByPatient[pid] = allTests.filter(t => t.userId === pid).slice(0, 3);
        });

        // 5️⃣ Get overdue follow-ups
        const overdueFollowUps = await FollowUp.count({
            where: {
                doctorId,
                status: 'pending',
                scheduledDate: { [Op.lt]: new Date() }
            }
        });

        // 6️⃣ Get today's appointments
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayAppointments = await Appointment.findAll({
            where: {
                doctorId,
                appointmentDate: {
                    [Op.between]: [today, tomorrow]
                },
                status: { [Op.ne]: 'cancelled' }
            },
            include: [{ model: User, as: 'Patient', attributes: ['id', 'fullName'] }],
            order: [['appointmentDate', 'ASC']]
        });

        // 7️⃣ Get active alerts
        const activeAlerts = await RiskAlert.findAll({
            where: {
                patientId: { [Op.in]: patientIds },
                status: 'active'
            },
            include: [{ model: User, as: 'Patient', attributes: ['fullName'] }],
            order: [['severity', 'DESC'], ['createdAt', 'DESC']],
            limit: 10
        });

        // 8️⃣ Build patient list with enriched data
        const patientList = patients.map(patient => {
            const latestRisk = latestRiskByPatient[patient.id];
            const tests = testsByPatient[patient.id] || [];
            const trend = calculateTrend(tests);

            return {
                id: patient.id,
                fullName: patient.fullName,
                email: patient.email,
                age: patient.age,
                gender: patient.gender,
                riskProbability: latestRisk?.riskProbability || 0,
                riskLevel: latestRisk?.riskLevel || 'Low',
                brainAge: latestRisk?.brainAge,
                trend,
                trendEmoji: getTrendEmoji(trend),
                lastTestDate: tests[0]?.createdAt,
                testCount: tests.length,
                latestMemoryScore: tests[0]?.memoryScore,
                latestAttentionScore: tests[0]?.attentionScore,
                latestReactionTime: tests[0]?.reactionTime
            };
        });

        // Sort by risk (high risk first)
        patientList.sort((a, b) => b.riskProbability - a.riskProbability);

        res.json({
            success: true,
            totalPatients: patients.length,
            highRiskCount: riskCounts.high,
            moderateRiskCount: riskCounts.moderate,
            lowRiskCount: riskCounts.low,
            followUpDueCount: overdueFollowUps,
            todayAppointmentsCount: todayAppointments.length,
            activeAlertsCount: activeAlerts.length,
            patientList,
            todayAppointments: todayAppointments.map(apt => ({
                id: apt.id,
                patientId: apt.patientId,
                patientName: apt.Patient.fullName,
                time: apt.appointmentDate,
                duration: apt.duration,
                status: apt.status,
                type: apt.appointmentType,
                mode: apt.videoCallLink ? 'Online' : 'In-person',
                riskLevel: patientList.find(p => p.id === apt.patientId)?.riskLevel || 'Low'
            })),
            activeAlerts: activeAlerts.map(alert => ({
                id: alert.id,
                patientId: alert.patientId,
                patientName: alert.Patient?.fullName,
                title: alert.title,
                description: alert.description,
                alertType: alert.alertType,
                severity: alert.severity,
                createdAt: alert.createdAt
            })),
            summary: {
                riskDistribution: {
                    high: riskCounts.high,
                    moderate: riskCounts.moderate,
                    low: riskCounts.low
                },
                tasksToday: todayAppointments.length,
                followUpsDue: overdueFollowUps
            }
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error', 
            error: error.message 
        });
    }
};

// Patient Detail: Full Clinical Data
export const getPatientDetail = async (req, res) => {
    try {
        const { patientId } = req.params;
        const doctorId = req.user.id;

        // Verify access
        const patient = await User.findOne({
            where: { id: patientId, doctorId }
        });

        if (!patient) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        // Get comprehensive patient data
        const [
            latestRisk,
            allRisks,
            allTests,
            latestMetrics,
            clinicalNotes,
            appointments,
            followUps,
            alerts
        ] = await Promise.all([
            RiskScore.findOne({
                where: { userId: patientId },
                order: [['createdAt', 'DESC']]
            }),
            RiskScore.findAll({
                where: { userId: patientId },
                order: [['createdAt', 'DESC']],
                limit: 10
            }),
            TestResult.findAll({
                where: { userId: patientId },
                order: [['createdAt', 'DESC']],
                limit: 20
            }),
            PatientMetrics.findOne({
                where: { userId: patientId },
                order: [['createdAt', 'DESC']]
            }),
            ClinicalNote.findAll({
                where: { patientId },
                order: [['createdAt', 'DESC']],
                limit: 10
            }),
            Appointment.findAll({
                where: { patientId },
                order: [['appointmentDate', 'DESC']],
                limit: 10
            }),
            FollowUp.findAll({
                where: { patientId },
                order: [['scheduledDate', 'DESC']],
                limit: 10
            }),
            RiskAlert.findAll({
                where: { patientId },
                order: [['createdAt', 'DESC']],
                limit: 10
            })
        ]);

        // Calculate trend
        const trend = calculateTrend(allTests);

        res.json({
            success: true,
            patient: {
                id: patient.id,
                fullName: patient.fullName,
                email: patient.email,
                age: patient.age,
                gender: patient.gender,
                baselineCompleted: patient.baselineCompleted
            },
            current: {
                risk: latestRisk || {},
                metrics: latestMetrics || {},
                trend,
                trendEmoji: getTrendEmoji(trend)
            },
            history: {
                riskScores: allRisks,
                testResults: allTests,
                clinicalNotes,
                appointments,
                followUps,
                alerts
            },
            stats: {
                totalTests: allTests.length,
                lastTestDate: allTests[0]?.createdAt,
                overallTrend: trend,
                riskLevel: latestRisk?.riskLevel || 'Low',
                riskProbability: latestRisk?.riskProbability || 0,
                brainAge: latestRisk?.brainAge || 'N/A',
                brainAgeGap: latestMetrics?.brainAgeGap || 0
            }
        });
    } catch (error) {
        console.error('Patient detail error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error', 
            error: error.message 
        });
    }
};

// Get patient's test history for charts
export const getPatientTestHistory = async (req, res) => {
    try {
        const { patientId } = req.params;
        const doctorId = req.user.id;

        // Verify access
        const patient = await User.findOne({
            where: { id: patientId, doctorId }
        });

        if (!patient) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const tests = await TestResult.findAll({
            where: { userId: patientId },
            order: [['createdAt', 'ASC']],
            limit: 30
        });

        const chartData = tests.map(test => ({
            date: new Date(test.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            memory: test.memoryScore || 0,
            reaction: test.reactionTime || 0,
            attention: test.attentionScore || 0,
            typing: test.typingSpeed || 0,
            timestamp: test.createdAt
        }));

        res.json({
            success: true,
            chartData,
            count: tests.length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Get risk alerts with trigger details
export const getRiskAlertsDetail = async (req, res) => {
    try {
        const doctorId = req.user.id;
        const { status = 'active', limit = 20 } = req.query;

        let where = { doctorId };
        if (status) where.status = status;

        const alerts = await RiskAlert.findAll({
            where,
            include: [{
                model: User,
                as: 'Patient',
                attributes: ['id', 'fullName', 'age']
            }],
            order: [['severity', 'DESC'], ['createdAt', 'DESC']],
            limit: parseInt(limit)
        });

        res.json({
            success: true,
            alerts,
            count: alerts.length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Get today's appointments with patient context
export const getTodayAppointments = async (req, res) => {
    try {
        const doctorId = req.user.id;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const appointments = await Appointment.findAll({
            where: {
                doctorId,
                appointmentDate: {
                    [Op.between]: [today, tomorrow]
                }
            },
            include: [{
                model: User,
                as: 'Patient',
                attributes: ['id', 'fullName', 'age', 'email', 'phone']
            }],
            order: [['appointmentDate', 'ASC']]
        });

        // Enrich with patient risk data
        const enriched = await Promise.all(
            appointments.map(async (apt) => {
                const risk = await RiskScore.findOne({
                    where: { userId: apt.patientId },
                    order: [['createdAt', 'DESC']]
                });

                return {
                    ...apt.toJSON(),
                    risk: risk?.riskLevel || 'Low',
                    riskProbability: risk?.riskProbability || 0
                };
            })
        );

        res.json({
            success: true,
            appointments: enriched,
            count: enriched.length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Get patient list with metrics (alias for getDoctorDashboard patient list)
export const getPatients = async (req, res) => {
    try {
        const doctorId = req.user.id;
        const patients = await User.findAll({
            where: { doctorId },
            attributes: ['id', 'fullName', 'email', 'age', 'gender']
        });

        const patientIds = patients.map(p => p.id);

        if (patientIds.length === 0) {
            return res.json({
                success: true,
                patients: []
            });
        }

        // Get latest risk scores
        const riskScores = await RiskScore.findAll({
            where: { userId: { [Op.in]: patientIds } },
            order: [['userId', 'ASC'], ['createdAt', 'DESC']],
            raw: true
        });

        const latestRiskByPatient = {};
        riskScores.forEach(score => {
            if (!latestRiskByPatient[score.userId]) {
                latestRiskByPatient[score.userId] = score;
            }
        });

        const patientList = patients.map(patient => {
            const latestRisk = latestRiskByPatient[patient.id];
            return {
                id: patient.id,
                fullName: patient.fullName,
                email: patient.email,
                age: patient.age,
                gender: patient.gender,
                riskLevel: latestRisk?.riskLevel || 'Low',
                riskProbability: latestRisk?.riskProbability || 0
            };
        });

        res.json({
            success: true,
            patients: patientList
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Get dashboard patients list with key metrics (same as getPatients)
export const getDashboardPatients = async (req, res) => {
    return getPatients(req, res);
};

// Legacy: Patient overview (for backward compatibility)
export const getPatientOverview = async (req, res) => {
    try {
        const { patientId } = req.params;
        const res2 = await getPatientDetail(req, res);
        return res2;
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

