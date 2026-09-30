/**
 * ScamShield AI — Gemini Intelligence Engine
 * Provides AI-powered scam/fraud analysis via Google Gemini API.
 * Supports custom API key from request or server environment.
 * Falls back gracefully to heuristic engine when API unavailable.
 */

import { GoogleGenAI, Type } from '@google/genai';
import type { ThreatSignal, RiskLevel, ConfidenceLevel, SignalSeverity, SignalCategory } from '../types/analysis.js';

export interface GeminiSignal {
  id: string;
  name: string;
  severity: SignalSeverity;
  category: SignalCategory;
  explanation: string;
  evidence?: string;
}

export interface GeminiAnalysisResult {
  available: boolean;
  riskScore: number;
  riskLevel: RiskLevel;
  confidence: ConfidenceLevel;
  summary: string;
  signals: GeminiSignal[];
  explanation: string;
  claimedOrganization?: string;
  suspiciousPhrases: string[];
  safeVerificationSteps: string[];
  model: string;
}

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    riskScore: {
      type: Type.INTEGER,
      description: 'Risk score from 0 to 100. 0 = completely safe, 100 = extreme scam indicators.',
    },
    riskLevel: {
      type: Type.STRING,
      description: 'One of: CRITICAL, HIGH, ELEVATED, MEDIUM, LOW, NEGLIGIBLE',
    },
    confidence: {
      type: Type.STRING,
      description: 'One of: High, Medium, Low — how confident the assessment is',
    },
    summary: {
      type: Type.STRING,
      description: 'One sentence professional summary of the threat assessment (max 150 chars)',
    },
    explanation: {
      type: Type.STRING,
      description: 'Detailed 2-4 sentence explanation of why this content is suspicious or legitimate. Use professional cybersecurity language.',
    },
    claimedOrganization: {
      type: Type.STRING,
      description: 'The organization or brand this content claims to be from, if any. Empty string if none.',
    },
    suspiciousPhrases: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Array of exact verbatim phrases from the content that are suspicious (max 5)',
    },
    signals: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: 'Short unique ID like SIG-URG-001' },
          name: { type: Type.STRING, description: 'Signal name e.g. "Urgency Manipulation"' },
          severity: { type: Type.STRING, description: 'One of: CRITICAL, HIGH, MEDIUM, LOW' },
          category: { type: Type.STRING, description: 'One of: urgency, credential_harvesting, financial_demand, impersonation, suspicious_url, authority_pressure, fear_tactics, unusual_sender, malware_delivery, obfuscation' },
          explanation: { type: Type.STRING, description: 'Why this signal is suspicious (1-2 sentences)' },
          evidence: { type: Type.STRING, description: 'The exact text from content that triggered this signal' },
        },
        propertyOrdering: ['id', 'name', 'severity', 'category', 'explanation', 'evidence'],
      },
      description: 'Array of detected threat signals.',
    },
    safeVerificationSteps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Array of 3-6 actionable safe verification steps specific to this content',
    },
  },
  propertyOrdering: [
    'riskScore', 'riskLevel', 'confidence', 'summary',
    'explanation', 'claimedOrganization', 'suspiciousPhrases', 'signals', 'safeVerificationSteps'
  ],
};

const SYSTEM_PROMPT = `You are ScamShield AI — an elite cyber fraud intelligence analyst.

Your job is to analyze potential scams, phishing, social engineering attacks, fake websites, malware delivery lures, financial fraud, impersonation, and extortion.

SCORING STANDARDS:
- 0-15: NEGLIGIBLE (Normal transactional or interpersonal communication)
- 16-35: LOW (Minor unusual patterns, verify independently)
- 36-55: ELEVATED (Multiple suspicious indicators, caution required)
- 56-75: HIGH (Strong fraud/phishing indicators detected)
- 76-100: CRITICAL (Clear malicious intent, credential harvesting, extortion, or active scam)

RULES:
- Never claim "this is definitively a scam". Always use: "High-risk indicators detected" or "Elevated risk signals identified".
- Provide objective, highly technical, and reasoned signals.
- Extract exact verbatim phrases in suspiciousPhrases.
- Categorize correctly into: urgency, credential_harvesting, financial_demand, impersonation, suspicious_url, authority_pressure, fear_tactics, unusual_sender, malware_delivery, obfuscation.`;

export function getGeminiClient(customApiKey?: string): GoogleGenAI | null {
  const key = customApiKey || process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenAI({ apiKey: key });
}

export async function runGeminiAnalysis(
  content: string,
  inputType: 'message' | 'url' | 'screenshot' | 'email',
  depth: 'standard' | 'deep' = 'standard',
  customApiKey?: string
): Promise<GeminiAnalysisResult> {
  const client = getGeminiClient(customApiKey);

  if (!client) {
    return {
      available: false,
      riskScore: 0,
      riskLevel: 'LOW',
      confidence: 'Low',
      summary: 'AI model offline — evaluated via heuristic analysis engine',
      signals: [],
      explanation: 'No Gemini API key detected. Analysis performed using multi-rule deterministic heuristic engines.',
      suspiciousPhrases: [],
      safeVerificationSteps: [],
      model: 'deterministic-heuristics',
    };
  }

  const modelName = 'gemini-2.5-flash';

  const prompt = `Analyze this ${inputType.toUpperCase()} for fraud, social engineering, and security threats:

"""
${content}
"""

Return your evaluation strictly in the requested JSON structure.`;

  try {
    const response = await client.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseJsonSchema: ANALYSIS_SCHEMA,
        temperature: 0.1,
      },
    });

    const raw = response.text;
    if (!raw) throw new Error('Empty response from model');

    const parsed = JSON.parse(raw);

    const score = Math.max(0, Math.min(100, Math.round(Number(parsed.riskScore) || 0)));
    const level = mapRiskLevel(parsed.riskLevel, score);
    const confidence = mapConfidence(parsed.confidence);

    const normalizedSignals: GeminiSignal[] = (parsed.signals || []).map((s: any, idx: number) => ({
      id: s.id || `SIG-AI-${idx + 1}`,
      name: s.name || 'Suspicious Pattern',
      severity: mapSeverity(s.severity),
      category: mapCategory(s.category),
      explanation: s.explanation || 'Signal detected during threat analysis.',
      evidence: s.evidence || undefined,
    }));

    return {
      available: true,
      riskScore: score,
      riskLevel: level,
      confidence,
      summary: parsed.summary || 'Threat indicators evaluated.',
      signals: normalizedSignals,
      explanation: parsed.explanation || '',
      claimedOrganization: parsed.claimedOrganization || undefined,
      suspiciousPhrases: Array.isArray(parsed.suspiciousPhrases) ? parsed.suspiciousPhrases : [],
      safeVerificationSteps: Array.isArray(parsed.safeVerificationSteps) ? parsed.safeVerificationSteps : [],
      model: modelName,
    };
  } catch (err) {
    console.error('[GeminiEngine] Error calling Gemini:', err);
    return {
      available: false,
      riskScore: 0,
      riskLevel: 'LOW',
      confidence: 'Low',
      summary: 'AI service unreachable — falling back to deterministic heuristic inspection',
      signals: [],
      explanation: `AI engine request failed: ${err instanceof Error ? err.message : 'Unknown'}. Multi-vector heuristic fallback active.`,
      suspiciousPhrases: [],
      safeVerificationSteps: [],
      model: modelName,
    };
  }
}

export async function runGeminiOCR(
  imageBase64: string,
  mimeType: string,
  customApiKey?: string
): Promise<string> {
  const client = getGeminiClient(customApiKey);
  if (!client) throw new Error('GEMINI_API_KEY not configured');

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: mimeType as any,
              data: imageBase64,
            },
          },
          {
            text: 'Transcribe all visible text in this image precisely. Preserve URLs, senders, warnings, phone numbers, timestamps, and amounts verbatim without commentary.',
          },
        ],
      },
    ],
    config: { temperature: 0 },
  });

  return response.text || '';
}

function mapRiskLevel(raw: string, score: number): RiskLevel {
  const upper = (raw || '').toUpperCase();
  if (['CRITICAL', 'HIGH', 'ELEVATED', 'MEDIUM', 'LOW', 'NEGLIGIBLE'].includes(upper)) {
    return upper as RiskLevel;
  }
  if (score >= 76) return 'CRITICAL';
  if (score >= 56) return 'HIGH';
  if (score >= 36) return 'ELEVATED';
  if (score >= 16) return 'LOW';
  return 'NEGLIGIBLE';
}

function mapConfidence(raw: string): ConfidenceLevel {
  const str = (raw || '').toLowerCase();
  if (str.startsWith('h')) return 'High';
  if (str.startsWith('l')) return 'Low';
  return 'Medium';
}

function mapSeverity(raw: string): SignalSeverity {
  const upper = (raw || '').toUpperCase();
  if (['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(upper)) {
    return upper as SignalSeverity;
  }
  return 'MEDIUM';
}

function mapCategory(raw: string): SignalCategory {
  const valid: SignalCategory[] = [
    'urgency',
    'credential_harvesting',
    'financial_demand',
    'impersonation',
    'suspicious_url',
    'authority_pressure',
    'fear_tactics',
    'unusual_sender',
    'malware_delivery',
    'obfuscation'
  ];
  const lower = (raw || '').toLowerCase().replace(/[-\s]/g, '_') as SignalCategory;
  if (valid.includes(lower)) return lower;
  return 'impersonation';
}

export function convertGeminiSignalsToThreatSignals(geminiSignals: GeminiSignal[]): ThreatSignal[] {
  return geminiSignals.map(s => ({
    id: s.id,
    name: s.name,
    severity: s.severity,
    category: s.category,
    explanation: s.explanation,
    matchedSnippets: s.evidence ? [s.evidence] : undefined,
  }));
}
