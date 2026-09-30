import React from 'react';
import { ArrowRight, Sparkles, AlertCircle, Globe, ShieldAlert, Cpu } from 'lucide-react';

interface HeroProps {
  onAnalyzeClick: () => void;
  onHowItWorksClick: () => void;
  onOpenDemo: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onAnalyzeClick,
  onHowItWorksClick,
  onOpenDemo,
}) => {
  return (
    <section className="relative pt-16 pb-20 border-b border-white/[0.08] overflow-hidden">
      
      {/* Subtle radial ambient glow */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none blur-3xl" 
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Category Pill Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-zinc-300 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>CYBERSECURITY INTELLIGENCE &bull; NEURAL &bull; DETERMINISTIC</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-normal text-white tracking-tight leading-[1.1] mb-6 max-w-4xl mx-auto">
          Don’t trust the message.<br />
          <span className="text-zinc-400 font-light">Verify the signals.</span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-400 leading-relaxed font-normal mb-10">
          Automated multi-vector threat intelligence for deceptive messages, suspicious URLs, fraudulent screenshots, and spoofed emails.
        </p>

        {/* CTAs - OpenAI Design Style */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
          <button
            onClick={onAnalyzeClick}
            className="px-6 py-3 rounded-full bg-white text-black font-medium text-sm hover:bg-zinc-200 transition-all flex items-center gap-2 group shadow-lg shadow-white/5"
          >
            <span>Analyze Something</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={onHowItWorksClick}
            className="px-6 py-3 rounded-full bg-[#0c0c0e] hover:bg-white/5 border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white text-sm font-medium transition-all"
          >
            See How It Works
          </button>

          <button
            onClick={onOpenDemo}
            className="px-5 py-3 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white text-xs font-mono transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
            <span>Try Examples</span>
          </button>
        </div>

        {/* Realistic Security-Analysis Interface Preview - Editorial Style */}
        <div className="text-left max-w-3xl mx-auto rounded-2xl bg-[#0c0c0e] border border-white/10 shadow-2xl overflow-hidden">
          
          {/* Window Bar */}
          <div className="bg-[#09090b] px-4 py-3 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
              <span className="text-xs font-mono text-zinc-400 ml-2">
                ScamShield Core 3.0 &bull; threat-telemetry.log
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[11px] font-mono rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300">
                CRITICAL &bull; 92 / 100
              </span>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-5 font-mono text-xs space-y-4 bg-[#0a0a0c]">
            
            {/* Input Segment */}
            <div className="text-zinc-300 bg-black/50 p-3.5 rounded-xl border border-white/5 leading-relaxed">
              <span className="text-zinc-500 select-none">$ input &gt; </span>
              &quot;[CHASE-ALERT]: Unauthorized transaction of $842.10 detected. Your account will be locked within 30 minutes. Verify at: https://chase-auth-security.top/login&quot;
            </div>

            {/* Signal Preview Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-zinc-300 font-sans">
              
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                  <div className="text-xs font-medium text-white">Urgency Manipulation</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">30-minute artificial deadline detected</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Globe className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="text-xs font-medium text-white">Typosquatting Domain</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">Mimics Chase on disposable .top TLD</div>
                </div>
              </div>

            </div>

            {/* Status Footer */}
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-2 border-t border-white/5">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <Cpu className="w-3.5 h-3.5 text-zinc-400" />
                Dual-Engine: Deterministic + Neural Parser Active
              </span>
              <span>Confidence: High</span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
