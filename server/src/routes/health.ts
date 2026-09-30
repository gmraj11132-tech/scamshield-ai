import { Router, Request, Response } from 'express';

export const healthRouter = Router();

healthRouter.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'operational',
    service: 'ScamShield AI Core Engine',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    features: {
      localHeuristics: 'enabled',
      urlDissection: 'enabled',
      ocrEngine: 'active',
      externalIntelApi: Boolean(process.env.VIRUSTOTAL_API_KEY) ? 'configured' : 'unconfigured-local-only',
      geminiLinguisticEngine: Boolean(process.env.GEMINI_API_KEY) ? 'configured' : 'unconfigured-rule-mode'
    }
  });
});
