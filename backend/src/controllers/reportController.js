import { User, TestResult, RiskScore, PatientMetrics, ClinicalNote, Appointment } from '../models/index.js';
import PDFDocument from 'pdfkit';
import { Op } from 'sequelize';

// Generate comprehensive patient report
export const generatePatientReport = async (req, res) => {
    try {
        const { patientId, includeCharts = true } = req.params;
        const doctorId = req.user.id;

        // Verify access
        const patient = await User.findOne({
            where: { id: patientId, doctorId }
        });

        if (!patient) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Gather patient data
        const metrics = await PatientMetrics.findOne({
            where: { userId: patientId },
            order: [['createdAt', 'DESC']]
        });

        const riskScore = await RiskScore.findOne({
            where: { userId: patientId },
            order: [['createdAt', 'DESC']]
        });

        const testCount = await TestResult.count({
            where: { userId: patientId }
        });

        const recentTests = await TestResult.findAll({
            where: { userId: patientId },
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        const clinicalNotes = await ClinicalNote.findAll({
            where: { patientId, noteType: 'recommendation' },
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        const upcomingAppointments = await Appointment.findAll({
            where: {
                patientId,
                appointmentDate: { [Op.gt]: new Date() }
            },
            order: [['appointmentDate', 'ASC']],
            limit: 3
        });

        // Create PDF
        const doc = new PDFDocument();
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="patient-report-${patientId}.pdf"`);
        
        // Pipe to response
        doc.pipe(res);

        // Title
        doc.fontSize(24).font('Helvetica-Bold').text('Patient Clinical Report', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica').text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
        doc.moveDown(1);

        // Patient Information
        doc.fontSize(14).font('Helvetica-Bold').text('Patient Information');
        doc.fontSize(11).font('Helvetica');
        doc.text(`Name: ${patient.fullName}`);
        doc.text(`Email: ${patient.email}`);
        doc.text(`Age: ${patient.age || 'N/A'}`);
        doc.text(`Gender: ${patient.gender || 'N/A'}`);
        doc.moveDown(1);

        // Current Status
        doc.fontSize(14).font('Helvetica-Bold').text('Current Status');
        doc.fontSize(11).font('Helvetica');
        if (metrics) {
            doc.text(`Overall Score: ${metrics.overallScore.toFixed(1)}/100`);
            doc.text(`Brain Age: ${metrics.biologicalAge.toFixed(0)} years`);
            doc.text(`Brain Age Gap: ${metrics.brainAgeGap.toFixed(1)} years`);
            doc.text(`Weekly Trend: ${metrics.weeklyTrend}`);
        }
        if (riskScore) {
            doc.text(`Risk Level: ${riskScore.riskLevel}`);
            doc.text(`Risk Probability: ${riskScore.riskProbability.toFixed(1)}%`);
        }
        doc.moveDown(1);

        // Test History
        doc.fontSize(14).font('Helvetica-Bold').text('Test History');
        doc.fontSize(11).font('Helvetica');
        doc.text(`Total Tests Completed: ${testCount}`);
        doc.text(`Last Test: ${recentTests[0]?.createdAt.toLocaleDateString() || 'N/A'}`);
        doc.moveDown(0.5);

        if (recentTests.length > 0) {
            doc.fontSize(10).text('Recent Scores:');
            recentTests.forEach((test, idx) => {
                doc.text(
                    `  ${idx + 1}. Memory: ${test.memoryScore?.toFixed(1) || 'N/A'}, ` +
                    `Attention: ${test.attentionScore?.toFixed(1) || 'N/A'}, ` +
                    `Reaction: ${test.reactionTime?.toFixed(1) || 'N/A'}`,
                    { fontSize: 9 }
                );
            });
        }
        doc.moveDown(1);

        // Clinical Notes & Recommendations
        if (clinicalNotes.length > 0) {
            doc.fontSize(14).font('Helvetica-Bold').text('Clinical Recommendations');
            doc.fontSize(11).font('Helvetica');
            clinicalNotes.forEach((note, idx) => {
                doc.text(`${idx + 1}. ${note.title}`, { font: 'Helvetica-Bold' });
                doc.fontSize(10).text(note.content, { 
                    width: 500,
                    align: 'left'
                });
                doc.fontSize(11);
            });
            doc.moveDown(1);
        }

        // Upcoming Appointments
        if (upcomingAppointments.length > 0) {
            doc.fontSize(14).font('Helvetica-Bold').text('Upcoming Appointments');
            doc.fontSize(11).font('Helvetica');
            upcomingAppointments.forEach((apt, idx) => {
                doc.text(
                    `${idx + 1}. ${apt.appointmentType} - ${apt.appointmentDate.toLocaleDateString()}`
                );
            });
            doc.moveDown(1);
        }

        // Footer
        doc.fontSize(9).font('Helvetica').text('This report is confidential and for authorized use only.', {
            align: 'center'
        });

        doc.end();
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Generate patient summary report
export const generatePatientSummary = async (req, res) => {
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

        // Get summary data
        const metrics = await PatientMetrics.findOne({
            where: { userId: patientId },
            order: [['createdAt', 'DESC']]
        });

        const riskScore = await RiskScore.findOne({
            where: { userId: patientId },
            order: [['createdAt', 'DESC']]
        });

        const testCount = await TestResult.count({
            where: { userId: patientId }
        });

        const clinicalNotes = await ClinicalNote.findAll({
            where: { patientId },
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        const summary = {
            patient: {
                id: patient.id,
                fullName: patient.fullName,
                email: patient.email,
                age: patient.age
            },
            metrics: metrics ? {
                overallScore: metrics.overallScore,
                biologicalAge: metrics.biologicalAge,
                brainAgeGap: metrics.brainAgeGap,
                weeklyTrend: metrics.weeklyTrend
            } : null,
            riskAssessment: riskScore ? {
                riskLevel: riskScore.riskLevel,
                riskProbability: riskScore.riskProbability,
                brainAge: riskScore.brainAge
            } : null,
            testMetrics: {
                totalTests: testCount,
                lastTestDate: metrics?.lastTestDate
            },
            clinicalNotes: clinicalNotes.map(note => ({
                id: note.id,
                title: note.title,
                type: note.noteType,
                severity: note.severity,
                date: note.createdAt
            })),
            generatedAt: new Date()
        };

        res.json({
            success: true,
            summary
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Generate cohort analysis report
export const generateCohortReport = async (req, res) => {
    try {
        const doctorId = req.user.id;
        const { filterRisk = null } = req.query;

        // Get all patients
        const patients = await User.findAll({
            where: { doctorId },
            attributes: ['id', 'fullName']
        });

        const patientIds = patients.map(p => p.id);

        // Get metrics for all patients
        let where = { userId: { [Op.in]: patientIds } };

        const allMetrics = await PatientMetrics.findAll({
            where,
            include: [
                { model: User, attributes: ['fullName'] }
            ]
        });

        // Get risk scores
        const allRiskScores = await RiskScore.findAll({
            where: { userId: { [Op.in]: patientIds } },
            attributes: ['userId', 'riskLevel', 'riskProbability']
        });

        // Calculate statistics
        const stats = {
            totalPatients: patients.length,
            avgOverallScore: allMetrics.length > 0 
                ? (allMetrics.reduce((sum, m) => sum + (m.overallScore || 0), 0) / allMetrics.length).toFixed(1)
                : 0,
            avgBrainAgeGap: allMetrics.length > 0
                ? (allMetrics.reduce((sum, m) => sum + (m.brainAgeGap || 0), 0) / allMetrics.length).toFixed(1)
                : 0,
            riskDistribution: {
                low: allRiskScores.filter(r => r.riskLevel === 'Low').length,
                moderate: allRiskScores.filter(r => r.riskLevel === 'Moderate').length,
                high: allRiskScores.filter(r => r.riskLevel === 'High').length
            }
        };

        res.json({
            success: true,
            stats,
            patientsAnalyzed: allMetrics.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
