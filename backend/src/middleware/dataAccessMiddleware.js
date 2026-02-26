import { User } from '../models/index.js';

// Verify doctor has access to patient data
export const verifyPatientAccess = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        const doctorId = req.user.id;

        // Only doctors can access patient data
        if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }

        // Check if patient is assigned to this doctor
        const patient = await User.findOne({
            where: { id: patientId, doctorId }
        });

        if (!patient && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied: Patient not assigned to you' });
        }

        req.patient = patient;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Verify resource ownership for clinical data
export const verifyClinicalNoteAccess = async (req, res, next) => {
    try {
        const { noteId } = req.params;
        const doctorId = req.user.id;

        const { ClinicalNote } = await import('../models/index.js');
        const note = await ClinicalNote.findByPk(noteId);

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        // Only the creating doctor or admin can access
        if (note.doctorId !== doctorId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        req.clinicalNote = note;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Rate limiting for API endpoints
const requestCache = {};

export const rateLimit = (maxRequests, timeWindowMs) => {
    return (req, res, next) => {
        const key = `${req.user.id}-${req.path}`;
        const now = Date.now();

        if (!requestCache[key]) {
            requestCache[key] = [];
        }

        // Remove old requests outside the time window
        requestCache[key] = requestCache[key].filter(
            timestamp => now - timestamp < timeWindowMs
        );

        if (requestCache[key].length >= maxRequests) {
            return res.status(429).json({ 
                message: 'Rate limit exceeded',
                retryAfter: timeWindowMs
            });
        }

        requestCache[key].push(now);
        next();
    };
};

// HIPAA compliance logging
export const logDataAccess = async (req, res, next) => {
    try {
        // Log who accessed what data and when
        const logEntry = {
            userId: req.user.id,
            action: req.method,
            endpoint: req.originalUrl,
            timestamp: new Date(),
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        };

        // In production, save to audit log database
        console.log('[AUDIT LOG]', logEntry);

        next();
    } catch (error) {
        console.error('Logging error:', error);
        next();
    }
};

// Encryption of sensitive data in context
export const encryptSensitiveData = (data) => {
    // In production, use actual encryption library
    // For now, return as-is
    return data;
};

// Verify appointment access
export const verifyAppointmentAccess = async (req, res, next) => {
    try {
        const { appointmentId } = req.params;
        const doctorId = req.user.id;

        const { Appointment } = await import('../models/index.js');
        const appointment = await Appointment.findByPk(appointmentId);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Check if doctor is the appointment's doctor or admin
        if (appointment.doctorId !== doctorId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        req.appointment = appointment;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Validate request body for medical data
export const validateMedicalNote = (req, res, next) => {
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ 
            message: 'Missing required fields: title and content' 
        });
    }

    if (title.length < 3 || title.length > 200) {
        return res.status(400).json({ 
            message: 'Title must be between 3 and 200 characters' 
        });
    }

    if (content.length < 10 || content.length > 5000) {
        return res.status(400).json({ 
            message: 'Content must be between 10 and 5000 characters' 
        });
    }

    next();
};

// Error handler for secure endpoints
export const securErrorHandler = (err, req, res, next) => {
    // Don't expose internal error details
    const statusCode = err.statusCode || 500;
    const isDevelopment = process.env.NODE_ENV === 'development';

    const response = {
        success: false,
        message: isDevelopment ? err.message : 'An error occurred'
    };

    if (isDevelopment) {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};
