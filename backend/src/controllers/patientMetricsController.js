import { PatientMetrics, TestResult, RiskScore, User } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

// Calculate and update patient metrics
export const calculatePatientMetrics = async (userId) => {
    try {
        // Get all test results for this user
        const testResults = await TestResult.findAll({
            where: { userId },
            order: [['createdAt', 'ASC']]
        });

        if (testResults.length === 0) {
            return null;
        }

        const latest = testResults[testResults.length - 1];
        const previousWeek = testResults.length > 1 
            ? testResults[Math.max(0, testResults.length - 8)]
            : null;

        // Calculate overall score (average of all metrics)
        const overallScore = (
            (latest.memoryScore || 0) +
            (latest.reactionTime || 0) +
            (latest.attentionScore || 80) +
            (latest.typingSpeed || 0)
        ) / 4;

        // Calculate trends
        const calculateTrend = () => {
            if (testResults.length < 2) return 'stable';
            
            const recent = testResults.slice(-4); // Last 4 tests
            const scores = recent.map(t => 
                ((t.memoryScore || 0) + (t.attentionScore || 0) + (t.reactionTime || 0)) / 3
            );

            const avgRecent = scores.reduce((a, b) => a + b, 0) / scores.length;
            const avgPrevious = scores.slice(0, 2).reduce((a, b) => a + b, 0) / 2;
            
            const change = ((avgRecent - avgPrevious) / avgPrevious) * 100;
            
            if (change > 5) return 'improving';
            if (change < -5) return 'declining';
            return 'stable';
        };

        const weeklyTrend = calculateTrend();

        // Calculate brain age gap (simplified - you'd want a more sophisticated model)
        const user = await User.findByPk(userId);
        const biologicalAge = calculateBrainAge(overallScore);
        const chronologicalAge = user.age || 40;
        const brainAgeGap = biologicalAge - chronologicalAge;

        // Create or update metrics
        const metrics = await PatientMetrics.findOne({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });

        const metricsData = {
            userId,
            memoryScore: latest.memoryScore,
            reactionTimeScore: latest.reactionTime,
            attentionScore: latest.attentionScore,
            typingSpeedScore: latest.typingSpeed,
            voiceScore: latest.voiceMetrics?.score || 0,
            overallScore,
            biologicalAge,
            chronologicalAge,
            brainAgeGap,
            weeklyTrend,
            monthlyTrend: 'stable', // Calculate separately if needed
            testCount: testResults.length,
            lastTestDate: latest.createdAt,
            consistencyScore: calculateConsistency(testResults),
            metricsSnapshot: {
                timestamp: new Date(),
                scores: {
                    memory: latest.memoryScore,
                    reaction: latest.reactionTime,
                    attention: latest.attentionScore,
                    typing: latest.typingSpeed
                }
            }
        };

        let updatedMetrics;
        if (metrics) {
            await metrics.update(metricsData);
            updatedMetrics = metrics;
        } else {
            updatedMetrics = await PatientMetrics.create(metricsData);
        }

        return updatedMetrics;
    } catch (error) {
        console.error('Error calculating metrics:', error);
        throw error;
    }
};

// Calculate brain age based on cognitive scores
const calculateBrainAge = (overallScore) => {
    // Simplified model: 100 = age 20, 50 = age 60
    // This should be calibrated with actual data
    return Math.max(20, Math.min(100, 100 - (overallScore * 0.8)));
};

// Calculate consistency of performance
const calculateConsistency = (testResults) => {
    if (testResults.length < 2) return 100;

    const scores = testResults
        .slice(-10) // Last 10 tests
        .map(t => ((t.memoryScore || 0) + (t.attentionScore || 0) + (t.reactionTime || 0)) / 3);

    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    
    // Convert to consistency percentage (lower std dev = higher consistency)
    return Math.max(0, Math.min(100, 100 - (stdDev * 2)));
};

// Get patient trend analysis
export const getPatientTrends = async (req, res) => {
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

        // Get metrics history
        const metricsHistory = await PatientMetrics.findAll({
            where: { userId: patientId },
            order: [['createdAt', 'ASC']],
            limit: 30
        });

        // Get test history
        const testHistory = await TestResult.findAll({
            where: { userId: patientId },
            order: [['createdAt', 'ASC']],
            limit: 20
        });

        // Get risk score history
        const riskHistory = await RiskScore.findAll({
            where: { userId: patientId },
            order: [['createdAt', 'ASC']],
            limit: 20
        });

        // Calculate trends
        const performanceTrend = calculatePerformanceTrend(testHistory);
        const riskTrend = calculateRiskTrend(riskHistory);

        res.json({
            success: true,
            patient: {
                id: patient.id,
                fullName: patient.fullName,
                age: patient.age
            },
            metricsHistory,
            testHistory,
            riskHistory,
            trends: {
                performance: performanceTrend,
                risk: riskTrend
            },
            summary: {
                brainAgeGap: metricsHistory[metricsHistory.length - 1]?.brainAgeGap || 0,
                weeklyTrend: metricsHistory[metricsHistory.length - 1]?.weeklyTrend || 'stable',
                overallScore: metricsHistory[metricsHistory.length - 1]?.overallScore || 0
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Calculate performance trend
const calculatePerformanceTrend = (testHistory) => {
    if (testHistory.length === 0) return null;

    const scores = testHistory.map(t => 
        ((t.memoryScore || 0) + (t.attentionScore || 0) + (t.reactionTime || 0)) / 3
    );

    return {
        dataPoints: scores,
        average: scores.reduce((a, b) => a + b, 0) / scores.length,
        min: Math.min(...scores),
        max: Math.max(...scores),
        latest: scores[scores.length - 1],
        trend: scores[scores.length - 1] > (scores[0] || 0) ? 'improving' : 'declining'
    };
};

// Calculate risk trend
const calculateRiskTrend = (riskHistory) => {
    if (riskHistory.length === 0) return null;

    const risks = riskHistory.map(r => r.riskProbability);

    return {
        dataPoints: risks,
        average: risks.reduce((a, b) => a + b, 0) / risks.length,
        min: Math.min(...risks),
        max: Math.max(...risks),
        latest: risks[risks.length - 1],
        trend: risks[risks.length - 1] > (risks[0] || 0) ? 'increasing' : 'decreasing'
    };
};

// Get patient comparison (peer comparison)
export const getPatientComparison = async (req, res) => {
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

        // Get patient's latest metrics
        const patientMetrics = await PatientMetrics.findOne({
            where: { userId: patientId },
            order: [['createdAt', 'DESC']]
        });

        // Get all doctor's patients' metrics for comparison
        const doctorPatients = await User.findAll({
            where: { doctorId },
            attributes: ['id']
        });

        const doctorPatientIds = doctorPatients.map(p => p.id);

        const allMetrics = await PatientMetrics.findAll({
            where: { userId: { [Op.in]: doctorPatientIds } },
            order: [['createdAt', 'DESC']]
        });

        // Calculate statistics
        const overallScores = allMetrics
            .filter(m => m.overallScore)
            .map(m => m.overallScore);

        const brainAgeGaps = allMetrics
            .filter(m => m.brainAgeGap !== null && m.brainAgeGap !== undefined)
            .map(m => m.brainAgeGap);

        const stats = {
            avgOverallScore: overallScores.length > 0 
                ? overallScores.reduce((a, b) => a + b, 0) / overallScores.length
                : 0,
            patientRank: patientMetrics ? 
                overallScores.filter(s => s > patientMetrics.overallScore).length + 1
                : 0,
            percentile: patientMetrics && overallScores.length > 0 ?
                ((overallScores.filter(s => s < patientMetrics.overallScore).length / overallScores.length) * 100).toFixed(1)
                : 0,
            avgBrainAgeGap: brainAgeGaps.length > 0
                ? brainAgeGaps.reduce((a, b) => a + b, 0) / brainAgeGaps.length
                : 0
        };

        res.json({
            success: true,
            patientMetrics,
            stats,
            cohortSize: doctorPatientIds.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get baseline comparison
export const getBaselineComparison = async (req, res) => {
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

        // Get first test (baseline)
        const baselineTest = await TestResult.findOne({
            where: { userId: patientId },
            order: [['createdAt', 'ASC']]
        });

        // Get latest test
        const latestTest = await TestResult.findOne({
            where: { userId: patientId },
            order: [['createdAt', 'DESC']]
        });

        if (!baselineTest || !latestTest) {
            return res.json({
                success: true,
                message: 'Insufficient data for baseline comparison',
                comparison: null
            });
        }

        const comparison = {
            baseline: {
                date: baselineTest.createdAt,
                memoryScore: baselineTest.memoryScore,
                reactionTime: baselineTest.reactionTime,
                attentionScore: baselineTest.attentionScore,
                typingSpeed: baselineTest.typingSpeed
            },
            current: {
                date: latestTest.createdAt,
                memoryScore: latestTest.memoryScore,
                reactionTime: latestTest.reactionTime,
                attentionScore: latestTest.attentionScore,
                typingSpeed: latestTest.typingSpeed
            },
            changes: {
                memoryScore: ((latestTest.memoryScore - baselineTest.memoryScore) / baselineTest.memoryScore * 100).toFixed(1),
                reactionTime: ((latestTest.reactionTime - baselineTest.reactionTime) / baselineTest.reactionTime * 100).toFixed(1),
                attentionScore: ((latestTest.attentionScore - baselineTest.attentionScore) / baselineTest.attentionScore * 100).toFixed(1),
                typingSpeed: ((latestTest.typingSpeed - baselineTest.typingSpeed) / baselineTest.typingSpeed * 100).toFixed(1)
            }
        };

        res.json({
            success: true,
            comparison
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
