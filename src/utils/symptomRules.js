export const rules = [
    {
        condition: 'Flu',
        symptoms: ['fever', 'cough'],
        probability: '75%',
        suggestedNextSteps: ['CBC blood test', 'Consult General Physician'],
    },
    {
        condition: 'Pneumonia',
        symptoms: ['fever', 'chest pain'],
        probability: '70%',
        suggestedNextSteps: ['Chest X-ray', 'Consult Pulmonologist'],
    },
    {
        condition: 'Bronchitis',
        symptoms: ['cough', 'chest pain'],
        probability: '65%',
        suggestedNextSteps: ['Sputum test', 'Consult General Physician'],
    },
    {
        condition: 'Cardiac issue',
        symptoms: ['chest pain'],
        probability: '60%',
        suggestedNextSteps: ['ECG', 'Visit ER immediately'],
    },
];
