import { RiskLevel, ConfidenceLevel, ThreatSignal } from '../types/analysis.js';
import { ParsedInput } from './input-parser.js';

export interface RiskEvaluation {
  riskScore: number;
  riskLevel: RiskLevel;
  confidence: ConfidenceLevel;
  assessmentSummary: string;
}

export function calculateRisk(
  signals: ThreatSignal[],
  parsed: ParsedInput,
  hasUrl: boolean
): RiskEvaluation {
  let score = 0;

  // Tally weighted signals
  for (const signal of signals) {
    switch (signal.severity) {
      case 'CRITICAL':
        score += 35;
        break;
      case 'HIGH':
        score += 20;
        break;
      case 'MEDIUM':
        score += 10;
        break;
      case 'LOW':
        score += 5;
        break;
    }
  }

  // Compound social-engineering risk combinations
  const hasUrgency = signals.some(s => s.category === 'urgency');
  const hasCredential = signals.some(s => s.category === 'credential_harvesting');
  const hasSuspiciousUrl = signals.some(s => s.category === 'suspicious_url' || s.id === 'SIG-URL-BRAND-MIMIC');
  const hasFinancial = signals.some(s => s.category === 'financial_demand');
  const hasRemoteAccess = signals.some(s => s.id === 'SIG-MAL-01');
  const hasFear = signals.some(s => s.category === 'fear_tactics');

  if (hasUrgency && hasCredential) {
    score += 15;
  }
  if (hasUrgency && hasSuspiciousUrl) {
    score += 15;
  }
  if (hasUrgency && hasFinancial) {
    score += 12;
  }
  if (hasRemoteAccess) {
    score = Math.max(score, 88);
  }
  if (hasFear && (hasFinancial || hasCredential)) {
    score += 14;
  }
  if (hasFear && signals.some(s => s.id === 'SIG-UTIL-01' || s.id === 'SIG-PARCEL-01')) {
    score = Math.max(score, 72);
  }
  if (signals.some(s => s.id === 'SIG-UPI-01' || s.id === 'SIG-KYC-01')) {
    score = Math.max(score, 68);
  }

  // Obfuscation penalty
  if (parsed.hasObfuscatedChars) {
    score += 10;
  }

  // Entropy evaluation
  if (parsed.entropyScore > 4.6 && parsed.characterCount > 80) {
    score += 5;
  }

  // Minimum baseline for clean content
  if (signals.length === 0) {
    score = 6;
  }

  // Normalize: Never output 100/100 to adhere to security standard that automated tools are not infallible
  score = Math.min(Math.max(score, 4), 96);

  // Calibrate risk level
  let riskLevel: RiskLevel = 'NEGLIGIBLE';
  if (score >= 88) riskLevel = 'CRITICAL';
  else if (score >= 70) riskLevel = 'HIGH';
  else if (score >= 50) riskLevel = 'ELEVATED';
  else if (score >= 30) riskLevel = 'MEDIUM';
  else if (score >= 15) riskLevel = 'LOW';
  else riskLevel = 'NEGLIGIBLE';

  // Determine Confidence
  let confidence: ConfidenceLevel = 'Medium';
  if (parsed.characterCount < 15 && !hasUrl) {
    confidence = 'Low';
  } else if (signals.length >= 2 || (hasUrl && signals.length >= 1)) {
    confidence = 'High';
  }

  // Assessment summary statement
  let assessmentSummary = '';
  switch (riskLevel) {
    case 'CRITICAL':
    case 'HIGH':
      assessmentSummary = 'High-risk indicators detected across communication channels. Coercive or deceptive social-engineering patterns are strongly present.';
      break;
    case 'ELEVATED':
      assessmentSummary = 'Elevated risk indicators detected. Content displays multiple characteristics typical of fraudulent or deceptive solicitations.';
      break;
    case 'MEDIUM':
      assessmentSummary = 'Moderate risk indicators observed. Caution is recommended before clicking links or executing requested instructions.';
      break;
    case 'LOW':
      assessmentSummary = 'Low risk indicators detected. The content does not exhibit overt social engineering manipulation, but standard verification applies.';
      break;
    case 'NEGLIGIBLE':
      assessmentSummary = 'Minimal risk signals detected in current input. No deceptive patterns or malicious heuristics were identified.';
      break;
  }

  return {
    riskScore: score,
    riskLevel,
    confidence,
    assessmentSummary
  };
}
