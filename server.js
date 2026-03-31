import app from './src/app.js';
import connectDB from './src/config/db.js';
import dotenv from 'dotenv';

dotenv.config();

// ── Env validation ────────────────────────────────────────────────────────────
const REQUIRED_ENV = ['MONGO_URI', 'PORT'];
const missing = REQUIRED_ENV.filter(key => !process.env[key]);
if (missing.length) {
    console.error(`[server] Missing required environment variables: ${missing.join(', ')}`);
    console.error('[server] Copy .env.example to .env and fill in the values.');
    process.exit(1);
}

const PORT = process.env.PORT || 5002;

// ── Boot sequence: DB first, then HTTP ───────────────────────────────────────
const startServer = async () => {
    try {
        await connectDB(); // Wait for DB before accepting requests

        app.listen(PORT, () => {
            console.log(`[server] Running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        });
    } catch (err) {
        console.error('[server] Failed to start:', err.message);
        process.exit(1);
    }
};

startServer();
