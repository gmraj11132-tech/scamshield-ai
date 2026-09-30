import { UrlBreakdown } from '../types/analysis.js';

// Suspicious/Abused TLDs commonly leveraged in bulk phishing/smishing campaigns
const SUSPICIOUS_TLDS = new Set([
  'xyz', 'top', 'click', 'buzz', 'cfd', 'tk', 'ml', 'ga', 'cf', 'gq',
  'icu', 'loan', 'work', 'rest', 'sbs', 'quest', 'fit', 'hair', 'monster',
  'cam', 'racing', 'download', 'stream', 'party', 'gdn', 'date'
]);

// Common URL shortening domains that obscure actual destination
const URL_SHORTENERS = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'is.gd', 'cutt.ly', 'ow.ly',
  'rb.gy', 'buff.ly', 'shorturl.at', 'rebrand.ly', 'bl.ink', 'v.gd', 'bc.vc'
]);

// Known high-target brands for credential harvesting & phishing
const TARGET_BRANDS = [
  { name: 'PayPal', pattern: /paypa[l1i]/i, canonical: 'paypal.com' },
  { name: 'Apple', pattern: /app[l1i]e|icloud/i, canonical: 'apple.com' },
  { name: 'Microsoft', pattern: /micros[o0]ft|office365|outlook/i, canonical: 'microsoft.com' },
  { name: 'Amazon', pattern: /amaz[o0]n|aws/i, canonical: 'amazon.com' },
  { name: 'Google', pattern: /g[o0]{2}g[l1i]e|gmail/i, canonical: 'google.com' },
  { name: 'Chase Bank', pattern: /chase(?:bank)?/i, canonical: 'chase.com' },
  { name: 'Bank of America', pattern: /bankofamerica|bofa/i, canonical: 'bankofamerica.com' },
  { name: 'Wells Fargo', pattern: /wellsfargo/i, canonical: 'wellsfargo.com' },
  { name: 'USPS', pattern: /usps(?:track)?/i, canonical: 'usps.com' },
  { name: 'DHL', pattern: /dhl(?:express)?/i, canonical: 'dhl.com' },
  { name: 'FedEx', pattern: /fedex/i, canonical: 'fedex.com' },
  { name: 'UPS', pattern: /ups(?:parcel)?/i, canonical: 'ups.com' },
  { name: 'Netflix', pattern: /netf[l1i]ix/i, canonical: 'netflix.com' },
  { name: 'Meta / Facebook', pattern: /faceb[o0]{2}k|meta-auth/i, canonical: 'facebook.com' },
  { name: 'Binance', pattern: /b[i1]nance/i, canonical: 'binance.com' },
  { name: 'Coinbase', pattern: /c[o0]inbase/i, canonical: 'coinbase.com' },
];

export function analyzeUrl(rawUrlString: string): UrlBreakdown {
  let normalized = rawUrlString.trim();
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = 'https://' + normalized;
  }

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    // If URL constructor fails, return fallback breakdown
    return {
      rawUrl: rawUrlString,
      protocol: 'unknown',
      hostname: rawUrlString,
      domain: rawUrlString,
      tld: 'unknown',
      path: '',
      queryParamCount: 0,
      isHttps: false,
      isIpHost: false,
      isShortener: false,
      isSuspiciousTld: false,
      isPunycode: false,
      hasSubdomainSquatting: false,
      deceptiveIndicators: ['Malformed or invalid URL syntax']
    };
  }

  const protocol = parsed.protocol.replace(':', '');
  const isHttps = protocol === 'https';
  const hostname = parsed.hostname.toLowerCase();
  const path = parsed.pathname;
  const queryParamCount = Array.from(parsed.searchParams.keys()).length;

  // Check if hostname is an IPv4 or IPv6 address
  const isIpHost = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.startsWith('[') && hostname.endsWith(']');

  // Punycode detection (IDN homoglyph attacks)
  const isPunycode = hostname.includes('xn--');

  // Decompose host into subdomain, domain, and TLD
  const parts = hostname.split('.');
  let tld = '';
  let domain = hostname;
  let subdomain = '';

  if (!isIpHost && parts.length >= 2) {
    tld = parts[parts.length - 1];
    // Handle two-part TLDs like .co.uk, .com.au
    if (parts.length >= 3 && ['co', 'com', 'org', 'net', 'edu', 'gov'].includes(parts[parts.length - 2])) {
      tld = `${parts[parts.length - 2]}.${tld}`;
      domain = `${parts[parts.length - 3]}.${tld}`;
      subdomain = parts.slice(0, parts.length - 3).join('.');
    } else {
      domain = `${parts[parts.length - 2]}.${tld}`;
      subdomain = parts.slice(0, parts.length - 2).join('.');
    }
  }

  const isShortener = URL_SHORTENERS.has(domain) || URL_SHORTENERS.has(hostname);
  const isSuspiciousTld = SUSPICIOUS_TLDS.has(tld.toLowerCase());

  const deceptiveIndicators: string[] = [];

  if (!isHttps) {
    deceptiveIndicators.push('Insecure connection (Plain HTTP without TLS encryption)');
  }
  if (isIpHost) {
    deceptiveIndicators.push('Direct IP address used instead of legitimate domain name');
  }
  if (isShortener) {
    deceptiveIndicators.push('URL shortening service masks true destination target');
  }
  if (isSuspiciousTld) {
    deceptiveIndicators.push(`High-abuse top-level domain (.${tld}) frequently used in disposable fraud domains`);
  }
  if (isPunycode) {
    deceptiveIndicators.push('Punycode (xn--) detected; possible internationalized homoglyph spoofing');
  }

  // Detect brand impersonation / typosquatting in domain or subdomain
  let impersonatedBrand: string | null = null;
  let hasSubdomainSquatting = false;

  for (const brand of TARGET_BRANDS) {
    if (brand.pattern.test(hostname)) {
      if (domain !== brand.canonical) {
        impersonatedBrand = brand.name;
        if (subdomain && brand.pattern.test(subdomain)) {
          hasSubdomainSquatting = true;
          deceptiveIndicators.push(`Brand '${brand.name}' appears inside subdomain (${subdomain}) but root domain is '${domain}'`);
        } else {
          deceptiveIndicators.push(`Domain mimics brand '${brand.name}' (${domain} vs official ${brand.canonical})`);
        }
        break;
      }
    }
  }

  // Detect suspicious keywords in path or subdomain
  if (/(?:login|verify|security|signin|account|update|banking|wallet|confirm|recover|support)/i.test(path) ||
      /(?:login|verify|security|signin|account|update|banking|wallet|confirm|recover|support)/i.test(subdomain)) {
    if (impersonatedBrand || isShortener || isSuspiciousTld || isIpHost) {
      deceptiveIndicators.push('Authentication or account security action keywords present on untrusted domain path/subdomain');
    }
  }

  return {
    rawUrl: rawUrlString,
    protocol,
    hostname,
    domain,
    subdomain: subdomain || undefined,
    tld,
    path,
    queryParamCount,
    isHttps,
    isIpHost,
    isShortener,
    isSuspiciousTld,
    isPunycode,
    hasSubdomainSquatting,
    impersonatedBrand,
    deceptiveIndicators
  };
}
