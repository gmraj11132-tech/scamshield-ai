import React from 'react';
import { Terminal, Shield, ArrowRight, CheckCircle2, Cpu, Globe, Lock, Search } from 'lucide-react';

interface HowItWorksViewProps {
  onGoToAnalyze: () => void;
}

export const HowItWorksView: React.FC<HowItWorksViewProps> = ({ onGoToAnalyze }) => {
  return (
    <div className="w-full max-w-5xl mx-auto my-12 px-4 space-y-12 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="pb-6 border-b border-white/[0.08]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-400 mb-4">
          <span>SYSTEM ARCHITECTURE &amp; METHODOLOGY</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-normal text-white tracking-tight">
          How ScamShield AI Works
        </h1>
        <p className="text-sm text-zinc-400 font-sans mt-2 max-w-2xl leading-relaxed">
          A dual-engine cyber deception defense system combining deterministic pattern recognition with Gemini neural deep-reasoning.
        </p>
      </div>

      {/* 4-Stage Technical Pipeline */}
      <div className="space-y-6">
        <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-medium">
          The 4-Stage Analysis Pipeline
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="p-6 rounded-2xl bg-[#0c0c0e] border border-white/10 space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs flex items-center justify-center font-medium">
                01
              </span>
              <h3 className="text-sm font-medium text-white">
                Input Normalization &amp; Entropy Engine
              </h3>
            </div>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              ScamShield AI sanitizes inbound raw text streams, stripping zero-width spaces, hidden separators, and homoglyphs. It computes the Shannon entropy score to identify encrypted, randomized, or obfuscated payloads commonly injected to evade spam filters.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0c0c0e] border border-white/10 space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs flex items-center justify-center font-medium">
                02
              </span>
              <h3 className="text-sm font-medium text-white">
                Social-Engineering Pattern Extraction
              </h3>
            </div>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Evaluates the communication against 50+ deterministic social-engineering vectors: manufactured urgency constraints, credential harvesting prompts (OTP, passwords, KYC), coercive threats (legal summons, police action), and remote desktop utility demands.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0c0c0e] border border-white/10 space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs flex items-center justify-center font-medium">
                03
              </span>
              <h3 className="text-sm font-medium text-white">
                Domain Decomposition &amp; Typosquatting
              </h3>
            </div>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Deconstructs extracted URLs into protocol, subdomain, registered domain, and TLD. Applies Levenshtein distance matching against protected enterprise brand registries and flags high-abuse TLDs (.top, .xyz, .click, .buzz).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0c0c0e] border border-white/10 space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs flex items-center justify-center font-medium">
                04
              </span>
              <h3 className="text-sm font-medium text-white">
                Neural Reasoning &amp; Calibration
              </h3>
            </div>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              When configured with Google Gemini 2.5 Flash, an advanced LLM evaluates conversational context and nuance, blending 70% neural semantic scoring with 30% deterministic rules to provide verified, zero-hallucination security assessments.
            </p>
          </div>

        </div>
      </div>

      {/* Bottom CTA */}
      <div className="p-8 rounded-2xl bg-[#0c0c0e] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-lg font-medium text-white">Ready to inspect a suspicious communication?</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Test any message, URL, or screenshot in real-time.
          </p>
        </div>
        <button
          onClick={onGoToAnalyze}
          className="px-6 py-2.5 rounded-full bg-white text-black font-medium text-xs hover:bg-zinc-200 transition-all flex items-center gap-2 shrink-0 shadow-sm"
        >
          <span>Open Analyzer</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
