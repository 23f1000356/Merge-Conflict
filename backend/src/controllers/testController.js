import { TestResult, RiskScore, User } from '../models/index.js';
import axios from 'axios';

export const submitTest = async (req, res) => {
    try {
        const { memoryScore, reactionTime, attentionScore, typingSpeed, voiceMetrics, rawData } = req.body;
        const userId = req.user.id;

        // 1. Store Test Result
        const testResult = await TestResult.create({
            userId,
            memoryScore,
            reactionTime,
            attentionScore,
            typingSpeed,
            voiceMetrics,
            rawData,
        });

        // Extract voice score from voiceMetrics
        const voiceScore = voiceMetrics?.score || 0;

        // 2. Call AI Service for Risk Assessment
        let aiResults = {
            riskProbability: 0,
            brainAge: 0,
            cognitiveIndex: 0,
            riskLevel: 'Low'
        };

        // Fetch prior risk probabilities to support AI moving average
        // (last 10, oldest -> newest)
        let riskHistory = [];
        try {
            const previousRisks = await RiskScore.findAll({
                where: { userId },
                order: [['createdAt', 'DESC']],
                limit: 10,
                raw: true,
            });
            riskHistory = previousRisks
                .slice()
                .reverse()
                .map(r => r.riskProbability)
                .filter(v => typeof v === 'number' && Number.isFinite(v));
        } catch (error) {
            console.error('Risk history fetch error:', error.message);
            riskHistory = [];
        }

        try {
            const response = await axios.post(`${process.env.AI_SERVICE_URL}/predict`, {
                memoryScore,
                reactionTime,
                attentionScore,
                typingSpeed,
                voiceScore,
                riskHistory,
            });
            aiResults = response.data;
        } catch (error) {
            console.error('AI Service Error:', error.message);
            // Fallback or handle error
        }

        // 3. Store Risk Score + component snapshot
        const riskScore = await RiskScore.create({
            userId,
            riskProbability: aiResults.riskProbability,
            brainAge: aiResults.brainAge,
            cognitiveIndex: aiResults.cognitiveIndex,
            riskLevel: aiResults.riskLevel,
            memoryScore,
            // Convert raw reaction time to a 0–100 score similar to response payload
            reactionScore: Math.round(100 - (reactionTime / 10)),
            attentionScore,
            typingSpeed,
            voiceScore: Math.round(voiceScore),
        });

        // 4. Update User baseline flag if first time
        await User.update({ baselineCompleted: true }, { where: { id: userId } });

        res.status(201).json({
            message: 'Test submitted and processed successfully',
            cognitiveIndex: aiResults.cognitiveIndex,
            brainAge: aiResults.brainAge,
            riskProbability: aiResults.riskProbability,
            riskLevel: aiResults.riskLevel,
            memoryScore,
            reactionScore: Math.round(100 - (reactionTime / 10)),
            attentionScore,
            voiceScore: Math.round(voiceScore),
            typingScore: typingSpeed,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getTestHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const history = await RiskScore.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
        });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
