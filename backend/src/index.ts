import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/database';
import { seedCountries } from './services/countrySeedService';
import routes from './routes';
import './services/scheduler'; // Initialize cron jobs

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json());

// Initialize database
initializeDatabase();

// Seed countries if database is empty
import { db } from './config/database';
const countries = db.prepare('SELECT * FROM countries').all() as any[];
if (countries.length === 0) {
  console.log('Database is empty, seeding countries...');
  seedCountries();
}

// Routes
app.use('/api', routes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📊 API endpoints available at http://0.0.0.0:${PORT}/api`);
  console.log(`❤️  Health check: http://0.0.0.0:${PORT}/api/health`);
});

