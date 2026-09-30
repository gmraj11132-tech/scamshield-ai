import {
  AnalysisRequest,
  AnalysisResult,
  UrlBreakdown,
  RiskLevel,
  FlaggedAnnotation
} from '../types/analysis.js';
import { parseInputContent } from './input-parser.js';
import { analyzeUrl } from './url-analyzer.js';
import { detectThreatSignals } from './signal-engine.js';
import { calculateRisk } from './risk-engine.js';
import { extractAnnotations } from './annotator.js';
import { compileEvidence } from './evidence-engine.js';
import { generateRecommendations } from './recommendation-engine.js';
import {
  runGeminiAnalysis,
  runGeminiOCR,
  convertGeminiSignalsToThreatSignals
} from './gemini-ai-engine.js';

export async function runThreatAnalysis(
  request: AnalysisRequest,
  customApiKey?: string
): Promise<AnalysisResult> {
  const startTime = Date.now();
  const inputType = request.type;

  // Combine raw text
  let rawText = request.content || '';
  if (inputType === 'email' && request.emailFields) {
    const fields = request.emailFields;
    rawText = [
      fields.subject ? `Subject: ${fields.subject}` : '',
      fields.from ? `From: ${fields.from}` : '',
      fields.body || ''
    ].filter(Boolean).join('\n\n');
  }

  // 1. Parse and extract entities
  const parsed = parseInputContent(rawText);

  // 2. URL analysis
  const urlBreakdowns: UrlBreakdown[] = [];
  if (inputType === 'url') {
    urlBreakdowns.push(analyzeUrl(rawText));
  } else {
    for (const extractedUrl of parsed.urls) {
      urlBreakdowns.push(analyzeUrl(extractedUrl));
    }
  }

  // Primary URL breakdown if available
  const primaryUrl = urlBreakdowns.length > 0 ? urlBreakdowns[0] : null;

  const emailMeta = request.emailFields ? {
    from: request.emailFields.from,
    subject: request.emailFields.subject
  } : undefined;

  // 3. Run Gemini AI analysis in parallel with heuristics
  const [geminiResult, heuristicSignals] = await Promise.all([
    runGeminiAnalysis(rawText, inputType, request.depth || 'standard', customApiKey),
    Promise.resolve(detectThreatSignals(parsed, urlBreakdowns, emailMeta))
  ]);

  // 4. Merge signals
  let finalSignals = heuristicSignals;
  let finalRiskScore: number;
  let finalRiskLevel: RiskLevel;
  let finalConfidence = 'Medium' as AnalysisResult['confidence'];
  let finalSummary: string;
  let aiEngineUsed = false;
  let aiModel = 'heuristic-engine-v2';

  if (geminiResult.available && geminiResult.signals.length > 0) {
    aiEngineUsed = true;
    aiModel = geminiResult.model;

    // Convert Gemini signals + merge unique heuristic signals
    const aiSignals = convertGeminiSignalsToThreatSignals(geminiResult.signals);
    const aiCategories = new Set(geminiResult.signals.map(s => s.category));
    const extraHeuristics = heuristicSignals.filter(hs => !aiCategories.has(hs.category));
    finalSignals = [...aiSignals, ...extraHeuristics];

    // Score blending: 70% Gemini, 30% heuristics
    const heuristicEval = calculateRisk(heuristicSignals, parsed, urlBreakdowns.length > 0);
    finalRiskScore = Math.round(geminiResult.riskScore * 0.7 + heuristicEval.riskScore * 0.3);
    finalRiskScore = Math.max(0, Math.min(100, finalRiskScore));

    finalRiskLevel = geminiResult.riskLevel;
    finalConfidence = geminiResult.confidence;
    finalSummary = geminiResult.summary;
  } else {
    // Pure heuristic fallback
    const riskEval = calculateRisk(heuristicSignals, parsed, urlBreakdowns.length > 0);
    finalRiskScore = riskEval.riskScore;
    finalRiskLevel = riskEval.riskLevel;
    finalConfidence = riskEval.confidence;
    finalSummary = riskEval.assessmentSummary;
  }

  // 5. Annotations for "Why This Was Flagged"
  const annotations: FlaggedAnnotation[] = extractAnnotations(rawText, parsed, urlBreakdowns);

  // Enhance annotations with Gemini suspicious phrases
  if (geminiResult.available && geminiResult.suspiciousPhrases.length > 0) {
    for (const phrase of geminiResult.suspiciousPhrases) {
      if (!phrase || phrase.length < 3) continue;
      const idx = rawText.toLowerCase().indexOf(phrase.toLowerCase());
      if (idx !== -1 && !annotations.some(a => a.text.toLowerCase() === phrase.toLowerCase())) {
        annotations.push({
          id: `ann-ai-${annotations.length + 1}`,
          start: idx,
          end: idx + phrase.length,
          text: rawText.substring(idx, idx + phrase.length),
          tag: 'AI-Flagged',
          reason: 'Identified by AI model as a high-risk suspicious phrase',
          severity: 'HIGH'
        });
      }
    }
  }

  // 6. Evidence collection
  const evidence = compileEvidence(parsed, finalSignals, primaryUrl);

  if (aiEngineUsed) {
    evidence.localAnalysis.unshift({
      label: `Neural AI Engine (${aiModel})`,
      value: geminiResult.explanation || 'Semantic and social-engineering analysis completed',
      detail: `Evaluated with high-precision neural parameters. Claimed org: ${geminiResult.claimedOrganization || 'None detected'}`
    });
  }

  // 7. Safe verification recommendations
  const verification = generateRecommendations(parsed, finalSignals, urlBreakdowns);

  if (geminiResult.available && geminiResult.safeVerificationSteps.length > 0) {
    // Prepend AI recommended steps
    const existing = new Set(verification.steps.map(s => s.toLowerCase()));
    const uniqueAiSteps = geminiResult.safeVerificationSteps.filter(s => !existing.has(s.toLowerCase()));
    verification.steps = [...uniqueAiSteps, ...verification.steps].slice(0, 6);
  }

  if (geminiResult.claimedOrganization && !verification.claimedOrganization) {
    verification.claimedOrganization = {
      name: geminiResult.claimedOrganization,
      isDetected: true,
      confidence: 'Medium',
      guidance: `Content claims affiliation with '${geminiResult.claimedOrganization}'. Never use links or phone numbers provided inside the message.`,
      officialVerificationRule: `Search for the official, authentic website of '${geminiResult.claimedOrganization}' independently.`
    };
  }

  const processingTimeMs = Date.now() - startTime;

  const result: AnalysisResult = {
    id: `scan-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    inputType,
    rawInput: rawText,
    riskLevel: finalRiskLevel,
    riskScore: finalRiskScore,
    confidence: finalConfidence,
    assessmentSummary: finalSummary,
    disclaimer: 'Risk score is an automated assessment based on detected indicators. Automated evaluations should not replace professional cybersecurity or financial counsel.',
    signals: finalSignals,
    annotations,
    evidence,
    verification,
    emailDetails: request.emailFields ? {
      from: request.emailFields.from,
      subject: request.emailFields.subject,
      senderDomain: request.emailFields.from ? request.emailFields.from.split('@')[1] : undefined
    } : undefined,
    meta: {
      analysisDepth: request.depth || 'standard',
      processingTimeMs,
      engineVersion: aiEngineUsed ? `3.0.0-${aiModel}` : '2.5.0-heuristic-core'
    }
  };

  return result;
}

export async function extractTextFromImage(
  imageBuffer: Buffer,
  mimeType: string,
  customApiKey?: string
): Promise<string> {
  const base64 = imageBuffer.toString('base64');
  return runGeminiOCR(base64, mimeType, customApiKey);
}
