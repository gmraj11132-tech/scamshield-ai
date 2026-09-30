import React, { useEffect, useState } from 'react';
import { Terminal, Check, Circle, Loader2, Cpu } from 'lucide-react';
import { InputType } from '../types';
import { getStoredGeminiKey } from '../services/api';

interface AnalysisProgressProps {
  inputType: InputType;
  onSequenceComplete?: () => void;
}

interface StepItem {
  id: string;
  label: string;
  detail: string;
}

const STEPS: StepItem[] = [
  { id: 'parse', label: 'Parsing content & linguistic structure', detail: 'Tokenization, entropy calculation, zero-width detection' },
  { id: 'signals', label: 'Detecting social-engineering indicators', detail: 'Urgency, coercion, credential extraction, remote access' },
  { id: 'url', label: 'Deconstructing URLs & domain heuristics', detail: 'TLD risk, punycode check, brand typosquatting, shorteners' },
  { id: 'ai', label: 'Executing dual-vector intelligence engine', detail: 'Deterministic rules + Gemini neural reasoning model' },
  { id: 'risk', label: 'Building calibrated risk assessment', detail: 'Compounding factor calculation, score calibration' },
  { id: 'recs', label: 'Compiling safe verification protocol', detail: 'Actionable guidance, brand matching, prohibited actions' },
];

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  inputType,
  onSequenceComplete
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const hasKey = !!getStoredGeminiKey();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          if (onSequenceComplete) {
            setTimeout(onSequenceComplete, 350);
          }
          return prev;
        }
      });
    }, 360);

    return () => clearInterval(interval);
  }, [onSequenceComplete]);

  return (
    <div className="w-full max-w-2xl mx-auto my-8 p-6 rounded-2xl bg-[#0c0c0e] border border-white/10 shadow-2xl">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-mono font-medium tracking-wider text-white uppercase">
              Analyzing Input &bull; Pipeline Execution
            </h2>
            <p className="text-[11px] font-mono text-zinc-400">
              Mode: {inputType.toUpperCase()} &bull; Engine: {hasKey ? 'Gemini 2.5 + Deterministic' : 'Deterministic Heuristic Core'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-zinc-300">
          <Loader2 className="w-3 h-3 animate-spin text-white" />
          <span>RUNNING</span>
        </div>
      </div>

      {/* Terminal Command Line */}
      <div className="my-4 px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/5 font-mono text-xs text-zinc-300 flex items-center gap-2">
        <span className="text-zinc-500">$</span>
        <span>scamshield analyze --type={inputType} --engine={hasKey ? 'hybrid-gemini' : 'heuristic'} --verify=strict</span>
      </div>

      {/* Step Sequence List */}
      <div className="space-y-2.5 font-mono text-xs">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div 
              key={step.id}
              className={`flex items-start gap-3 p-2.5 rounded-xl transition-colors ${
                isCurrent ? 'bg-white/5 border border-white/10 text-white' :
                isDone ? 'text-zinc-300' : 'text-zinc-600'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : isCurrent ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <Circle className="w-4 h-4 text-zinc-700" />
                )}
              </div>

              <div className="flex-1 font-sans">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${isCurrent ? 'text-white' : isDone ? 'text-zinc-200' : 'text-zinc-500'}`}>
                    {step.label}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {isDone ? '[DONE]' : isCurrent ? '[PROCESSING]' : '[PENDING]'}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                  {step.detail}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transparency Note */}
      <div className="mt-5 pt-3.5 border-t border-white/[0.08] flex items-center gap-2 text-[11px] font-mono text-zinc-400">
        <Cpu className="w-3.5 h-3.5 text-zinc-400" />
        <span>Strict privacy mode: Only verified indicators are compiled. No fabricated scores.</span>
      </div>

    </div>
  );
};
