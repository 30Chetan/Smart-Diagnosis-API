<div align="center">
  <h1>🩺 Smart Diagnosis API</h1>
  <p>A production-ready Node.js backend system for medical symptom analysis, enhanced with Google Gemini AI and backed by MongoDB.</p>

  ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
  ![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
  ![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
  ![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)
</div>

<br />

## 📋 Overview
The **Smart Diagnosis API** is an intelligent symptom-analysis backend designed to take user-submitted symptoms and return probability-based medical conditions. To achieve high accuracy and professional formatting, the system uses a **Hybrid Architecture** combining a robust rule-based logic engine with the advanced capabilities of the **Google Gemini AI (`gemini-1.5-flash`)**. 

All diagnosis records are persistently stored in a MongoDB database, allowing users to query their past interaction history via a dedicated paginated endpoint.

---

## ✨ Core Features

*   **Hybrid AI Diagnosis Engine:** Uses strict rule-based arrays built by medical logic to establish baseline mapping, followed automatically by a Gemini AI layer that improves medical terminology, makes next steps highly actionable, and enforces structured JSON responses.
*   **MongoDB Persistence:** Uses Mongoose schemas (including nested constraint schemas) to save robust diagnosis histories alongside timestamps to track patient/system activity.
*   **Paginated History API:** Built-in `skip` and `limit` logic mapped to query parameters allowing efficient retrieval of large diagnosis datasets.
*   **Fault-Tolerant AI Design:** If the Google Gemini AI fails (network timeout, quota exceeded, or missing API keys), the system automatically gracefully falls back to the local `symptomRules.js` rule-based output without throwing a 500 server error to the user.
*   **Health and Monitoring Check:** Includes a production-standard `GET /health` endpoint for external load balancers/uptime trackers to ensure the API is continuously operational.
*   **Production-Ready Structure:** Enforces strict MVC separation of concerns, decoupled routing, centralised error-handling middleware, clean configuration validation, and asynchronous startup safety.

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js + Express** | High-performance, unopinionated asynchronous server backend. |
| **MongoDB + Mongoose** | Persistent document-based database and Object Data Modeling (ODM). |
| **@google/generative-ai** | Official Google SDK for interacting directly with the `gemini-1.5-flash` model. |
| **Axios** | HTTP client capable of cleanly bridging external data. |
| **Dotenv** | Secret and configuration management for safe deployments without hardcoding credentials. |
| **CORS** | Cross-Origin Resource Sharing handling to securely allow front-end applications to interact. |

---

## 📂 Folder Structure
```text
smart-diagnosis-api/
│── src/
│   ├── config/              # Centralised connection settings (e.g. MongoDB setup)
│   ├── controllers/         # Handles incoming HTTP requests and structures HTTP responses
│   ├── models/              # Strict Mongoose Schemas preventing destructive database writes 
│   ├── routes/              # Clean API URL routing and controller mapping
│   ├── services/            # Pure Business and AI Logic (completely decoupled from HTTP)
│   ├── utils/               # Hardcoded logic mapping files (symptomRules.js)
│   └── app.js               # Core Express app initialization and global middleware hooking
│── server.js                # Top-level entry file — handles asynchronous database boot before listening
│── .env                     # Secret local configuration variables (ignored by git)
│── .env.example             # Clean template indicating which environmental variables are required
│── .gitignore               # Ensures local files/node_modules are never pushed securely
│── package.json             # NPM dependencies and development/start scripts
└── README.md                # Project documentation
```

---

## 🚀 Installation & Setup

### Prerequisites
You must have **Node.js (v18+)** and **MongoDB (Local or Atlas)** installed/configured. You also require an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### 1. Clone the repository
```bash
git clone https://github.com/30Chetan/Smart-Diagnosis-API.git
cd Smart-Diagnosis-API
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
A `.env.example` has been provided. Duplicate it and rename it to `.env`:
```bash
cp .env.example .env
```
Inside `.env`, populate your required connections:
```env
PORT=5002
MONGO_URI=mongodb+srv://<username>:<password>@cluster.....mongodb.net/smart-diagnosis?retryWrites=true&w=majority
GEMINI_API_KEY=AIzaSy...your_gemini_key_here
NODE_ENV=development
```

### 4. Boot the server
**Development Mode** (Auto-restarts when you save files):
```bash
npm run dev
```
**Production Mode**:
```bash
npm start
```
*(You will see a confirmation terminal log tracking both the database connection and the active HTTP port)*.

---

## 📖 API Documentation

**Base API URL:** `http://localhost:5002`

### 1. Submit a Diagnosis
#### `POST /api/diagnosis/diagnose`

Evaluates raw symptom text over the hybrid AI engine.
*   **Headers**: `Content-Type: application/json`
*   **Body Example**: 
```json
{
  "symptoms": "fever, deep chest pain, heavy coughing"
}
```
*   **Response (201 Created)**: 
```json
{
  "success": true,
  "data": {
    "symptoms": "fever, deep chest pain, heavy coughing",
    "possibleConditions": [
      {
        "condition": "Acute Bronchitis",
        "probability": "75%",
        "suggestedNextSteps": [
          "Recommended Action: Schedule a Sputum test for proper care",
          "Recommended Action: Consult a General Physician for proper care"
        ]
      },
      {
        "condition": "Pneumonia",
        "probability": "70%",
        "suggestedNextSteps": [
          "Recommended Action: Book a Chest X-ray for proper care",
          "Recommended Action: Consult a Pulmonologist for proper care"
        ]
      }
    ]
  }
}
```

### 2. Retrieve Past Diagnoses (History)
#### `GET /api/diagnosis/history?page=1&limit=10`

Fetches all saved diagnoses persistently attached to the MongoDB database automatically ordered by `createdAt: -1`.
*   **Query Parameters (Optional)**:
    *   `page`: The page offset number (default: `1`).
    *   `limit`: Pagination row size ceiling per page (default: `10`, max: `100`).
*   **Response (200 OK)**:
```json
{
  "success": true,
  "count": 2,
  "total": 50,
  "page": 1,
  "totalPages": 5,
  "history": [
    {
      "_id": "654c6fa1...932",
      "symptoms": "fever, deep chest pain, heavy coughing",
      "possibleConditions": [ ... ],
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

### 3. Server Health Status
#### `GET /health`

Used seamlessly by platform load-balancers to confirm operational server health.
*   **Response (200 OK)**:
```json
{
    "status": "ok",
    "message": "Smart Diagnosis API is running"
}
```

---

## ☁️ Deployment Structure
This API is designed specifically to be "push-and-deploy" ready for platforms like **Render**, **Railway**, or **Heroku**. 
*   It explicitly binds to dynamically injected Environment variables via `process.env.PORT`. 
*   It properly waits with asynchronous blocking via `startServer()` mapping the MongoDB Connection prior to ever allowing the HTTP Server to accept external traffic, ensuring total crash-loop prevention. 
*   `npm start` correctly targets standard Node deployment architectures securely avoiding local `nodemon` instances.
