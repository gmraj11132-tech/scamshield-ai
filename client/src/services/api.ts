import { AnalysisResult, DemoSample, InputType } from '../types';
import { runClientAnalysis } from './client-analyzer';

const API_BASE = '/api';
const API_KEY_STORAGE = 'scamshield_gemini_api_key';

export function getStoredGeminiKey(): string {
  try {
    return localStorage.getItem(API_KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

export function setStoredGeminiKey(key: string): void {
  try {
    if (key && key.trim()) {
      localStorage.setItem(API_KEY_STORAGE, key.trim());
    } else {
      localStorage.removeItem(API_KEY_STORAGE);
    }
  } catch {
    // Ignore storage errors
  }
}

function getRequestHeaders(isJson = true): Record<string, string> {
  const headers: Record<string, string> = {};
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  const key = getStoredGeminiKey();
  if (key) {
    headers['x-gemini-api-key'] = key;
  }
  return headers;
}

export async function testGeminiApiKey(apiKey: string): Promise<{ valid: boolean; model?: string; message?: string; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/analyze/test-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    });
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Fallback to direct client ping to Google Gemini
  }

  try {
    const directRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey.trim())}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Ping: Respond with "pong" only.' }] }]
        })
      }
    );
    if (directRes.ok) {
      return { valid: true, model: 'gemini-2.5-flash', message: 'API key successfully validated with Google Gemini.' };
    } else {
      const err = await directRes.json().catch(() => ({}));
      return { valid: false, error: err.error?.message || 'Invalid API key.' };
    }
  } catch (err: unknown) {
    return { valid: false, error: err instanceof Error ? err.message : 'Connection failed.' };
  }
}

export async function analyzeMessage(
  content: string,
  depth: 'standard' | 'deep' = 'standard',
  language?: string
): Promise<AnalysisResult> {
  try {
    const response = await fetch(`${API_BASE}/analyze/message`, {
      method: 'POST',
      headers: getRequestHeaders(true),
      body: JSON.stringify({ content, depth, language }),
    });

    if (response.ok) {
      return response.json();
    }
  } catch (err) {
    console.warn('[API] Backend unreachable, falling back to client engine:', err);
  }

  // Graceful client-side fallback (for GitHub Pages & standalone environments)
  return runClientAnalysis(content, 'message', getStoredGeminiKey());
}

export async function analyzeUrl(
  url: string,
  depth: 'standard' | 'deep' = 'standard'
): Promise<AnalysisResult> {
  try {
    const response = await fetch(`${API_BASE}/analyze/url`, {
      method: 'POST',
      headers: getRequestHeaders(true),
      body: JSON.stringify({ url, depth }),
    });

    if (response.ok) {
      return response.json();
    }
  } catch (err) {
    console.warn('[API] Backend unreachable, falling back to client engine:', err);
  }

  return runClientAnalysis(url, 'url', getStoredGeminiKey());
}

export async function analyzeScreenshot(
  file: File,
  depth: 'standard' | 'deep' = 'standard'
): Promise<AnalysisResult> {
  try {
    const formData = new FormData();
    formData.append('screenshot', file);
    formData.append('depth', depth);

    const customKey = getStoredGeminiKey();
    const headers: Record<string, string> = {};
    if (customKey) {
      headers['x-gemini-api-key'] = customKey;
    }

    const response = await fetch(`${API_BASE}/analyze/screenshot`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (response.ok) {
      return response.json();
    }
  } catch (err) {
    console.warn('[API] Backend unreachable for screenshot, attempting client vision:', err);
  }

  // Client vision fallback: read image as base64 and if Gemini key present, call Gemini Vision
  const key = getStoredGeminiKey();
  if (key) {
    try {
      const base64 = await fileToBase64(file);
      const mime = file.type;
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { inlineData: { mimeType: mime, data: base64 } },
                  { text: 'Extract and analyze all text from this screenshot for fraud, scam, and security threats. Return full text verbatim.' }
                ]
              }
            ]
          })
        }
      );
      if (res.ok) {
        const json = await res.json();
        const extracted = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const analysis = await runClientAnalysis(extracted, 'screenshot', key, extracted);
        analysis.extractedText = extracted;
        return analysis;
      }
    } catch (visionErr) {
      console.warn('[API] Client Gemini Vision failed:', visionErr);
    }
  }

  return runClientAnalysis(file.name, 'screenshot', undefined, `[Screenshot uploaded: ${file.name}]`);
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      const base64 = res.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function analyzeEmail(
  emailFields: { from?: string; subject?: string; body?: string; headers?: string },
  depth: 'standard' | 'deep' = 'standard'
): Promise<AnalysisResult> {
  try {
    const response = await fetch(`${API_BASE}/analyze/email`, {
      method: 'POST',
      headers: getRequestHeaders(true),
      body: JSON.stringify({ ...emailFields, depth }),
    });

    if (response.ok) {
      return response.json();
    }
  } catch (err) {
    console.warn('[API] Backend unreachable, falling back to client engine:', err);
  }

  const combined = [
    emailFields.subject ? `Subject: ${emailFields.subject}` : '',
    emailFields.from ? `From: ${emailFields.from}` : '',
    emailFields.body || ''
  ].filter(Boolean).join('\n\n');

  return runClientAnalysis(combined, 'email', getStoredGeminiKey());
}

export async function fetchDemoSamples(): Promise<DemoSample[]> {
  try {
    const response = await fetch(`${API_BASE}/demo-samples`);
    if (response.ok) {
      const data = await response.json();
      if (data.samples && data.samples.length > 0) return data.samples;
    }
  } catch {
    // fallback
  }
  return getFallbackDemoSamples();
}

export async function checkHealth(): Promise<{ status: string; features?: Record<string, string> }> {
  try {
    const response = await fetch(`${API_BASE}/health`);
    if (response.ok) {
      return response.json();
    }
  } catch {
    // server offline
  }
  return { status: 'offline' };
}

export function getFallbackDemoSamples(): DemoSample[] {
  return [
    {
      id: 'demo-1-account-suspension',
      title: 'Chase Bank Account Suspension Notice',
      type: 'message',
      category: 'Urgency & Banking Phishing',
      expectedRisk: 'HIGH',
      previewText: '[CHASE-ALERT]: Unauthorized debit of $842.10 detected...',
      fullContent: '[CHASE-SECURITY-ALERT]: We detected an unauthorized transaction of $842.10 on your card ending in 4102. Your online access will be permanently suspended within 30 minutes unless verified. Please verify your credentials immediately at: https://chase-auth-security.top/login to cancel the charge.',
      explanation: 'Urgency manipulation combined with spoofed domain (.top) and credential solicitation.',
      isDemoData: true
    },
    {
      id: 'demo-2-delivery-payment',
      title: 'USPS Postal Redelivery Fee Demand',
      type: 'message',
      category: 'Smishing / Advance Fee',
      expectedRisk: 'HIGH',
      previewText: 'USPS: Package #US948192 delivery failure due to wrong address...',
      fullContent: 'USPS Notice: Your parcel package #US948192 delivery failure occurred due to an incomplete residential address. A redelivery fee of $1.85 is required within 24 hours to reschedule delivery: https://usps-redelivery-post.xyz/update. Failure to update will result in package return.',
      explanation: 'Small fee lure to harvest credit card details using high-abuse .xyz TLD under the USPS brand.',
      isDemoData: true
    },
    {
      id: 'demo-3-electricity-shutoff',
      title: 'Electricity Power Disconnection Threat',
      type: 'message',
      category: 'Utility Extortion',
      expectedRisk: 'CRITICAL',
      previewText: 'Dear Consumer, Your electricity power will be disconnected tonight...',
      fullContent: 'Dear Consumer, Your electricity power will be disconnected tonight at 9:30 PM from the power sub-station because your previous month bill was not updated. Please immediately contact our electricity officer Mr. Sharma at 9876543210 to avoid disconnection.',
      explanation: 'Fake utility extortion scam threatening power cut to induce panic and force payment to a private personal number.',
      isDemoData: true
    },
    {
      id: 'demo-4-digital-arrest',
      title: 'FedEx Customs Seizure / Police Digital Arrest',
      type: 'message',
      category: 'Extortion / Impersonation',
      expectedRisk: 'CRITICAL',
      previewText: 'FedEx Alert: Parcel seized with illegal drugs addressed in your name...',
      fullContent: 'FedEx Security Alert: Your international parcel #FX-88910 containing 5 fake passports and 140g MDMA was intercepted by Customs authorities at Mumbai Airport. A non-bailable arrest warrant has been issued by CBI / Narcotics Control Bureau. Connect immediately via Skype/WhatsApp with Inspector Cyber Crime for digital statement recording or face immediate home raid.',
      explanation: 'Severe digital arrest extortion scam using fabricated law enforcement warrants and intimidation.',
      isDemoData: true
    },
    {
      id: 'demo-5-telegram-task',
      title: 'Telegram YouTube Video Like Prepaid Task',
      type: 'message',
      category: 'Task Fraud / Pig Butchering',
      expectedRisk: 'HIGH',
      previewText: 'Part-time opportunity: Earn $50-$300 daily by liking YouTube videos...',
      fullContent: 'Congratulations! You have been selected for global remote freelance rating. Earn $50 to $300 daily simply by subscribing to YouTube channels and reviewing Google Maps locations. First 3 tasks pay $15 instant trial bonus. Join our Telegram VIP channel @GlobalEarnGroup and recharge $50 VIP security deposit to unlock daily withdrawals!',
      explanation: 'Prepaid brushing/task scam demanding deposit recharge to access fake commissions.',
      isDemoData: true
    },
    {
      id: 'demo-6-suspicious-login-url',
      title: 'PayPal Verification Login Link',
      type: 'url',
      category: 'Domain Typosquatting / Credential Harvest',
      expectedRisk: 'HIGH',
      previewText: 'https://paypal-account-security-update.click/signin',
      fullContent: 'https://paypal-account-security-update.click/signin?session_token=938f83e8a&redirect=auth_wallet',
      explanation: 'Typosquatting using target brand PayPal in a secondary domain on high-risk .click TLD with authentication parameters.',
      isDemoData: true
    },
    {
      id: 'demo-7-legitimate-receipt',
      title: 'Legitimate Order Receipt (GitHub)',
      type: 'message',
      category: 'Legitimate Informational Message',
      expectedRisk: 'LOW',
      previewText: 'Thank you for your GitHub subscription renewal payment of $4.00...',
      fullContent: 'Thank you for your payment of $4.00 for GitHub Pro monthly subscription. Your billing receipt #INV-2026-9481 is attached to your account. No further action is required from you. You can review your invoices anytime at https://github.com/settings/billing.',
      explanation: 'Legitimate transactional communication: No artificial urgency, no threats, points to official github.com domain, no credential requests.',
      isDemoData: true
    }
  ];
}
