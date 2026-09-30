import React from 'react';
import { Lock, Shield, EyeOff, Server, AlertCircle } from 'lucide-react';

export const SecurityPrivacyView: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto my-12 px-4 space-y-10 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="pb-6 border-b border-white/[0.08]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-400 mb-4">
          <span>PRIVACY &amp; OPERATIONAL SAFEGUARDS</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-normal text-white tracking-tight">
          Security &amp; Privacy Disclosures
        </h1>
        <p className="text-sm text-zinc-400 font-sans mt-2 max-w-2xl leading-relaxed">
          Technical specifications regarding data isolation, ephemeral processing, and threat intelligence boundaries.
        </p>
      </div>

      {/* Core Privacy Principles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="p-6 rounded-2xl bg-[#0c0c0e] border border-white/10 space-y-2.5">
          <div className="flex items-center gap-2 text-white text-xs font-medium">
            <EyeOff className="w-4 h-4 text-zinc-400" />
            <span>Zero Persistent Server Storage</span>
          </div>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
            Content submitted for inspection is processed ephemerally in volatile memory and discarded immediately upon response synthesis. No raw text, passwords, or personal telephone numbers are saved in persistent databases on our backend.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0c0c0e] border border-white/10 space-y-2.5">
          <div className="flex items-center gap-2 text-white text-xs font-medium">
            <Shield className="w-4 h-4 text-zinc-400" />
            <span>Client-Side Local Storage Only</span>
          </div>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
            Analysis history and custom Gemini API keys are saved strictly inside your browser&apos;s isolated <code>localStorage</code> sandbox. You have unilateral control to export or permanently purge all entries at any time.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0c0c0e] border border-white/10 space-y-2.5">
          <div className="flex items-center gap-2 text-white text-xs font-medium">
            <Server className="w-4 h-4 text-zinc-400" />
            <span>External Service Transparency</span>
          </div>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
            When third-party threat APIs (e.g. Google Gemini 2.5) are configured, only the sanitized text is transmitted over TLS. When external keys are absent, ScamShield executes entirely offline on deterministic local heuristics and Tesseract.js.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0c0c0e] border border-white/10 space-y-2.5">
          <div className="flex items-center gap-2 text-white text-xs font-medium">
            <Lock className="w-4 h-4 text-zinc-400" />
            <span>Non-Adversarial Architecture</span>
          </div>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
            ScamShield AI will never prompt for your credentials, OTPs, or recovery phrases. If you analyze an input containing sensitive numbers, we strongly encourage redacting passwords and payment card numbers beforehand.
          </p>
        </div>

      </div>

      {/* Disclaimers & Calibration */}
      <div className="p-6 rounded-2xl bg-[#0c0c0e] border border-white/10 space-y-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">
          Automated Assessment Limitations
        </h3>
        <p className="text-xs text-zinc-400 leading-relaxed font-sans">
          Risk scores and signal classifications are automated probabilistic evaluations. Cyber attackers continuously alter delivery vectors. While ScamShield provides defensive indicators, zero automated security system provides 100% detection guarantees. Always verify sensitive financial and institutional requests via independent official channels.
        </p>
      </div>

    </div>
  );
};
