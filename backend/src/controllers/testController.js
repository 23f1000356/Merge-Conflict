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

        // 2. Call AI Service for Risk Assessment
        let aiResults = {
            riskProbability: 0,
            brainAge: 0,
            cognitiveIndex: 0,
            riskLevel: 'Low'
        };

        try {
            const response = await axios.post(`${process.env.AI_SERVICE_URL}/predict`, {
                memoryScore,
                reactionTime,
                attentionScore,
                typingSpeed,
            });
            aiResults = response.data;
        } catch (error) {
            console.error('AI Service Error:', error.message);
            // Fallback or handle error
        }

        // 3. Store Risk Score
        const riskScore = await RiskScore.create({
            userId,
            riskProbability: aiResults.riskProbability,
            brainAge: aiResults.brainAge,
            cognitiveIndex: aiResults.cognitiveIndex,
            riskLevel: aiResults.riskLevel,
        });

        // 4. Update User baseline flag if first time
        await User.update({ baselineCompleted: true }, { where: { id: userId } });

        res.status(201).json({
            message: 'Test submitted and processed successfully',
            testResult,
            riskScore,
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
