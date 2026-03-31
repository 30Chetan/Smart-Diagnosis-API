import mongoose from 'mongoose';

const conditionSchema = new mongoose.Schema(
    {
        condition: {
            type: String,
            required: true,
        },
        probability: {
            type: String,
            required: true,
        },
        suggestedNextSteps: {
            type: [String],
            default: [],
        },
    },
    { _id: false }
);

const diagnosisSchema = new mongoose.Schema(
    {
        symptoms: {
            type: String,
            required: true,
            trim: true,
        },
        possibleConditions: {
            type: [conditionSchema],
            required: true,
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
    }
);

const Diagnosis = mongoose.model('Diagnosis', diagnosisSchema);

export default Diagnosis;
