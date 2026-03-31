import diagnosisService from '../services/diagnosisService.js';

// POST /api/diagnosis/diagnose
export const createDiagnosis = async (req, res, next) => {
    try {
        const { symptoms } = req.body;

        if (!symptoms || typeof symptoms !== 'string' || !symptoms.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Bad Request',
                message: 'symptoms is required and must be a non-empty comma-separated string.',
            });
        }

        const result = await diagnosisService.analyzeSymptoms(symptoms.trim());

        return res.status(201).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/diagnosis/history?page=1&limit=10
export const getDiagnosisHistory = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const { history, total, page: currentPage, limit: currentLimit } =
            await diagnosisService.getHistory({ page, limit });

        return res.status(200).json({
            success: true,
            count: history.length,
            total,
            page: currentPage,
            totalPages: Math.ceil(total / currentLimit),
            history,
        });
    } catch (error) {
        next(error);
    }
};
