import { ThreatSignal, SignalSeverity, SignalCategory } from '../types/analysis.js';
import { ParsedInput } from './input-parser.js';
import { UrlBreakdown } from '../types/analysis.js';

interface SignalRule {
  id: string;
  name: string;
  category: SignalCategory;
  severity: SignalSeverity;
  patterns: RegExp[];
  explanation: string;
}

const SIGNAL_RULES: SignalRule[] = [
  // 1. Urgency Manipulation
  {
    id: 'SIG-URG-01',
    name: 'Urgency manipulation',
    category: 'urgency',
    severity: 'HIGH',
    patterns: [
      /\b(?:within|in)\s+(?:24|12|48|2|1|30)\s*(?:hours|hrs|minutes|mins)\b/i,
      /\b(?:act\s+now|immediate(?:ly)?|urgent(?:ly)?|without\s+delay|limited\s+time)\b/i,
      /\b(?:final\s+notice|last\s+chance|expires\s+today|time-sensitive)\b/i,
      /\b(?:will\s+be\s+(?:permanently\s+)?(?:blocked|suspended|terminated|deleted|frozen))\b/i,
      /\b(?:avoid\s+suspension|avoid\s+service\s+interruption)\b/i
    ],
    explanation: 'The message creates artificial pressure to act immediately, an established tactic to impair deliberate judgment.'
  },

  // 2. Credential Harvesting
  {
    id: 'SIG-CRED-01',
    name: 'Credential or secret solicitation',
    category: 'credential_harvesting',
    severity: 'CRITICAL',
    patterns: [
      /\b(?:password|passcode|pin\s+code|security\s+code|cvv|security\s+questions?)\b/i,
      /\b(?:one-time\s+passcode|otp|verification\s+code|2fa\s+token)\b/i,
      /\b(?:seed\s+phrase|recovery\s+phrase|private\s+key|wallet\s+phrase)\b/i,
      /\b(?:social\s+security\s+number|ssn|id\s+card|national\s+id)\b/i,
      /\b(?:confirm\s+your\s+identity|verify\s+your\s+(?:credentials|login|account))\b/i
    ],
    explanation: 'The content directly or indirectly prompts for sensitive credentials, OTPs, or authentication secrets.'
  },

  // 3. Financial Request / Payment Demands
  {
    id: 'SIG-FIN-01',
    name: 'Unverified payment or fund transfer request',
    category: 'financial_demand',
    severity: 'HIGH',
    patterns: [
      /\b(?:send\s+(?:money|payment|funds|bitcoin|crypto|usdt))\b/i,
      /\b(?:gift\s+card|apple\s+gift\s+card|steam\s+card|google\s+play\s+card|razer\s+gold)\b/i,
      /\b(?:wire\s+transfer|western\s+union|moneygram|zelle|cash\s*app|venmo)\b/i,
      /\b(?:delivery\s+fee|redelivery\s+charge|customs\s+clearance\s+fee|processing\s+fee)\b/i,
      /\b(?:unpaid\s+toll|overdue\s+invoice|outstanding\s+fine)\b/i
    ],
    explanation: 'The sender requests an immediate financial transfer, fee payment, or alternative payment method (gift cards/crypto).'
  },

  // 4. Remote Access Demand
  {
    id: 'SIG-MAL-01',
    name: 'Remote access software solicitation',
    category: 'malware_delivery',
    severity: 'CRITICAL',
    patterns: [
      /\b(?:anydesk|teamviewer|quicksupport|ultraviewer|screenconnect|zoho\s+assist|logmein)\b/i,
      /\b(?:connect\s+to\s+your\s+(?:computer|desktop|phone)|grant\s+remote\s+access)\b/i,
      /\b(?:install\s+(?:the\s+following|this)\s+(?:software|app|tool|extension))\b/i
    ],
    explanation: 'The sender requests remote desktop software installation, a definitive hallmark of technical support extortion fraud.'
  },

  // 5. Fear & Coercion Tactics
  {
    id: 'SIG-FEAR-01',
    name: 'Coercive / punitive threat intimidation',
    category: 'fear_tactics',
    severity: 'HIGH',
    patterns: [
      /\b(?:arrest\s+warrant|police|fbi|irs|court\s+summons|law enforcement)\b/i,
      /\b(?:legal\s+(?:action|proceedings)|lawsuit|prosecution)\b/i,
      /\b(?:compromised|hacked|illicit\s+activity|penalty|fine\s+of)\b/i
    ],
    explanation: 'The communication invokes legal prosecution or punitive authority to intimidate the recipient into compliance.'
  },

  // 6. Unrealistic Financial Gains / Investment Fraud
  {
    id: 'SIG-OFFER-01',
    name: 'Guaranteed return / advance-fee investment lure',
    category: 'financial_demand',
    severity: 'HIGH',
    patterns: [
      /\b(?:100%\s+guaranteed|guaranteed\s+(?:profit|return)|risk-free\s+investment)\b/i,
      /\b(?:crypto\s+trading\s+bot|passive\s+income\s+daily|earn\s+\$[\d,]+\s+per\s+day)\b/i,
      /\b(?:you\s+have\s+won|lottery\s+winner|inheritance|unclaimed\s+funds)\b/i
    ],
    explanation: 'Promises excessive, guaranteed financial returns without risk, typical of cryptocurrency and advance-fee schemes.'
  },

  // 7. Impersonation Indicators
  {
    id: 'SIG-IMP-01',
    name: 'Institutional identity claim',
    category: 'impersonation',
    severity: 'MEDIUM',
    patterns: [
      /\b(?:paypal|chase|wellsfargo|bank\s+of\s+america|citibank|barclays|hsbc|santander)\b/i,
      /\b(?:sbi|hdfc|icici|axis\s+bank|kotak|pnb|canara\s+bank|bank\s+of\s+baroda)\b/i,
      /\b(?:usps|fedex|dhl|ups|royal\s+mail|canada\s+post|australia\s+post|blue\s*dart|delhivery)\b/i,
      /\b(?:microsoft|apple\s+support|google\s+security|netflix|amazon|meta|facebook)\b/i
    ],
    explanation: 'The message asserts the identity of a major financial, logistical, or technology brand often targeted for spoofing.'
  },

  // 8. Banking KYC / PAN / Aadhaar / Account Suspension
  {
    id: 'SIG-KYC-01',
    name: 'Mandatory KYC / PAN / Identity document update lure',
    category: 'credential_harvesting',
    severity: 'CRITICAL',
    patterns: [
      /\b(?:update\s+your\s+kyc|kyc\s+(?:suspended|expired|pending|verification|incomplete))\b/i,
      /\b(?:pan\s+card\s+link|link\s+your\s+pan|aadhaar\s+card\s+link|link\s+aadhaar)\b/i,
      /\b(?:account\s+will\s+be\s+(?:blocked|dormant|deactivated)\s+(?:today|tonight|within))\b/i,
      /\b(?:click\s+here\s+to\s+update\s+kyc|verify\s+kyc\s+now)\b/i,
      /\b(?:sim\s+card\s+block|sim\s+kyc|esim\s+upgrade)\b/i
    ],
    explanation: 'Requests immediate submission or updating of official identity credentials (KYC, PAN, national ID) under threat of service termination.'
  },

  // 9. Electricity / Utility Shutoff Threat
  {
    id: 'SIG-UTIL-01',
    name: 'Utility disconnection / Power shutoff extortion',
    category: 'fear_tactics',
    severity: 'CRITICAL',
    patterns: [
      /\b(?:electricity\s+power\s+will\s+be\s+disconnect(?:ed)?)\b/i,
      /\b(?:power\s+cut\s+(?:tonight|today|at\s+\d{1,2}(?::\d{2})?\s*(?:pm|am)))\b/i,
      /\b(?:previous\s+month\s+bill\s+was\s+not\s+updated)\b/i,
      /\b(?:call\s+our\s+electricity\s+officer|contact\s+power\s+officer)\b/i,
      /\b(?:water\s+supply\s+will\s+be\s+disconnect(?:ed)?)\b/i
    ],
    explanation: 'Classic utility scam: impersonates electricity or municipal board threatening immediate power disconnection unless an unverified contact is reached.'
  },

  // 10. Courier Seizure / Digital Arrest / Narcotics Threat
  {
    id: 'SIG-PARCEL-01',
    name: 'Courier contraband / Customs seizure / Digital arrest threat',
    category: 'fear_tactics',
    severity: 'CRITICAL',
    patterns: [
      /\b(?:parcel\s+(?:seized|detained|intercepted|confiscated))\b/i,
      /\b(?:illegal\s+(?:drugs|narcotics|passports|contraband)\s+found)\b/i,
      /\b(?:cbi|customs\s+department|narcotics\s+control|cyber\s+crime\s+branch)\b/i,
      /\b(?:digital\s+arrest|online\s+investigation|video\s+call\s+interrogation)\b/i,
      /\b(?:package\s+addressed\s+to\s+taiwan|parcel\s+sent\s+to\s+(?:abroad|overseas))\b/i
    ],
    explanation: 'High-severity extortion attack: claims a parcel in your name was seized with illegal contraband, threatening immediate arrest unless compliance is given.'
  },

  // 11. Work-from-Home / Telegram Task / Video Like Scam
  {
    id: 'SIG-TASK-01',
    name: 'Prepaid task / Video rating / Freelance investment trap',
    category: 'financial_demand',
    severity: 'HIGH',
    patterns: [
      /\b(?:part[\s-]time\s+job|work\s+from\s+home\s+job|daily\s+earning\s+of)\b/i,
      /\b(?:like\s+youtube\s+videos?\s+(?:and\s+earn|for\s+money))\b/i,
      /\b(?:rate\s+google\s+maps?\s+reviews?|hotel\s+rating\s+task)\b/i,
      /\b(?:join\s+(?:our\s+)?telegram\s+(?:channel|group)\s+to\s+earn)\b/i,
      /\b(?:prepaid\s+task|vip\s+task|recharge\s+to\s+withdraw\s+commission)\b/i
    ],
    explanation: 'Task/brushing scam: lures targets with easy freelance tasks (liking videos, reviewing hotels) before demanding deposits to unlock purported earnings.'
  },

  // 12. UPI PIN / QR Code Reversal Fraud
  {
    id: 'SIG-UPI-01',
    name: 'QR code payment trick / UPI PIN harvesting',
    category: 'financial_demand',
    severity: 'CRITICAL',
    patterns: [
      /\b(?:scan\s+(?:this\s+)?(?:qr|barcode)(?:\s+code)?\s+to\s+receive)\b/i,
      /\b(?:enter\s+(?:your\s+)?(?:upi\s+)?pin\s+to\s+(?:receive|claim|accept))\b/i,
      /\b(?:phonepe|google\s*pay|gpay|paytm)\s*(?:request|cashback|scratch\s*card|account)\b/i,
      /\b(?:credited\s+by\s+mistake|sent\s+money\s+by\s+mistake\s*,\s*please\s+return)\b/i
    ],
    explanation: 'Fraudulent payment logic: QR codes and UPI PINs are only required to DEBIT/SEND money, never to receive money or refunds.'
  },

  // 13. Malware / APK File Delivery
  {
    id: 'SIG-APK-01',
    name: 'Malicious Android APK / Executable sideloading lure',
    category: 'malware_delivery',
    severity: 'CRITICAL',
    patterns: [
      /\b(?:\.apk|\.exe|\.scr|\.bat|\.vbs|\.iso|\.dmg)\b/i,
      /\b(?:download\s+(?:this\s+)?app|install\s+(?:this\s+)?apk|update\s+app\s+manually)\b/i,
      /\b(?:sideload|enable\s+install\s+from\s+unknown\s+sources)\b/i,
      /\b(?:support\.apk|reward\.apk|update\.apk|security\.apk|banking\.apk)\b/i
    ],
    explanation: 'Sideloading vector: instructs recipient to install an APK or executable outside official app stores, a primary method for mobile banking trojans.'
  }
];

export function detectThreatSignals(
  parsed: ParsedInput,
  urlBreakdowns: UrlBreakdown[],
  emailDetails?: { from?: string; subject?: string }
): ThreatSignal[] {
  const detected: ThreatSignal[] = [];
  const text = parsed.normalizedText;

  // 1. Text Heuristic Rules
  for (const rule of SIGNAL_RULES) {
    const matchedSnippets: string[] = [];
    for (const pattern of rule.patterns) {
      const match = text.match(pattern);
      if (match) {
        matchedSnippets.push(match[0]);
      }
    }

    if (matchedSnippets.length > 0) {
      detected.push({
        id: rule.id,
        name: rule.name,
        category: rule.category,
        severity: rule.severity,
        explanation: rule.explanation,
        matchedSnippets: Array.from(new Set(matchedSnippets))
      });
    }
  }

  // 2. URL-based Threat Signals
  for (const urlInfo of urlBreakdowns) {
    if (urlInfo.isShortener) {
      detected.push({
        id: 'SIG-URL-SHORT',
        name: 'URL shortener obscuring destination',
        category: 'suspicious_url',
        severity: 'MEDIUM',
        explanation: `Destination URL (${urlInfo.domain}) employs a shortener that conceals the ultimate target host.`,
        matchedSnippets: [urlInfo.rawUrl]
      });
    }

    if (urlInfo.impersonatedBrand) {
      detected.push({
        id: 'SIG-URL-BRAND-MIMIC',
        name: 'Domain brand impersonation / typosquatting',
        category: 'impersonation',
        severity: 'CRITICAL',
        explanation: `Domain '${urlInfo.domain}' mimics legitimate brand '${urlInfo.impersonatedBrand}' but is not an official domain.`,
        matchedSnippets: [urlInfo.hostname]
      });
    }

    if (urlInfo.isIpHost) {
      detected.push({
        id: 'SIG-URL-IP',
        name: 'Direct numerical IP address in URL',
        category: 'suspicious_url',
        severity: 'HIGH',
        explanation: `Link points to raw IP (${urlInfo.hostname}) rather than a registered, verifiable domain name.`,
        matchedSnippets: [urlInfo.rawUrl]
      });
    }

    if (urlInfo.isSuspiciousTld) {
      detected.push({
        id: 'SIG-URL-TLD',
        name: 'High-abuse top-level domain extension',
        category: 'suspicious_url',
        severity: 'MEDIUM',
        explanation: `Domain utilizes '.${urlInfo.tld}', a TLD with statistically elevated rates of abuse and disposable phishing.`,
        matchedSnippets: [urlInfo.domain]
      });
    }

    if (urlInfo.isPunycode) {
      detected.push({
        id: 'SIG-URL-PUNY',
        name: 'Internationalized / Punycode domain spoofing',
        category: 'obfuscation',
        severity: 'HIGH',
        explanation: 'Host utilizes Punycode encoding, a known vector for homoglyph visual spoofing attacks.',
        matchedSnippets: [urlInfo.hostname]
      });
    }
  }

  // 3. Sender Header / Webmail Mismatch
  if (emailDetails?.from) {
    const fromStr = emailDetails.from.toLowerCase();
    const hasOrgClaim = /(?:paypal|chase|apple|microsoft|amazon|usps|dhl|fedex|netflix)/i.test(fromStr);
    const isFreeMail = /(?:gmail\.com|yahoo\.com|hotmail\.com|outlook\.com|aol\.com|proton\.me|mail\.ru)/i.test(fromStr);

    if (hasOrgClaim && isFreeMail) {
      detected.push({
        id: 'SIG-SND-FREE',
        name: 'Official brand claim from free webmail provider',
        category: 'unusual_sender',
        severity: 'HIGH',
        explanation: `Sender header claims to represent an enterprise organization but originates from a free consumer address (${emailDetails.from}).`,
        matchedSnippets: [emailDetails.from]
      });
    }
  }

  // 4. Zero-Width Obfuscation Signal
  if (parsed.hasObfuscatedChars) {
    detected.push({
      id: 'SIG-OBF-ZERO',
      name: 'Invisible character text obfuscation',
      category: 'obfuscation',
      severity: 'HIGH',
      explanation: 'Input contains zero-width spaces or non-printable glyphs, commonly injected to evade automated spam filters.',
    });
  }

  return detected;
}
