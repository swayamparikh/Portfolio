import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

import authRoutes from './routes/auth';
import businessRoutes from './routes/businesses';
import receiptRoutes from './routes/receipts';
import transactionRoutes from './routes/transactions';
import reportRoutes from './routes/reports';
import aiRoutes from './routes/ai';
import anomalyRoutes from './routes/anomalies';
import categoryRoutes from './routes/categories';

const app = express();
const PORT = process.env.PORT || 4000;
const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static(uploadDir));

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'ledgerlite-backend' }));

app.use('/api/auth', authRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/anomalies', anomalyRoutes);
app.use('/api/categories', categoryRoutes);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`LedgerLite backend listening on http://localhost:${PORT}`);
  if (!process.env.GROQ_API_KEY) console.warn('⚠ GROQ_API_KEY not set — AI features running in deterministic mock mode.');
});
