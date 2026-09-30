export interface ParsedInput {
  normalizedText: string;
  urls: string[];
  emails: string[];
  phoneNumbers: string[];
  cryptoAddresses: string[];
  currencyMentions: string[];
  entropyScore: number;
  characterCount: number;
  wordCount: number;
  tokenEstimate: number;
  detectedLanguage: string;
  hasObfuscatedChars: boolean;
}

// Shannon entropy calculation for detecting obfuscation / random tokens
export function calculateEntropy(str: string): number {
  if (!str || str.length === 0) return 0;
  const freq: Record<string, number> = {};
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    freq[char] = (freq[char] || 0) + 1;
  }
  let entropy = 0;
  const len = str.length;
  for (const count of Object.values(freq)) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return Number(entropy.toFixed(2));
}

// URL extraction regex supporting schemes, naked domains, and port/paths
const URL_REGEX = /(?:https?:\/\/|www\.)[^\s<>"'{}|\\^`[\]]+|(?:[a-zA-Z0-9-]+\.)+(?:com|net|org|io|xyz|top|ru|co|info|biz|site|live|click|link|online|app|me|club|tech|cc|cn|tk|ga|cf|gq|ml)(?:\/[^\s<>"'{}|\\^`[\]]*)?/gi;

// Email extraction regex
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Phone number extraction regex
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b/g;

// Crypto addresses (BTC, ETH, etc.)
const CRYPTO_REGEX = /\b(0x[a-fA-F0-9]{40}|[13][a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-zA-HJ-NP-Z0-9]{39,59})\b/g;

// Currency demands
const CURRENCY_REGEX = /(?:[\$€£¥₹]|USD|EUR|GBP|BTC|ETH|USDT)\s?[\d,]+(?:\.\d{1,2})?|\b[\d,]+(?:\.\d{1,2})?\s?(?:dollars|euros|pounds|bitcoin|usdt)\b/gi;

export function parseInputContent(rawText: string): ParsedInput {
  if (!rawText) {
    return {
      normalizedText: '',
      urls: [],
      emails: [],
      phoneNumbers: [],
      cryptoAddresses: [],
      currencyMentions: [],
      entropyScore: 0,
      characterCount: 0,
      wordCount: 0,
      tokenEstimate: 0,
      detectedLanguage: 'en',
      hasObfuscatedChars: false,
    };
  }

  // Remove zero-width spaces, soft hyphens, and invisible homoglyph separators often used by scammers
  const hasZeroWidth = /[\u200B-\u200D\uFEFF\u00AD]/.test(rawText);
  const normalizedText = rawText
    .replace(/[\u200B-\u200D\uFEFF\u00AD]/g, '')
    .trim();

  // Extract URLs
  const rawUrls = normalizedText.match(URL_REGEX) || [];
  const urls = Array.from(new Set(rawUrls.map(u => {
    let clean = u.replace(/[.,;!?)]+$/, '');
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'https://' + clean;
    }
    return clean;
  })));

  // Extract emails
  const emails = Array.from(new Set(normalizedText.match(EMAIL_REGEX) || []));

  // Extract phone numbers
  const phoneNumbers = Array.from(new Set(normalizedText.match(PHONE_REGEX) || []));

  // Extract crypto
  const cryptoAddresses = Array.from(new Set(normalizedText.match(CRYPTO_REGEX) || []));

  // Extract currency mentions
  const currencyMentions = Array.from(new Set(normalizedText.match(CURRENCY_REGEX) || []));

  const characterCount = normalizedText.length;
  const words = normalizedText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const tokenEstimate = Math.ceil(characterCount / 4);
  const entropyScore = calculateEntropy(normalizedText);

  // Basic language detection
  let detectedLanguage = 'en';
  if (/[\u0400-\u04FF]/.test(normalizedText)) detectedLanguage = 'ru';
  else if (/[\u4E00-\u9FFF]/.test(normalizedText)) detectedLanguage = 'zh';
  else if (/\b(hola|cuenta|urgente|bloqueada|banco|verificar|pago)\b/i.test(normalizedText)) detectedLanguage = 'es';
  else if (/\b(bonjour|compte|urgent|bloqué|banque|paiement)\b/i.test(normalizedText)) detectedLanguage = 'fr';
  else if (/\b(hallo|konto|dringend|gesperrt|uberweisung)\b/i.test(normalizedText)) detectedLanguage = 'de';

  return {
    normalizedText,
    urls,
    emails,
    phoneNumbers,
    cryptoAddresses,
    currencyMentions,
    entropyScore,
    characterCount,
    wordCount,
    tokenEstimate,
    detectedLanguage,
    hasObfuscatedChars: hasZeroWidth,
  };
}
