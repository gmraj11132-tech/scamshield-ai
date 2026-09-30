import React from 'react';
import { History, Trash2, Download, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import { HistoryItem, AnalysisResult } from '../types';

interface HistoryViewProps {
  items: HistoryItem[];
  onSelectResult: (result: AnalysisResult) => void;
  onClearHistory: () => void;
  onExportHistory: () => void;
  onGoToAnalyze: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  items,
  onSelectResult,
  onClearHistory,
  onExportHistory,
  onGoToAnalyze
}) => {
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
    <div className="w-full max-w-5xl mx-auto my-12 px-4 space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/[0.08] gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-400 mb-3">
            <span>ISOLATED BROWSER VAULT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-normal text-white tracking-tight">
            Local Analysis History
          </h1>
          <p className="text-xs text-zinc-400 font-sans mt-1">
            Persisted strictly in browser memory. Records never leave your local machine.
          </p>
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={onExportHistory}
              className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
            <button
              onClick={onClearHistory}
              className="px-3.5 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        )}
      </div>

      {/* History Items Table / List */}
      {items.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0c0c0e] border border-white/10 space-y-4">
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-zinc-500">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">No analysis records in local vault</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
              Evaluations you generate will automatically be retained here for local retrieval.
            </p>
          </div>
          <button
            onClick={onGoToAnalyze}
            className="px-5 py-2 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-medium transition-all"
          >
            Start First Analysis
          </button>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#0c0c0e] border border-white/10 shadow-2xl overflow-hidden divide-y divide-white/[0.06]">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectResult(item.fullResult)}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] cursor-pointer transition-colors group"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border ${getRiskBadge(item.riskLevel)}`}>
                    {item.riskLevel} &bull; {item.riskScore}/100
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-white/5 border border-white/10 text-zinc-400">
                    {item.inputType}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500">
                    {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-xs font-sans text-white font-medium truncate">
                  {item.summary}
                </div>
                <div className="text-[11px] font-mono text-zinc-500 truncate max-w-xl">
                  {item.preview}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 group-hover:text-white shrink-0 transition-colors">
                <span>View Full Report</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
