import { User, RiskScore } from '../models/index.js';

export const getPatients = async (req, res) => {
    try {
        const patients = await User.findAll({
            where: { role: 'patient' },
            attributes: ['id', 'fullName', 'email', 'age', 'gender', 'baselineCompleted'],
            include: [{
                model: RiskScore,
                limit: 1,
                order: [['createdAt', 'DESC']]
            }]
        });
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getPatientDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const patient = await User.findByPk(id, {
            include: [RiskScore]
        });
        if (!patient) return res.status(404).json({ message: 'Patient not found' });
        res.json(patient);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        await User.update({ role }, { where: { id } });
        res.json({ message: 'User role updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
