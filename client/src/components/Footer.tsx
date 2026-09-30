import React from 'react';
import { Shield, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: 'analyze' | 'how-it-works' | 'security' | 'history') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#050506] mt-24 text-xs font-sans text-zinc-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/[0.06]">
          
          {/* Logo & Tagline */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white font-medium text-sm">
              <Shield className="w-4 h-4 text-white" strokeWidth={1.8} />
              <span>ScamShield AI</span>
            </div>
            <p className="text-zinc-400 text-xs">
              Deceptive signal detection & forensic threat verification.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap items-center gap-6 text-zinc-400 text-xs">
            <button
              onClick={() => onNavigate('analyze')}
              className="hover:text-white transition-colors"
            >
              Analyze
            </button>
            <button
              onClick={() => onNavigate('how-it-works')}
              className="hover:text-white transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => onNavigate('security')}
              className="hover:text-white transition-colors"
            >
              Security & Privacy
            </button>
            <button
              onClick={() => onNavigate('history')}
              className="hover:text-white transition-colors"
            >
              Local Vault
            </button>
            <a
              href="https://aistudio.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors inline-flex items-center gap-1"
            >
              <span>Gemini 2.5</span>
              <ArrowUpRight className="w-3 h-3 text-zinc-500" />
            </a>
          </div>

        </div>

        {/* Legal Disclaimer */}
        <div className="pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-[11px] text-zinc-500 font-mono">
          <p className="max-w-2xl leading-relaxed">
            ScamShield AI generates automated probabilistic threat assessments based on detected indicators. It does not replace certified cybersecurity or legal counsel.
          </p>
          <div className="text-zinc-500 shrink-0">
            ScamShield Core 3.0 &bull; Private Local Processing
          </div>
        </div>

      </div>
    </footer>
  );
};
