import { EvidenceSection, ThreatSignal, UrlBreakdown } from '../types/analysis.js';
import { ParsedInput } from './input-parser.js';

export function compileEvidence(
  parsed: ParsedInput,
  signals: ThreatSignal[],
  primaryUrlBreakdown?: UrlBreakdown | null
): EvidenceSection {
  // 1. Local Heuristic Analysis Items
  const localAnalysisItems = [
    {
      label: 'Linguistic Heuristics',
      value: signals.length > 0 ? `${signals.length} behavioral pattern(s) triggered` : 'Clean / no high-risk trigger phrases',
      detail: signals.map(s => s.name).join(', ') || 'No anomalous language markers'
    },
    {
      label: 'Input Shannon Entropy',
      value: `${parsed.entropyScore} bits/char`,
      detail: parsed.entropyScore > 4.5 ? 'Elevated information density / possible encoded parameters' : 'Normal natural-language distribution'
    },
    {
      label: 'Embedded Hyperlinks',
      value: `${parsed.urls.length} link(s) detected`,
      detail: parsed.urls.length > 0 ? parsed.urls.join(', ') : 'No external URLs extracted'
    },
    {
      label: 'Currency & Payment Extraction',
      value: parsed.currencyMentions.length > 0 ? parsed.currencyMentions.join(', ') : 'None detected',
      detail: parsed.currencyMentions.length > 0 ? 'Specific financial amount requested' : 'No explicit payment tokens found'
    },
    {
      label: 'Encoding Obfuscation',
      value: parsed.hasObfuscatedChars ? 'Positive (Zero-width chars found)' : 'Negative (Clean ASCII/Unicode)',
      detail: parsed.hasObfuscatedChars ? 'Hidden Unicode markers detected in raw text stream' : 'No invisible character manipulation'
    }
  ];

  // 2. External Sources Status (Truthful, non-fabricated)
  const externalStatus = {
    available: false,
    status: 'No external reputation API configured. Assessment is based entirely on deterministic local heuristic signals and structural URL inspection.',
    disclaimer: 'ScamShield AI never fabricates or simulates external threat intelligence. Real-time WHOIS/reputation queries require active external API keys.',
    sources: [
      {
        name: 'VirusTotal Public API',
        status: 'Unconfigured / Offline',
        note: 'Requires VIRUSTOTAL_API_KEY environment variable. External check skipped to prevent unauthenticated timeouts.'
      },
      {
        name: 'Google Safe Browsing v4',
        status: 'Unconfigured / Offline',
        note: 'Requires GOOGLE_SAFE_BROWSING_KEY environment variable. Local heuristic rules applied in lieu of remote check.'
      },
      {
        name: 'Autonomous Heuristic Engine v2.4',
        status: 'Active (In-Memory Engine)',
        note: 'Local offline rule evaluator executing regex parsing, structural URL dissection, and behavioral scoring.'
      }
    ]
  };

  // 3. User Content Metadata
  const userContentMetadata = {
    characterCount: parsed.characterCount,
    tokenEstimate: parsed.tokenEstimate,
    detectedLanguage: parsed.detectedLanguage.toUpperCase(),
    extractedUrlCount: parsed.urls.length,
    entropyScore: parsed.entropyScore
  };

  return {
    localAnalysis: localAnalysisItems,
    domainInformation: primaryUrlBreakdown || null,
    externalSources: externalStatus,
    userContentMetadata
  };
}
