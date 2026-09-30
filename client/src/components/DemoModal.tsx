import React from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { DemoSample } from '../types';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  samples: DemoSample[];
  onSelectSample: (sample: DemoSample, autoRun?: boolean) => void;
}

export const DemoModal: React.FC<DemoModalProps> = ({
  isOpen,
  onClose,
  samples,
  onSelectSample
}) => {
  if (!isOpen) return null;

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
      case 'HIGH':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      case 'ELEVATED':
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'LOW':
      case 'NEGLIGIBLE':
      default:
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl rounded-2xl bg-[#0c0c0e] border border-white/10 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-modal-title"
      >
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] bg-[#09090b] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-zinc-300" />
            <h2 id="demo-modal-title" className="text-sm font-mono font-medium text-white uppercase tracking-wider">
              REAL TEST SCENARIOS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Subheader */}
        <div className="px-6 py-2.5 bg-white/[0.02] border-b border-white/[0.05] text-[11px] font-mono text-zinc-400">
          Curated scenarios replicating common banking phishing, electricity extortion, digital arrest, and task scams.
        </div>

        {/* Samples List */}
        <div className="p-6 overflow-y-auto space-y-3">
          {samples.map((sample) => (
            <div
              key={sample.id}
              className="p-4 rounded-xl bg-[#111115] border border-white/5 hover:border-white/15 transition-colors space-y-2.5 group"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-white">
                    {sample.title}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-white/5 border border-white/10 text-zinc-400">
                    {sample.type}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border ${getRiskBadge(sample.expectedRisk)}`}>
                  {sample.expectedRisk}
                </span>
              </div>

              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                {sample.explanation}
              </p>

              <div className="p-2.5 rounded-lg bg-black/60 border border-white/5 font-mono text-[11px] text-zinc-300 truncate">
                {sample.previewText}
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => {
                    onSelectSample(sample, false);
                    onClose();
                  }}
                  className="px-3 py-1.5 text-xs rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-colors"
                >
                  Load in Workspace
                </button>
                <button
                  onClick={() => {
                    onSelectSample(sample, true);
                    onClose();
                  }}
                  className="px-4 py-1.5 text-xs font-medium rounded-full bg-white text-black hover:bg-zinc-200 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span>Analyze</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-white/[0.08] bg-[#09090b] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium rounded-full border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
