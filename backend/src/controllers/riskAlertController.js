import { RiskAlert, RiskScore, User, PatientMetrics } from '../models/index.js';
import { Op } from 'sequelize';

// Analyze patient data and create risk alerts for sudden declines/jumps
export const analyzePatientRisk = async (req, res) => {
    try {
        const { patientId } = req.params;
        const doctorId = req.user.id;

        // Verify access
        const patient = await User.findOne({
            where: { id: patientId, doctorId }
        });

        if (!patient) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Get last 2 risk scores for comparison
        const recentScores = await RiskScore.findAll({
            where: { userId: patientId },
            order: [['createdAt', 'DESC']],
            limit: 2
        });

        if (recentScores.length < 2) {
            return res.json({
                success: true,
                message: 'Insufficient data for analysis',
                alerts: []
            });
        }

        const current = recentScores[0];
        const previous = recentScores[1];

        const alerts = [];

        // Check for sudden decline in risk score
        const riskChange = current.riskProbability - previous.riskProbability;
        const riskChangePercent = (riskChange / previous.riskProbability) * 100;

        if (riskChange > 20) { // Sudden jump
            const alert = await RiskAlert.create({
                patientId,
                doctorId,
                alertType: 'sudden-jump',
                severity: riskChange > 40 ? 'high' : 'medium',
                title: `Risk Score Increased to ${current.riskProbability.toFixed(1)}%`,
                description: `Risk probability jumped by ${riskChangePercent.toFixed(1)}% (from ${previous.riskProbability.toFixed(1)}% to ${current.riskProbability.toFixed(1)}%)`,
                triggeringMetric: 'riskProbability',
                previousValue: previous.riskProbability,
                currentValue: current.riskProbability,
                changePercentage: riskChangePercent,
                recommendedAction: 'Schedule immediate consultation and review recent test results'
            });
            alerts.push(alert);
        } else if (riskChange < -20) { // Sudden decline
            const alert = await RiskAlert.create({
                patientId,
                doctorId,
                alertType: 'sudden-decline',
                severity: riskChange < -40 ? 'medium' : 'low',
                title: `Risk Score Declined to ${current.riskProbability.toFixed(1)}%`,
                description: `Risk probability declined by ${Math.abs(riskChangePercent).toFixed(1)}%`,
                triggeringMetric: 'riskProbability',
                previousValue: previous.riskProbability,
                currentValue: current.riskProbability,
                changePercentage: riskChangePercent,
                recommendedAction: 'Review treatment effectiveness and continue current protocol'
            });
            alerts.push(alert);
        }

        // Check individual metric declines
        const metricChecks = [
            { prev: previous.memoryScore, curr: current.memoryScore, name: 'Memory Score' },
            { prev: previous.reactionScore, curr: current.reactionScore, name: 'Reaction Time' },
            { prev: previous.attentionScore, curr: current.attentionScore, name: 'Attention Score' }
        ];

        for (const metric of metricChecks) {
            if (metric.prev && metric.curr) {
                const change = metric.curr - metric.prev;
                const changePercent = (change / metric.prev) * 100;

                if (changePercent < -15) { // Significant decline
                    const alert = await RiskAlert.create({
                        patientId,
                        doctorId,
                        alertType: 'sudden-decline',
                        severity: changePercent < -30 ? 'high' : 'medium',
                        title: `${metric.name} Declined Significantly`,
                        description: `${metric.name} decreased by ${Math.abs(changePercent).toFixed(1)}% from ${metric.prev.toFixed(1)} to ${metric.curr.toFixed(1)}`,
                        triggeringMetric: metric.name,
                        previousValue: metric.prev,
                        currentValue: metric.curr,
                        changePercentage: changePercent,
                        recommendedAction: `Assess factors affecting ${metric.name} performance`
                    });
                    alerts.push(alert);
                }
            }
        }

        res.json({
            success: true,
            alertsGenerated: alerts.length,
            alerts
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all risk alerts for doctor's patients
export const getDoctorAlerts = async (req, res) => {
    try {
        const doctorId = req.user.id;
        const { status = null, severity = null, limit = 20 } = req.query;

        let where = { doctorId };

        if (status) {
            where.status = status;
        }

        if (severity) {
            where.severity = severity;
        }

        const alerts = await RiskAlert.findAll({
            where,
            include: [
                { model: User, as: 'Patient', attributes: ['id', 'fullName', 'email'] }
            ],
            order: [
                ['severity', 'DESC'],
                ['createdAt', 'DESC']
            ],
            limit: parseInt(limit)
        });

        res.json({
            success: true,
            count: alerts.length,
            alerts
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get alerts for specific patient
export const getPatientAlerts = async (req, res) => {
    try {
        const { patientId } = req.params;
        const doctorId = req.user.id;

        // Verify access
        const patient = await User.findOne({
            where: { id: patientId, doctorId }
        });

        if (!patient) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const alerts = await RiskAlert.findAll({
            where: { patientId },
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            alerts
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Acknowledge/resolve alert
export const updateAlert = async (req, res) => {
    try {
        const { alertId } = req.params;
        const doctorId = req.user.id;
        const { status, resolutionNotes } = req.body;

        const alert = await RiskAlert.findOne({
            where: { id: alertId, doctorId }
        });

        if (!alert) {
            return res.status(404).json({ message: 'Alert not found' });
        }

        const updates = {};
        if (status) {
            updates.status = status;
            if (status === 'acknowledged') {
                updates.acknowledgedAt = new Date();
                updates.acknowledgedBy = doctorId;
            } else if (status === 'resolved') {
                updates.resolvedAt = new Date();
                updates.resolutionNotes = resolutionNotes;
            }
        }

        await alert.update(updates);

        res.json({
            success: true,
            message: 'Alert updated successfully',
            alert
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get alert detail
export const getAlertDetail = async (req, res) => {
    try {
        const { alertId } = req.params;
        const doctorId = req.user.id;

        const alert = await RiskAlert.findOne({
            where: { id: alertId, doctorId },
            include: [
                { model: User, as: 'Patient', attributes: ['id', 'fullName', 'email', 'age'] }
            ]
        });

        if (!alert) {
            return res.status(404).json({ message: 'Alert not found' });
        }

        res.json({
            success: true,
            alert
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
