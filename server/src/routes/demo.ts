import { Router, Request, Response } from 'express';

export interface DemoSample {
  id: string;
  title: string;
  type: 'message' | 'url' | 'screenshot' | 'email';
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

export const DEMO_SAMPLES: DemoSample[] = [
  {
    id: 'demo-1-account-suspension',
    title: 'Chase Bank Account Suspension Notice',
    type: 'message',
    category: 'Urgency & Banking Phishing',
    expectedRisk: 'HIGH',
    previewText: '[CHASE-ALERT]: Unauthorized debit of $842.10 detected...',
    fullContent: '[CHASE-SECURITY-ALERT]: We detected an unauthorized transaction of $842.10 on your card ending in 4102. Your online access will be permanently suspended within 30 minutes unless verified. Please verify your credentials immediately at: https://chase-auth-security.top/login to cancel the charge.',
    explanation: 'Classic urgency manipulation combined with spoofed domain (.top) and credential solicitation.',
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
    id: 'demo-3-crypto-investment',
    title: 'Telegram Guaranteed Crypto Arbitrage Bot',
    type: 'message',
    category: 'Pig Butchering / Investment Fraud',
    expectedRisk: 'HIGH',
    previewText: 'VIP Invitation: Proprietary Quantum Arbitrage Trading...',
    fullContent: 'VIP Private Investment: Join our AI-driven arbitrage liquidity pool. 100% guaranteed return of 450% within 48 hours with zero risk. Send minimum 250 USDT or 0.05 BTC to wallet 0x71C8451b5c46487eF894E2cD857849D39Acbc782 to activate your private node today!',
    explanation: 'Unrealistic 100% guaranteed profit claim, zero risk claim, and direct unrecoverable crypto transfer demand.',
    isDemoData: true
  },
  {
    id: 'demo-4-suspicious-login-url',
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
    id: 'demo-5-legitimate-receipt',
    title: 'Legitimate Order Receipt (GitHub / Cloud)',
    type: 'message',
    category: 'Legitimate Informational Message',
    expectedRisk: 'LOW',
    previewText: 'Thank you for your GitHub subscription renewal payment of $4.00...',
    fullContent: 'Thank you for your payment of $4.00 for GitHub Pro monthly subscription. Your billing receipt #INV-2026-9481 is attached to your account. No further action is required from you. You can review your invoices anytime at https://github.com/settings/billing.',
    explanation: 'Legitimate transactional communication: No artificial urgency, no threats, points to official github.com domain, no credential requests.',
    isDemoData: true
  },
  {
    id: 'demo-6-m365-email',
    title: 'Microsoft 365 Password Expiration Alert',
    type: 'email',
    category: 'Business Email Compromise / Credential Harvest',
    expectedRisk: 'HIGH',
    previewText: 'From: Microsoft IT Support <helpdesk-alert@gmail.com> | Subject: Action Required...',
    fullContent: 'From: Microsoft IT Support <helpdesk-alert@gmail.com>\nSubject: Action Required: Your Office 365 Password expires in 4 hours\n\nDear User,\n\nYour organizational Microsoft 365 password will expire today in 4 hours. All emails will be blocked until your account password is kept active.\n\nKeep your current password here: https://bit.ly/m365-pass-keep\n\nIT Support Services',
    emailFields: {
      from: 'helpdesk-alert@gmail.com',
      subject: 'Action Required: Your Office 365 Password expires in 4 hours',
      body: 'Dear User,\n\nYour organizational Microsoft 365 password will expire today in 4 hours. All emails will be blocked until your account password is kept active.\n\nKeep your current password here: https://bit.ly/m365-pass-keep\n\nIT Support Services'
    },
    explanation: 'Free gmail address claiming to be enterprise Microsoft support, shortened bit.ly URL, and 4-hour countdown urgency.',
    isDemoData: true
  }
];

export const demoRouter = Router();

demoRouter.get('/', (_req: Request, res: Response) => {
  res.json({
    disclaimer: 'DEMO DATA ONLY: Preset scenarios for test and evaluation purposes. Not real threat intelligence.',
    samples: DEMO_SAMPLES
  });
});
