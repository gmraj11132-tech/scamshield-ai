/**
 * OCR Service — Dual-Engine Optical Character Recognition
 * 1. Primary: Gemini 2.5 Flash Multimodal Vision (when GEMINI_API_KEY configured)
 * 2. Secondary: Tesseract.js embedded neural OCR engine (100% offline, real text extraction)
 */

import { extractTextFromImage } from './analyzer.js';
import { createWorker } from 'tesseract.js';

export async function extractTextFromScreenshot(
  buffer: Buffer,
  originalFilename: string,
  mimeType: string,
  customApiKey?: string
): Promise<{ text: string; source: 'gemini-vision' | 'tesseract-offline' | 'offline-fallback'; warning?: string }> {

  const apiKey = customApiKey || process.env.GEMINI_API_KEY;

  // 1. Try Gemini Vision first if API key configured
  if (apiKey) {
    try {
      const extracted = await extractTextFromImage(buffer, mimeType, apiKey);
      if (extracted && extracted.trim().length >= 5) {
        return {
          text: extracted.trim(),
          source: 'gemini-vision',
        };
      }
    } catch (err) {
      console.warn('[OCR] Gemini Vision failed, attempting Tesseract.js fallback:', err);
    }
  }

  // 2. Real Offline Optical Character Recognition via Tesseract.js
  try {
    const worker = await createWorker('eng');
    const ret = await worker.recognize(buffer);
    await worker.terminate();

    const recognizedText = (ret.data?.text || '').trim();

    if (recognizedText.length >= 5) {
      return {
        text: recognizedText,
        source: 'tesseract-offline',
        warning: apiKey ? undefined : 'Analyzed via embedded Tesseract OCR engine.'
      };
    }
  } catch (tesseractErr) {
    console.error('[OCR] Tesseract OCR failed:', tesseractErr);
  }

  // 3. Last fallback if image is purely graphical or empty
  return {
    text: `[Screenshot: ${originalFilename}]\nNo legible text could be extracted from this image. Please paste the message text directly or check image clarity.`,
    source: 'offline-fallback',
    warning: 'Unable to extract legible text from image.'
  };
}
