import React, { useState, useEffect } from 'react';
import { getStoredGeminiKey, setStoredGeminiKey, testGeminiApiKey } from '../services/api';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeySaved }) => {
  const [apiKey, setApiKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ valid?: boolean; message?: string; error?: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getStoredGeminiKey());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setStoredGeminiKey(apiKey);
    onKeySaved();
    onClose();
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      setTestResult({ valid: false, error: 'Please enter a Gemini API key first.' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testGeminiApiKey(apiKey.trim());
      setTestResult(res);
    } catch (err: unknown) {
      setTestResult({
        valid: false,
        error: err instanceof Error ? err.message : 'Connection failed.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleClear = () => {
    setApiKey('');
    setStoredGeminiKey('');
    setTestResult(null);
    onKeySaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0c0c0e] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-medium text-white tracking-tight">AI Engine Configuration</h2>
              <p className="text-xs text-zinc-400">Google Gemini 2.5 Flash & Vision OCR</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white p-1 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="py-5 space-y-4">
          <p className="text-xs text-zinc-400 leading-relaxed">
            By default, ScamShield AI uses a dual-engine architecture: an offline deterministic heuristic parser, and an embedded Tesseract.js OCR engine. Provide your <strong className="text-zinc-200">Google Gemini API Key</strong> to activate neural deep-reasoning and vision image recognition.
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-zinc-400 tracking-wider">
              Gemini API Key
            </label>
            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-[#141418] border border-white/10 focus:border-white/30 rounded-lg px-3.5 py-2.5 text-sm text-white font-mono placeholder:text-zinc-600 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
              <span>Your key remains in your local browser storage</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-zinc-400 hover:text-white underline"
              >
                Get free key from Google AI Studio &rarr;
              </a>
            </div>
          </div>

          {/* Test Status Banner */}
          {testResult && (
            <div className={`p-3 rounded-lg border text-xs font-mono ${
              testResult.valid
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${testResult.valid ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                <span>{testResult.message || testResult.error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
          <div className="flex items-center gap-2">
            <button
              onClick={handleTest}
              disabled={isTesting || !apiKey.trim()}
              className="px-3.5 py-2 text-xs font-medium text-zinc-300 hover:text-white border border-white/10 hover:border-white/20 rounded-lg disabled:opacity-40 transition-colors"
            >
              {isTesting ? 'Validating...' : 'Test Connection'}
            </button>
            {apiKey && (
              <button
                onClick={handleClear}
                className="px-3 py-2 text-xs text-zinc-500 hover:text-rose-400 transition-colors"
              >
                Clear Key
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-xs font-medium bg-white text-black hover:bg-zinc-200 rounded-lg transition-colors"
            >
              Save Key
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
