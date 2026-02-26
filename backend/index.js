import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './src/config/database.js';
import authRoutes from './src/routes/authRoutes.js';
import testRoutes from './src/routes/testRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import doctorRoutes from './src/routes/doctorRoutes.js';
import appointmentRoutes from './src/routes/appointmentRoutes.js';
import riskAlertRoutes from './src/routes/riskAlertRoutes.js';
import clinicalNoteRoutes from './src/routes/clinicalNoteRoutes.js';
import followUpRoutes from './src/routes/followUpRoutes.js';
import metricsRoutes from './src/routes/metricsRoutes.js';
import reportRoutes from './src/routes/reportRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/users', userRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/alerts', riskAlertRoutes);
app.use('/api/clinical-notes', clinicalNoteRoutes);
app.use('/api/follow-ups', followUpRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/reports', reportRoutes);

// Root route
app.get('/', (req, res) => {
    res.send('Healthcare API is running...');
});

// Database Sync and Start Server
sequelize.sync({ alter: true }).then(() => {
    console.log('Database synced successfully.');
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});
