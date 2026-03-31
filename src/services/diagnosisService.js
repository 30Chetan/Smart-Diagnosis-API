import { rules } from '../utils/symptomRules.js';
import Diagnosis from '../models/Diagnosis.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

class DiagnosisService {
    // ─── Layer 1: Rule-Based Matching ────────────────────────────────────────

    _applyRules(symptomsArray) {
        const matchedConditions = [];

        // Strict match: all rule symptoms present in input
        for (const rule of rules) {
            const isMatch = rule.symptoms.every(rs => symptomsArray.includes(rs));
            if (isMatch) {
                matchedConditions.push({
                    condition: rule.condition,
                    probability: rule.probability,
                    suggestedNextSteps: [...rule.suggestedNextSteps],
                });
            }
        }

        // Soft match fallback: at least one rule symptom present
        if (matchedConditions.length === 0) {
            for (const rule of rules) {
                const isMatch = rule.symptoms.some(rs => symptomsArray.includes(rs));
                if (isMatch) {
                    matchedConditions.push({
                        condition: rule.condition,
                        probability: rule.probability,
                        suggestedNextSteps: [...rule.suggestedNextSteps],
                    });
                }
            }
        }

        // Final fallback when no rule fires at all
        if (matchedConditions.length === 0) {
            matchedConditions.push({
                condition: 'Indeterminate Condition',
                probability: '10%',
                suggestedNextSteps: [
                    'Monitor symptoms carefully',
                    'Schedule a General Checkup',
                ],
            });
        }

        return matchedConditions.slice(0, 3);
    }

    // ─── Layer 2: Gemini AI Enhancement ──────────────────────────────────────

    async enhanceDiagnosisWithAI(symptoms, ruleBasedResult) {
        const apiKey = process.env.GEMINI_API_KEY;

        // Skip AI layer gracefully if key is not configured
        if (!apiKey || apiKey === 'your_gemini_api_key') {
            console.warn(
                '[DiagnosisService] GEMINI_API_KEY not set – returning rule-based output.'
            );
            return ruleBasedResult;
        }

        const prompt = `You are a professional medical diagnosis assistant.

A patient reported the following symptoms: "${symptoms}"

A rule-based system produced this preliminary diagnosis:
${JSON.stringify(ruleBasedResult, null, 2)}

Your task:
1. Analyze the symptoms and identify the most likely medical conditions. If the preliminary diagnosis is "Indeterminate", ignore it and create a completely fresh diagnosis.
2. Provide medically accurate and professional names for each condition.
3. Make each "suggestedNextSteps" item clear, specific, and actionable.
4. Set highly realistic probability percentages for EACH condition strictly based on how strongly the symptoms match (e.g., "90%", "75%", "15%"). Do NOT simply output 40% every time.
5. Return 2 to 3 possible conditions, ranked from highest to lowest probability.
6. Return ONLY a valid JSON object — no markdown, no explanation, no extra text.

Required JSON structure:
{
  "possibleConditions": [
    {
      "condition": "...",
      "probability": "...",
      "suggestedNextSteps": ["...", "..."]
    }
  ]
}`;

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

            const result = await model.generateContent(prompt);
            const rawText = result.response.text().trim();

            // Strip potential markdown code fences Gemini sometimes adds
            const jsonText = rawText
                .replace(/^```(?:json)?\s*/i, '')
                .replace(/\s*```$/, '')
                .trim();

            const parsed = JSON.parse(jsonText);

            if (
                !parsed.possibleConditions ||
                !Array.isArray(parsed.possibleConditions)
            ) {
                throw new Error('Gemini response missing possibleConditions array.');
            }

            // Ensure sort order is highest probability first
            parsed.possibleConditions.sort((a, b) => {
                const pA = parseInt(a.probability) || 0;
                const pB = parseInt(b.probability) || 0;
                return pB - pA;
            });

            return parsed.possibleConditions;
        } catch (err) {
            console.error(
                '[DiagnosisService] Gemini enhancement failed – falling back to rule-based output.',
                err.message
            );
            // Always return a valid response even when AI fails
            return ruleBasedResult;
        }
    }

    // ─── Persistence ──────────────────────────────────────────────────────────

    async _saveRecord(symptoms, possibleConditions) {
        const record = new Diagnosis({ symptoms, possibleConditions });
        return await record.save();
    }

    // ─── Public API ───────────────────────────────────────────────────────────

    async analyzeSymptoms(symptomsInput) {
        const symptomsArray = symptomsInput
            .split(',')
            .map(s => s.trim().toLowerCase());

        const ruleConditions  = this._applyRules(symptomsArray);
        const finalConditions = await this.enhanceDiagnosisWithAI(symptomsInput, ruleConditions);

        // Persist the final result to MongoDB
        await this._saveRecord(symptomsInput, finalConditions);

        return {
            symptoms: symptomsInput,
            possibleConditions: finalConditions,
        };
    }

    async getHistory({ page = 1, limit = 10 } = {}) {
        const pageNum  = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // cap at 100
        const skip     = (pageNum - 1) * limitNum;

        const [history, total] = await Promise.all([
            Diagnosis.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Diagnosis.countDocuments(),
        ]);

        return { history, total, page: pageNum, limit: limitNum };
    }
}

export default new DiagnosisService();
