export type InputType = 'message' | 'url' | 'screenshot' | 'email';

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'MEDIUM' | 'LOW' | 'NEGLIGIBLE';

export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

export type SignalSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type SignalCategory =
  | 'urgency'
  | 'credential_harvesting'
  | 'financial_demand'
  | 'impersonation'
  | 'suspicious_url'
  | 'authority_pressure'
  | 'fear_tactics'
  | 'unusual_sender'
  | 'malware_delivery'
  | 'obfuscation';

export interface ThreatSignal {
  id: string;
  name: string;
  severity: SignalSeverity;
  category: SignalCategory;
  explanation: string;
  matchedSnippets?: string[];
}

export interface FlaggedAnnotation {
  id: string;
  start: number;
  end: number;
  text: string;
  tag: string;
  reason: string;
  severity: SignalSeverity;
}

export interface UrlBreakdown {
  rawUrl: string;
  protocol: string;
  hostname: string;
  domain: string;
  subdomain?: string;
  tld: string;
  path: string;
  queryParamCount: number;
  isHttps: boolean;
  isIpHost: boolean;
  isShortener: boolean;
  isSuspiciousTld: boolean;
  isPunycode: boolean;
  hasSubdomainSquatting: boolean;
  impersonatedBrand?: string | null;
  deceptiveIndicators: string[];
}

export interface EvidenceSection {
  localAnalysis: {
    label: string;
    value: string;
    detail?: string;
  }[];
  domainInformation?: UrlBreakdown | null;
  externalSources: {
    available: boolean;
    status: string;
    disclaimer: string;
    sources: {
      name: string;
      status: string;
      note: string;
      link?: string;
    }[];
  };
  userContentMetadata: {
    characterCount: number;
    tokenEstimate: number;
    detectedLanguage: string;
    extractedUrlCount: number;
    entropyScore: number;
  };
}

export interface SafeVerification {
  steps: string[];
  claimedOrganization: {
    name: string;
    isDetected: boolean;
    confidence: 'High' | 'Medium' | 'Low';
    guidance: string;
    officialVerificationRule: string;
  } | null;
  doNotActions: string[];
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  inputType: InputType;
  rawInput: string;
  riskLevel: RiskLevel;
  riskScore: number;
  confidence: ConfidenceLevel;
  assessmentSummary: string;
  disclaimer: string;
  signals: ThreatSignal[];
  annotations: FlaggedAnnotation[];
  evidence: EvidenceSection;
  verification: SafeVerification;
  extractedText?: string;
  emailDetails?: {
    from?: string;
    subject?: string;
    senderDomain?: string;
    domainMatchVerdict?: string;
  };
  meta: {
    analysisDepth: 'standard' | 'deep';
    processingTimeMs: number;
    engineVersion: string;
  };
}

export interface DemoSample {
  id: string;
  title: string;
  type: InputType;
  category: string;
  expectedRisk: 'HIGH' | 'ELEVATED' | 'LOW' | 'NEGLIGIBLE';
  previewText: string;
  fullContent: string;
  emailFields?: {
    from: string;
    subject: string;
    body: string;
  };
  explanation: string;
  isDemoData: true;
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  inputType: InputType;
  riskLevel: RiskLevel;
  riskScore: number;
  preview: string;
  result: AnalysisResult;
}
