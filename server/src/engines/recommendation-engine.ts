import { SafeVerification } from '../types/analysis.js';
import { ThreatSignal, UrlBreakdown } from '../types/analysis.js';
import { ParsedInput } from './input-parser.js';

interface BrandProfile {
  name: string;
  officialDomain: string;
  officialSupportUrl: string;
  patterns: RegExp[];
}

const BRAND_PROFILES: BrandProfile[] = [
  {
    name: 'PayPal',
    officialDomain: 'paypal.com',
    officialSupportUrl: 'https://www.paypal.com/smarthelp/contact-us',
    patterns: [/\bpaypal\b/i]
  },
  {
    name: 'Chase Bank',
    officialDomain: 'chase.com',
    officialSupportUrl: 'https://www.chase.com/digital/customer-service',
    patterns: [/\bchase(?:\s+bank)?\b/i]
  },
  {
    name: 'USPS',
    officialDomain: 'usps.com',
    officialSupportUrl: 'https://www.usps.com/help/contact-us.htm',
    patterns: [/\busps\b|united\s+states\s+postal\s+service/i]
  },
  {
    name: 'DHL Express',
    officialDomain: 'dhl.com',
    officialSupportUrl: 'https://www.dhl.com/contact',
    patterns: [/\bdhl(?:\s+express)?\b/i]
  },
  {
    name: 'Microsoft',
    officialDomain: 'microsoft.com',
    officialSupportUrl: 'https://support.microsoft.com',
    patterns: [/\bmicrosoft\b|office\s*365|outlook\.com/i]
  },
  {
    name: 'Apple',
    officialDomain: 'apple.com',
    officialSupportUrl: 'https://support.apple.com',
    patterns: [/\bapple\b|icloud|apple\s+id/i]
  },
  {
    name: 'Amazon',
    officialDomain: 'amazon.com',
    officialSupportUrl: 'https://www.amazon.com/gp/help/customer/display.html',
    patterns: [/\bamazon(?:\s+prime)?\b/i]
  },
  {
    name: 'Netflix',
    officialDomain: 'netflix.com',
    officialSupportUrl: 'https://help.netflix.com',
    patterns: [/\bnetflix\b/i]
  },
  {
    name: 'Wells Fargo',
    officialDomain: 'wellsfargo.com',
    officialSupportUrl: 'https://www.wellsfargo.com/help/',
    patterns: [/\bwells\s+fargo\b/i]
  },
  {
    name: 'Bank of America',
    officialDomain: 'bankofamerica.com',
    officialSupportUrl: 'https://www.bankofamerica.com/contactus/',
    patterns: [/\bbank\s+of\s+america\b|\bbofa\b/i]
  }
];

export function generateRecommendations(
  parsed: ParsedInput,
  signals: ThreatSignal[],
  urlBreakdowns: UrlBreakdown[]
): SafeVerification {
  // Detect if any known brand is claimed in the message or URL
  let detectedBrand: BrandProfile | null = null;
  const fullText = parsed.normalizedText;

  for (const brand of BRAND_PROFILES) {
    const textMatch = brand.patterns.some(p => p.test(fullText));
    const urlMatch = urlBreakdowns.some(u => brand.patterns.some(p => p.test(u.hostname)));
    if (textMatch || urlMatch) {
      detectedBrand = brand;
      break;
    }
  }

  // Base Verification Guidance
  const steps: string[] = [
    'Do not use any link or button contained within the message or email.',
    'Open your browser manually and navigate directly to the organization\'s official verified web portal.',
    'Verify account status directly within the official mobile app or desktop portal.',
    'Contact customer support using published official phone numbers or help centers, not contact numbers provided in the message.',
    'Never provide passwords, 2FA tokens, SMS codes, or one-time passcodes to anyone over the phone, email, or chat.'
  ];

  if (signals.some(s => s.category === 'financial_demand')) {
    steps.push('Do not transfer funds, wire money, or purchase gift cards. Legitimate institutions do not demand emergency non-traceable payments.');
  }

  if (signals.some(s => s.id === 'SIG-MAL-01')) {
    steps.push('Never download or authorize remote desktop utilities (e.g. AnyDesk, TeamViewer) at the request of an unverified caller or message.');
  }

  // Claimed Organization assessment
  let claimedOrg = null;
  if (detectedBrand) {
    claimedOrg = {
      name: detectedBrand.name,
      isDetected: true,
      confidence: 'Medium' as const,
      guidance: `The content references ${detectedBrand.name}. Remember that SMS sender IDs and email headers are trivially forged.`,
      officialVerificationRule: `To check legitimate notifications from ${detectedBrand.name}, visit https://${detectedBrand.officialDomain} directly or check their official mobile application.`
    };
  }

  // What NOT to do checklist
  const doNotActions = [
    'Click links, buttons, or embedded attachments in the communication.',
    'Send money, wire transfers, cryptocurrency, or gift card codes.',
    'Disclose one-time passcodes (OTP), multi-factor tokens, or PIN numbers.',
    'Share passwords, recovery seed phrases, or security questions.',
    'Install software, browser extensions, or remote desktop applications.',
    'Continue dialogue or reply to the sender once suspicious indicators appear.'
  ];

  return {
    steps,
    claimedOrganization: claimedOrg,
    doNotActions
  };
}
