import { Router, Request, Response } from 'express';
import multer from 'multer';
import { runThreatAnalysis } from '../engines/analyzer.js';
import { extractTextFromScreenshot } from '../engines/ocr-service.js';
import { AnalysisRequest } from '../types/analysis.js';
import { getGeminiClient } from '../engines/gemini-ai-engine.js';

export const analyzeRouter = Router();

// Configure multer memory storage with 10MB limit and image filter
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedMime = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (allowedMime.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Please upload PNG, JPG, or WEBP.'));
    }
  }
});

function getApiKeyFromReq(req: Request): string | undefined {
  const headerKey = req.headers['x-gemini-api-key'];
  if (typeof headerKey === 'string' && headerKey.trim().length > 0) {
    return headerKey.trim();
  }
  if (req.body && typeof req.body.apiKey === 'string' && req.body.apiKey.trim().length > 0) {
    return req.body.apiKey.trim();
  }
  return undefined;
}

// 0. Test Gemini API Key
analyzeRouter.post('/test-key', async (req: Request, res: Response): Promise<void> => {
  const apiKey = getApiKeyFromReq(req);
  if (!apiKey) {
    res.status(400).json({ valid: false, error: 'No API key provided.' });
    return;
  }

  try {
    const client = getGeminiClient(apiKey);
    if (!client) {
      res.status(400).json({ valid: false, error: 'Failed to initialize client with provided key.' });
      return;
    }
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Ping: Respond with "pong" only.',
    });
    if (response.text) {
      res.json({ valid: true, model: 'gemini-2.5-flash', message: 'API key successfully validated with Google Gemini.' });
    } else {
      res.status(400).json({ valid: false, error: 'Received empty response from Gemini model.' });
    }
  } catch (err: unknown) {
    res.status(400).json({ valid: false, error: err instanceof Error ? err.message : 'Invalid API key or network error.' });
  }
});

// 1. Analyze Message / Text
analyzeRouter.post('/message', async (req: Request, res: Response): Promise<void> => {
  try {
    const { content, language, depth } = req.body;
    const customApiKey = getApiKeyFromReq(req);

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      res.status(400).json({ error: 'Please enter a message to analyze.' });
      return;
    }

    if (content.length > 50000) {
      res.status(400).json({ error: 'Input content exceeds maximum allowed limit (50,000 characters).' });
      return;
    }

    const analysisReq: AnalysisRequest = {
      type: 'message',
      content: content.trim(),
      language,
      depth: depth === 'deep' ? 'deep' : 'standard'
    };

    const result = await runThreatAnalysis(analysisReq, customApiKey);
    res.json(result);
  } catch (err: unknown) {
    console.error('Error during message analysis:', err);
    res.status(500).json({ error: 'Analysis could not be completed. Please try again.' });
  }
});

// 2. Analyze URL
analyzeRouter.post('/url', async (req: Request, res: Response): Promise<void> => {
  try {
    const { url, depth } = req.body;
    const customApiKey = getApiKeyFromReq(req);

    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      res.status(400).json({ error: 'Please enter a valid URL.' });
      return;
    }

    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    try {
      const parsed = new URL(cleanUrl);
      if (!parsed.hostname.includes('.') && !parsed.hostname.includes(':') && parsed.hostname !== 'localhost') {
        res.status(400).json({ error: 'Please enter a valid URL.' });
        return;
      }
    } catch {
      res.status(400).json({ error: 'Please enter a valid URL.' });
      return;
    }

    const analysisReq: AnalysisRequest = {
      type: 'url',
      content: cleanUrl,
      depth: depth === 'deep' ? 'deep' : 'standard'
    };

    const result = await runThreatAnalysis(analysisReq, customApiKey);
    res.json(result);
  } catch (err: unknown) {
    console.error('Error during URL analysis:', err);
    res.status(500).json({ error: 'Analysis could not be completed.' });
  }
});

// 3. Analyze Screenshot (with OCR)
analyzeRouter.post('/screenshot', (req: Request, res: Response): void => {
  upload.single('screenshot')(req, res, async (uploadErr) => {
    if (uploadErr) {
      if (uploadErr instanceof multer.MulterError && uploadErr.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({ error: 'Image size exceeds 10MB limit.' });
        return;
      }
      res.status(400).json({ error: uploadErr.message || 'Unsupported file type.' });
      return;
    }

    try {
      if (!req.file) {
        res.status(400).json({ error: 'No screenshot file provided. Please drop or select an image.' });
        return;
      }

      const customApiKey = getApiKeyFromReq(req);

      // Extract text from image via OCR service (Gemini Vision or Tesseract offline)
      const ocrResult = await extractTextFromScreenshot(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        customApiKey
      );

      const extractedText = ocrResult.text;

      // Run threat analysis on the extracted text
      const analysisReq: AnalysisRequest = {
        type: 'screenshot',
        content: extractedText,
        depth: (req.body.depth as 'standard' | 'deep') || 'standard'
      };

      const result = await runThreatAnalysis(analysisReq, customApiKey);
      result.extractedText = extractedText;
      if (ocrResult.warning) {
        result.disclaimer += ` Note: ${ocrResult.warning}`;
      }

      res.json(result);
    } catch (err: unknown) {
      console.error('Error during screenshot analysis:', err);
      res.status(500).json({ error: 'Analysis could not be completed from screenshot.' });
    }
  });
});

// 4. Analyze Email
analyzeRouter.post('/email', async (req: Request, res: Response): Promise<void> => {
  try {
    const { from, subject, body, headers, depth } = req.body;
    const customApiKey = getApiKeyFromReq(req);

    if (!body && !subject) {
      res.status(400).json({ error: 'Please provide at least a subject or email body to analyze.' });
      return;
    }

    const analysisReq: AnalysisRequest = {
      type: 'email',
      content: body || subject || '',
      emailFields: {
        from: from ? String(from).trim() : undefined,
        subject: subject ? String(subject).trim() : undefined,
        body: body ? String(body).trim() : undefined,
        headers: headers ? String(headers).trim() : undefined
      },
      depth: depth === 'deep' ? 'deep' : 'standard'
    };

    const result = await runThreatAnalysis(analysisReq, customApiKey);
    res.json(result);
  } catch (err: unknown) {
    console.error('Error during email analysis:', err);
    res.status(500).json({ error: 'Analysis could not be completed.' });
  }
});
