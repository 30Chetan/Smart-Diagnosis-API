import express from 'express';
import {
    createDiagnosis,
    getDiagnosisHistory,
} from '../controllers/diagnosisController.js';

const router = express.Router();

// POST /api/diagnosis/diagnose  – Run hybrid diagnosis
router.post('/diagnose', createDiagnosis);

// GET  /api/diagnosis/history   – Fetch paginated history
// Query params: ?page=1&limit=10
router.get('/history', getDiagnosisHistory);

export default router;
