# Smart Diagnosis API

A production-ready Node.js backend for a medical symptom analysis and diagnosis history tracking system, enhanced with **Google Gemini AI** for intelligent response improvement.

## Tech Stack

| Package | Purpose |
|---------|---------|
| **Node.js** + **Express.js** | Server-side framework |
| **MongoDB** + **Mongoose** | Database and ODM |
| **@google/generative-ai** | Gemini AI response enhancement |
| **Axios** | HTTP client |
| **Dotenv** | Environment variable management |
| **CORS** | Cross-origin resource sharing |
| **Nodemon** | Dev auto-reload |

## Features

- **Hybrid Diagnosis Engine** — rule-based layer + Gemini AI enhancement layer
- **Google Gemini AI Integration** — improves wording, enriches next steps, and ranks conditions by confidence
- **MongoDB Persistence** — every diagnosis is saved with timestamps
- **Paginated History API** — retrieve past diagnoses with `?page=&limit=`
- **Global Error Handling** — centralised middleware with environment-aware stack traces
- **Graceful AI Fallback** — if Gemini is unavailable, the rule-based result is returned seamlessly

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Google Gemini API key → [Get yours here](https://aistudio.google.com/app/apikey)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the example env file and fill in your values:
   ```bash
   cp .env.example .env
   ```
4. Edit `.env`:
   ```env
   PORT=5002
   MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/smart-diagnosis
   GEMINI_API_KEY=your_gemini_api_key_here
   NODE_ENV=development
   ```

### Running the Server

```bash
# Development (auto-reload with nodemon)
npm run dev

# Production
npm start
```

## API Endpoints

**Base URL:** `http://localhost:5002/api/diagnosis`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | API health check status |
| `POST` | `/diagnose` | Submit symptoms, get AI-enhanced diagnosis |
| `GET` | `/history` | Get paginated diagnosis history |

### POST `/diagnose`

**Request body:**
```json
{
  "symptoms": "fever, cough, chest pain"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "symptoms": "fever, cough, chest pain",
    "possibleConditions": [
      {
        "condition": "Influenza (Flu)",
        "probability": "75%",
        "suggestedNextSteps": [
          "Schedule a Complete Blood Count (CBC) test",
          "Consult a General Physician within 24 hours"
        ]
      }
    ]
  }
}
```

### GET `/history?page=1&limit=10`

**Response:**
```json
{
  "success": true,
  "count": 3,
  "total": 25,
  "page": 1,
  "totalPages": 3,
  "history": [...]
}
```

## AI Integration

Diagnosis enhancement uses the **Google Gemini API** (`gemini-1.5-flash` model):

1. **Layer 1** — rule-based engine in `symptomRules.js` maps symptom combinations to conditions with base probabilities
2. **Layer 2** — Gemini AI refines the output: improves medical wording, makes next steps actionable, and ranks conditions by confidence
3. **Fallback** — if Gemini is unavailable (no key, quota exceeded, network error), the rule-based output is returned without breaking the API

## Folder Structure

```
smart-diagnosis-api/
│── src/
│   ├── config/          # MongoDB connection (db.js)
│   ├── controllers/     # Route handlers (diagnosisController.js)
│   ├── models/          # Mongoose schemas (Diagnosis.js)
│   ├── routes/          # Express routes (diagnosisRoutes.js)
│   ├── services/        # Hybrid diagnosis engine (diagnosisService.js)
│   ├── utils/           # Symptom-condition rules (symptomRules.js)
│   └── app.js           # Express app setup
│── server.js            # Entry point
│── .env                 # Environment variables (git-ignored)
│── .env.example         # Template for env setup
│── package.json
└── README.md
```
