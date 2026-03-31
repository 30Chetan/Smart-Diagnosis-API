import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import diagnosisRoutes from './routes/diagnosisRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Smart Diagnosis API is running'
    });
});

app.use('/api/diagnosis', diagnosisRoutes);

// Error Handler Middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

export default app;
