import React from 'react';
import { Shield, Sparkles, Key, ArrowRight } from 'lucide-react';
import { getStoredGeminiKey } from '../services/api';

interface NavbarProps {
  activeView: 'analyze' | 'history' | 'how-it-works' | 'security';
  setActiveView: (view: 'analyze' | 'history' | 'how-it-works' | 'security') => void;
  historyCount: number;
  onOpenDemoModal: () => void;
  onOpenKeyModal: () => void;
  onResetToAnalyzer: () => void;
  serverOnline: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  historyCount,
  onOpenDemoModal,
  onOpenKeyModal,
  onResetToAnalyzer,
  serverOnline
}) => {
  const hasCustomKey = !!getStoredGeminiKey();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#050506]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo - OpenAI Minimalist Style */}
        <div 
          onClick={onResetToAnalyzer}
          className="flex items-center gap-3 cursor-pointer group select-none"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onResetToAnalyzer()}
        >
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:border-white/25 transition-colors">
            <Shield className="w-4 h-4 text-white" strokeWidth={1.8} />
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-semibold tracking-tight text-white">
              ScamShield
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-400">
              AI 3.0
            </span>
          </div>
        </div>

        {/* Central Navigation - OpenAI Clean Link Pills */}
        <nav className="hidden md:flex items-center gap-1 bg-[#0c0c0e] border border-white/10 p-1 rounded-full">
          <button
            onClick={() => setActiveView('analyze')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all ${
              activeView === 'analyze'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Analyze
          </button>

          <button
            onClick={() => setActiveView('how-it-works')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all ${
              activeView === 'how-it-works'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            How It Works
          </button>

          <button
            onClick={() => setActiveView('security')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all ${
              activeView === 'security'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Security & Privacy
          </button>

          <button
            onClick={() => setActiveView('history')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 ${
              activeView === 'history'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            History
            {historyCount > 0 && (
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                activeView === 'history' ? 'bg-zinc-200 text-black' : 'bg-white/10 text-zinc-300'
              }`}>
                {historyCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          
          {/* AI Engine Status & Key Modal Trigger */}
          <button
            onClick={onOpenKeyModal}
            className={`px-3 py-1.5 text-xs font-mono rounded-full border transition-all flex items-center gap-1.5 ${
              hasCustomKey
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15'
                : 'border-white/10 bg-[#0c0c0e] text-zinc-400 hover:text-white hover:border-white/20'
            }`}
            title="Configure Google Gemini API Engine"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${hasCustomKey ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
            <Key className="w-3 h-3" />
            <span className="hidden sm:inline">
              {hasCustomKey ? 'Gemini 2.5' : 'Set AI Key'}
            </span>
          </button>

          {/* Sample Cases Trigger */}
          <button
            onClick={onOpenDemoModal}
            className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white rounded-full border border-white/10 hover:border-white/20 bg-[#0c0c0e] transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Examples</span>
          </button>

          {/* Primary CTA Button */}
          <button
            onClick={onResetToAnalyzer}
            className="px-4 py-1.5 text-xs font-medium rounded-full bg-white text-black hover:bg-zinc-200 transition-all flex items-center gap-1 shadow-sm"
          >
            <span>Analyze</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

      </div>

      {/* Mobile Bar */}
      <div className="flex md:hidden border-t border-white/[0.08] bg-[#050506] px-4 py-2 justify-around">
        <button
          onClick={() => setActiveView('analyze')}
          className={`text-xs py-1 px-2.5 rounded-full ${activeView === 'analyze' ? 'text-white font-medium bg-white/10' : 'text-zinc-400'}`}
        >
          Analyze
        </button>
        <button
          onClick={() => setActiveView('how-it-works')}
          className={`text-xs py-1 px-2.5 rounded-full ${activeView === 'how-it-works' ? 'text-white font-medium bg-white/10' : 'text-zinc-400'}`}
        >
          How It Works
        </button>
        <button
          onClick={() => setActiveView('security')}
          className={`text-xs py-1 px-2.5 rounded-full ${activeView === 'security' ? 'text-white font-medium bg-white/10' : 'text-zinc-400'}`}
        >
          Security
        </button>
        <button
          onClick={() => setActiveView('history')}
          className={`text-xs py-1 px-2.5 rounded-full flex items-center gap-1 ${activeView === 'history' ? 'text-white font-medium bg-white/10' : 'text-zinc-400'}`}
        >
          History
          {historyCount > 0 && <span className="text-[10px] font-mono text-zinc-300">({historyCount})</span>}
        </button>
      </div>
    </header>
  );
};
