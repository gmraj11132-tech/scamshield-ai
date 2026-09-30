import { describe, it } from 'node:test';
import assert from 'node:assert';
import { runThreatAnalysis } from '../engines/analyzer.js';
import { parseInputContent } from '../engines/input-parser.js';
import { analyzeUrl } from '../engines/url-analyzer.js';

describe('ScamShield AI Core Analysis Suite', () => {

  it('correctly normalizes text and extracts Shannon entropy', () => {
    const text = 'Urgent: Your account will be closed in 24 hours. Verify now: https://example.com/test';
    const parsed = parseInputContent(text);
    assert.strictEqual(parsed.urls.length, 1);
    assert.strictEqual(parsed.urls[0], 'https://example.com/test');
    assert.ok(parsed.entropyScore > 3.0, 'Entropy should be positive');
    assert.strictEqual(parsed.hasObfuscatedChars, false);
  });

  it('detects high-risk urgency and credential harvesting in message', async () => {
    const rawMessage = '[ALERT]: Unauthorized charge of $842 detected. Your account will be permanently suspended within 30 minutes. Enter your password and OTP immediately at: https://chase-auth.top/verify';
    
    const result = await runThreatAnalysis({
      type: 'message',
      content: rawMessage,
      depth: 'standard'
    });

    assert.ok(['CRITICAL', 'HIGH'].includes(result.riskLevel), `Expected HIGH or CRITICAL risk, got ${result.riskLevel}`);
    assert.ok(result.riskScore >= 75, `Expected score >= 75, got ${result.riskScore}`);
    
    const signalNames = result.signals.map(s => s.name);
    assert.ok(signalNames.some(n => n.includes('Urgency manipulation')));
    assert.ok(signalNames.some(n => n.includes('Credential') || n.includes('secret')));
    
    assert.ok(result.annotations.length >= 2, 'Should have flagged annotations');
    assert.ok(result.annotations.some(a => a.tag === 'Urgency'));
  });

  it('detects electricity power disconnection extortion scam', async () => {
    const electricityMsg = 'Dear Consumer, Your electricity power will be disconnected tonight at 9:30 PM from the power sub-station because your previous month bill was not updated. Please immediately contact our electricity officer Mr. Sharma at 9876543210 to avoid disconnection.';
    
    const result = await runThreatAnalysis({
      type: 'message',
      content: electricityMsg,
      depth: 'standard'
    });

    assert.ok(result.riskScore >= 60, `Expected score >= 60, got ${result.riskScore}`);
    assert.ok(result.signals.some(s => s.id === 'SIG-UTIL-01'));
  });

  it('detects customs contraband seized and digital arrest threats', async () => {
    const arrestMsg = 'FedEx Alert: Your international parcel was seized with illegal drugs and contraband. A digital arrest warrant has been issued by CBI and Cyber Crime Branch.';
    
    const result = await runThreatAnalysis({
      type: 'message',
      content: arrestMsg,
      depth: 'standard'
    });

    assert.ok(result.riskScore >= 70, `Expected score >= 70, got ${result.riskScore}`);
    assert.ok(result.signals.some(s => s.id === 'SIG-PARCEL-01'));
  });

  it('detects QR code receive money scam and UPI fraud', async () => {
    const upiMsg = 'Scan this QR code to receive money of Rs 5000 in your PhonePe account. Enter UPI PIN to claim reward.';
    
    const result = await runThreatAnalysis({
      type: 'message',
      content: upiMsg,
      depth: 'standard'
    });

    assert.ok(result.riskScore >= 60, `Expected score >= 60, got ${result.riskScore}`);
    assert.ok(result.signals.some(s => s.id === 'SIG-UPI-01'));
  });

  it('deconstructs suspicious URLs, detects typosquatting and high-abuse TLDs', () => {
    const breakdown = analyzeUrl('https://chase-banking-security.click/login?session=98234');
    assert.strictEqual(breakdown.tld, 'click');
    assert.strictEqual(breakdown.isSuspiciousTld, true);
    assert.strictEqual(breakdown.impersonatedBrand, 'Chase Bank');
    assert.ok(breakdown.deceptiveIndicators.length > 0);
  });

  it('identifies URL shorteners without fabricating external reputation', () => {
    const breakdown = analyzeUrl('https://bit.ly/secure-auth-391');
    assert.strictEqual(breakdown.isShortener, true);
    assert.ok(breakdown.deceptiveIndicators.some(i => i.includes('shortening')));
  });

  it('correctly scores legitimate informational messages as LOW or NEGLIGIBLE', async () => {
    const cleanMessage = 'Thank you for your payment of $4.00 for GitHub Pro monthly subscription. Your receipt is attached to your account. You can review invoices anytime at https://github.com/settings/billing.';
    
    const result = await runThreatAnalysis({
      type: 'message',
      content: cleanMessage,
      depth: 'standard'
    });

    assert.ok(['LOW', 'NEGLIGIBLE'].includes(result.riskLevel), `Expected LOW or NEGLIGIBLE, got ${result.riskLevel}`);
    assert.ok(result.riskScore <= 35, `Expected score <= 35 for clean message, got ${result.riskScore}`);
  });

  it('detects brand claim originating from free consumer webmail', async () => {
    const result = await runThreatAnalysis({
      type: 'email',
      content: 'Your Office 365 password expires in 4 hours. Keep password now.',
      emailFields: {
        from: 'helpdesk-microsoft@gmail.com',
        subject: 'Action Required: Password Expiration',
        body: 'Your Office 365 password expires in 4 hours. Keep password now.'
      }
    });

    assert.ok(result.signals.some(s => s.id === 'SIG-SND-FREE'));
    assert.ok(result.riskScore >= 60);
  });

});
