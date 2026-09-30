import { FlaggedAnnotation, SignalSeverity } from '../types/analysis.js';
import { ParsedInput } from './input-parser.js';
import { UrlBreakdown } from '../types/analysis.js';

interface AnnotationRule {
  tag: string;
  reason: string;
  severity: SignalSeverity;
  regex: RegExp;
}

const ANNOTATION_RULES: AnnotationRule[] = [
  {
    tag: 'Urgency',
    reason: 'Manufactured time constraint designed to induce panicked reaction',
    severity: 'HIGH',
    regex: /(?:within|in)\s+(?:24|12|48|2|1|30)\s*(?:hours|hrs|minutes|mins)|act\s+now|immediately|urgent(?:ly)?|final\s+notice|will\s+be\s+(?:permanently\s+)?(?:blocked|suspended|terminated|deleted|frozen)/gi
  },
  {
    tag: 'Credential prompt',
    reason: 'Solicitation of passwords, login tokens, or authentication secrets',
    severity: 'CRITICAL',
    regex: /(?:password|passcode|pin\s+code|security\s+code|cvv|one-time\s+passcode|otp|verification\s+code|2fa\s+token|seed\s+phrase|recovery\s+phrase|social\s+security\s+number|ssn)/gi
  },
  {
    tag: 'Financial request',
    reason: 'Direct solicitation of money, crypto, gift cards or unexpected fees',
    severity: 'HIGH',
    regex: /(?:send\s+(?:money|payment|funds|bitcoin|crypto|usdt)|gift\s+card|apple\s+gift\s+card|steam\s+card|wire\s+transfer|western\s+union|zelle|cash\s*app|delivery\s+fee|redelivery\s+charge|customs\s+clearance\s+fee|processing\s+fee|unpaid\s+toll)/gi
  },
  {
    tag: 'Remote access',
    reason: 'Request to install remote management software onto personal machine',
    severity: 'CRITICAL',
    regex: /(?:anydesk|teamviewer|quicksupport|ultraviewer|screenconnect|grant\s+remote\s+access|connect\s+to\s+your\s+(?:computer|desktop))/gi
  },
  {
    tag: 'Coercive threat',
    reason: 'Threat of arrest, police, or legal retribution',
    severity: 'HIGH',
    regex: /(?:arrest\s+warrant|police|fbi|irs|court\s+summons|law enforcement|legal\s+(?:action|proceedings)|lawsuit)/gi
  },
  {
    tag: 'Unrealistic return',
    reason: 'Promises of 100% guaranteed or risk-free financial profits',
    severity: 'HIGH',
    regex: /(?:100%\s+guaranteed|guaranteed\s+(?:profit|return)|risk-free\s+investment|crypto\s+trading\s+bot|passive\s+income\s+daily|you\s+have\s+won|lottery\s+winner)/gi
  },
  {
    tag: 'Impersonated entity',
    reason: 'Claimed enterprise identity frequently spoofed in phishing operations',
    severity: 'MEDIUM',
    regex: /(?:paypal|chase|wellsfargo|bank\s+of\s+america|usps|fedex|dhl|ups|microsoft|apple\s+support|google\s+security|netflix|amazon)/gi
  }
];

export function extractAnnotations(
  text: string,
  _parsed: ParsedInput,
  urlBreakdowns: UrlBreakdown[]
): FlaggedAnnotation[] {
  if (!text) return [];

  const annotations: FlaggedAnnotation[] = [];
  let idCounter = 1;

  // 1. Text Pattern Annotations
  for (const rule of ANNOTATION_RULES) {
    const rx = new RegExp(rule.regex.source, rule.regex.flags);
    let match: RegExpExecArray | null;
    while ((match = rx.exec(text)) !== null) {
      const matchText = match[0];
      const start = match.index;
      const end = start + matchText.length;

      // Avoid duplicate or overlapping highlights of same tag
      const existing = annotations.find(a =>
        (start >= a.start && start < a.end) || (end > a.start && end <= a.end)
      );

      if (!existing) {
        annotations.push({
          id: `ann-${idCounter++}`,
          start,
          end,
          text: matchText,
          tag: rule.tag,
          reason: rule.reason,
          severity: rule.severity
        });
      }
    }
  }

  // 2. URL Annotations
  for (const urlInfo of urlBreakdowns) {
    const raw = urlInfo.rawUrl;
    let searchPos = 0;
    while (searchPos < text.length) {
      const idx = text.indexOf(raw, searchPos);
      if (idx === -1) break;

      const end = idx + raw.length;
      let tag = 'External link';
      let reason = 'Embedded hyperlink directing outside current context';
      let severity: SignalSeverity = 'LOW';

      if (urlInfo.impersonatedBrand) {
        tag = 'Spoofed link';
        reason = `Lookalike URL mimicking ${urlInfo.impersonatedBrand}`;
        severity = 'CRITICAL';
      } else if (urlInfo.isShortener) {
        tag = 'Obfuscated link';
        reason = 'Shortened link obscuring the real web destination';
        severity = 'HIGH';
      } else if (urlInfo.isSuspiciousTld || urlInfo.isIpHost) {
        tag = 'Suspicious URL';
        reason = urlInfo.isIpHost ? 'Direct IP address destination' : `High-abuse TLD (.${urlInfo.tld})`;
        severity = 'HIGH';
      }

      // Check if not already added
      if (!annotations.some(a => a.start === idx && a.end === end)) {
        annotations.push({
          id: `ann-${idCounter++}`,
          start: idx,
          end,
          text: raw,
          tag,
          reason,
          severity
        });
      }
      searchPos = end;
    }
  }

  // Sort annotations chronologically by start position
  return annotations.sort((a, b) => a.start - b.start);
}
