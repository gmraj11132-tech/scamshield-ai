import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { healthRouter } from './routes/health.js';
import { demoRouter } from './routes/demo.js';
import { analyzeRouter } from './routes/analyze.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple in-memory rate limiter (60 requests per minute per IP)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 60;

app.use((req: Request, res: Response, next: NextFunction): void => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = requestCounts.get(ip);

  if (!entry || now > entry.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    next();
    return;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    res.status(429).json({
      error: 'Rate limit exceeded. Please wait a moment before initiating further analysis requests.'
    });
    return;
  }

  entry.count++;
  next();
});

// Clean up old rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of requestCounts.entries()) {
    if (now > entry.resetTime) {
      requestCounts.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// API Routes
app.use('/api/health', healthRouter);
app.use('/api/demo-samples', demoRouter);
app.use('/api/analyze', analyzeRouter);

// Static client assets serving (production mode)
const candidateDistPaths = [
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), '../client/dist')
];

let clientDistPath: string | null = null;
for (const cand of candidateDistPaths) {
  if (fs.existsSync(cand) && fs.existsSync(path.join(cand, 'index.html'))) {
    clientDistPath = cand;
    break;
  }
}

if (clientDistPath) {
  console.log(`[Static Assets] Serving built client from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath!, 'index.html'));
  });
} else {
  // 404 handler for API or when no static build
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Endpoint not found.' });
  });
}

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error occurred.' });
});

app.listen(PORT, () => {
  console.log(`[ScamShield AI Core] Server listening on http://localhost:${PORT}`);
  console.log(`[Engine Mode] Local Deterministic Heuristics + Threat Dissection active`);
});

export default app;
