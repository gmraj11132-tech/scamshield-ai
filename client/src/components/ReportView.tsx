import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  Info, 
  ExternalLink, 
  Copy, 
  Check, 
  Download, 
  RotateCcw, 
  Eye, 
  Bookmark, 
  Building2, 
  Globe, 
  Cpu, 
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';
import { AnalysisResult, FlaggedAnnotation, SignalSeverity } from '../types';

interface ReportViewProps {
  result: AnalysisResult;
  onAnalyzeAnother: () => void;
  onSaveToHistory: (result: AnalysisResult) => void;
  isSaved?: boolean;
}

export const ReportView: React.FC<ReportViewProps> = ({
  result,
  onAnalyzeAnother,
  onSaveToHistory,
  isSaved = false
}) => {
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [activeAnnotation, setActiveAnnotation] = useState<FlaggedAnnotation | null>(null);
  const [activeEvidenceTab, setActiveEvidenceTab] = useState<'local' | 'domain' | 'external' | 'meta'>('local');

  const getSeverityBadge = (severity: SignalSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      case 'HIGH':
        return 'bg-orange-500/10 text-orange-300 border-orange-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'LOW':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
    }
  };

  const getRiskStyle = () => {
    switch (result.riskLevel) {
      case 'CRITICAL':
      case 'HIGH':
        return {
          banner: 'border-rose-500/30 bg-rose-500/[0.04]',
          badge: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
          scoreText: 'text-rose-400',
          barColor: 'bg-rose-500',
          icon: <AlertOctagon className="w-5 h-5 text-rose-400" />
        };
      case 'ELEVATED':
      case 'MEDIUM':
        return {
          banner: 'border-amber-500/30 bg-amber-500/[0.04]',
          badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
          scoreText: 'text-amber-400',
          barColor: 'bg-amber-400',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />
        };
      case 'LOW':
      case 'NEGLIGIBLE':
      default:
        return {
          banner: 'border-emerald-500/30 bg-emerald-500/[0.04]',
          badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
          scoreText: 'text-emerald-400',
          barColor: 'bg-emerald-400',
          icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />
        };
    }
  };

  const riskStyle = getRiskStyle();

  const handleCopySummary = () => {
    const text = `[SCAMSHIELD AI THREAT REPORT]
Risk Level: ${result.riskLevel} (${result.riskScore}/100)
Confidence: ${result.confidence}
Signals Detected: ${result.signals.length}
${result.signals.map(s => `- [${s.severity}] ${s.name}: ${s.explanation}`).join('\n')}
Summary: ${result.assessmentSummary}
Engine: ${result.meta.engineVersion}`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scamshield-report-${result.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8 px-4 space-y-6 animate-in fade-in duration-200">
      
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Audit Report ID:
            </span>
            <span className="text-xs font-mono text-white bg-white/5 px-2 py-0.5 rounded border border-white/10">
              {result.id}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Timestamp: {new Date(result.timestamp).toLocaleString()} &bull; Input: {result.inputType.toUpperCase()}
          </p>
        </div>

        {/* Action Buttons - OpenAI Minimalist Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onSaveToHistory(result)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              isSaved 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                : 'bg-[#141418] hover:bg-white/5 border-white/10 text-zinc-300 hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{isSaved ? 'Saved in Vault' : 'Save Report'}</span>
          </button>

          <button
            onClick={handleCopySummary}
            className="px-3 py-1.5 rounded-full bg-[#141418] hover:bg-white/5 border border-white/10 text-zinc-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSummary ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleExportJson}
            className="px-3 py-1.5 rounded-full bg-[#141418] hover:bg-white/5 border border-white/10 text-zinc-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>

          <button
            onClick={onAnalyzeAnother}
            className="px-4 py-1.5 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-medium transition-colors flex items-center gap-1.5 ml-1 shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Analysis</span>
          </button>
        </div>
      </div>

      {/* 1. THREAT ASSESSMENT BANNER - OpenAI Minimalist Card */}
      <div className={`p-6 rounded-2xl border ${riskStyle.banner} shadow-2xl relative overflow-hidden bg-[#0c0c0e]`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Left Threat Indicator */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono font-medium tracking-widest text-zinc-400 uppercase">
                THREAT ASSESSMENT
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${riskStyle.badge}`}>
                {result.riskLevel} RISK
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-normal text-white tracking-tight leading-snug">
              {result.assessmentSummary}
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-zinc-400 pt-1">
              <span>Confidence: <strong className="text-zinc-200">{result.confidence}</strong></span>
              <span>&bull;</span>
              <span>Signals: <strong className="text-zinc-200">{result.signals.length}</strong></span>
              <span>&bull;</span>
              <span>Engine: <strong className="text-zinc-200">{result.meta.engineVersion}</strong></span>
              <span>&bull;</span>
              <span>Time: <strong className="text-zinc-200">{result.meta.processingTimeMs}ms</strong></span>
            </div>
          </div>

          {/* Right Risk Score Gauge */}
          <div className="flex md:flex-col items-center justify-center p-5 rounded-2xl bg-black/60 border border-white/10 min-w-[160px] text-center shrink-0">
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
              Risk Score
            </div>
            <div className={`text-4xl font-mono font-light ${riskStyle.scoreText}`}>
              {result.riskScore}
              <span className="text-sm text-zinc-500 font-normal"> / 100</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-3">
              <div 
                className={`h-full ${riskStyle.barColor} transition-all duration-500`}
                style={{ width: `${result.riskScore}%` }}
              />
            </div>
          </div>

        </div>

        {/* Disclaimer Note */}
        <div className="mt-4 pt-3.5 border-t border-white/[0.08] text-xs font-mono text-zinc-500 flex items-center gap-2">
          <Info className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
          <span>{result.disclaimer}</span>
        </div>
      </div>

      {/* OCR Text Inspector (if screenshot) */}
      {result.extractedText && (
        <div className="p-5 rounded-2xl bg-[#0c0c0e] border border-white/10">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-300 font-medium">
              <Eye className="w-4 h-4 text-zinc-400" />
              <span>TEXT EXTRACTED FROM SCREENSHOT</span>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">Neural OCR Verbatim Extraction</span>
          </div>
          <div className="p-3.5 rounded-xl bg-black/60 border border-white/5 font-mono text-xs text-zinc-300 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
            {result.extractedText}
          </div>
        </div>
      )}

      {/* Two Column Layout: SIGNALS & WHY FLAGGED */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 2. DETECTED SIGNALS PANEL */}
        <div className="p-6 rounded-2xl bg-[#0c0c0e] border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">
                DETECTED SIGNALS
              </h3>
              <p className="text-xs text-zinc-500">Identified deception vectors & patterns</p>
            </div>
            <span className="text-xs font-mono text-zinc-300 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
              {result.signals.length} {result.signals.length === 1 ? 'Signal' : 'Signals'}
            </span>
          </div>

          {result.signals.length === 0 ? (
            <div className="p-6 text-center text-zinc-500 font-mono text-xs">
              No elevated risk signals were triggered. Content aligns with standard communication patterns.
            </div>
          ) : (
            <div className="space-y-3">
              {result.signals.map((sig) => (
                <div 
                  key={sig.id}
                  className="p-3.5 rounded-xl bg-[#111115] border border-white/5 space-y-2 hover:border-white/15 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-white font-sans">
                      {sig.name}
                    </span>
                    <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${getSeverityBadge(sig.severity)}`}>
                      {sig.severity}
                    </span>
                  </div>
                  
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    {sig.explanation}
                  </p>

                  {sig.matchedSnippets && sig.matchedSnippets.length > 0 && (
                    <div className="pt-1.5 flex flex-wrap gap-1.5 border-t border-white/5">
                      <span className="text-[10px] font-mono text-zinc-500">Evidence:</span>
                      {sig.matchedSnippets.map((snip, i) => (
                        <span 
                          key={i} 
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 border border-white/10 text-zinc-300 truncate max-w-[280px]"
                        >
                          &quot;{snip}&quot;
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. WHY THIS WAS FLAGGED (Annotations) */}
        <div className="p-6 rounded-2xl bg-[#0c0c0e] border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">
                WHY THIS WAS FLAGGED
              </h3>
              <p className="text-xs text-zinc-500">Verbatim annotated content excerpts</p>
            </div>
            <span className="text-xs font-mono text-zinc-500">
              Interactive Inspector
            </span>
          </div>

          <div className="p-4 rounded-xl bg-black/60 border border-white/5 text-xs text-zinc-300 font-mono leading-relaxed max-h-80 overflow-y-auto whitespace-pre-wrap">
            {result.annotations.length === 0 ? (
              <span className="text-zinc-500 font-sans text-xs">
                No specific substrings were tagged as malicious.
              </span>
            ) : (
              <div className="space-y-2.5 font-sans">
                {result.annotations.map((ann) => (
                  <div
                    key={ann.id}
                    onClick={() => setActiveAnnotation(activeAnnotation?.id === ann.id ? null : ann)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      activeAnnotation?.id === ann.id
                        ? 'bg-white/10 border-white text-white'
                        : 'bg-[#141418] border-white/10 hover:border-white/25 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-white/10 text-white">
                        [{ann.tag}]
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {ann.severity}
                      </span>
                    </div>
                    <div className="font-mono text-xs font-medium text-white my-1">
                      &quot;{ann.text}&quot;
                    </div>
                    <div className="text-xs text-zinc-400 mt-1">
                      {ann.reason}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {activeAnnotation && (
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs font-sans">
              <div className="font-medium text-white mb-1">
                Contextual Inspection: [{activeAnnotation.tag}]
              </div>
              <p className="text-zinc-400 text-xs leading-relaxed">
                {activeAnnotation.reason}
              </p>
            </div>
          )}
        </div>

      </div>

      {/* 4. SAFE VERIFICATION & WHAT NOT TO DO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* SAFE VERIFICATION PROTOCOL */}
        <div className="p-6 rounded-2xl bg-[#0c0c0e] border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-mono uppercase tracking-wider text-white font-medium">
                SAFE VERIFICATION PROTOCOL
              </h3>
            </div>
            <span className="text-xs font-mono text-emerald-400/80">Recommended</span>
          </div>

          {/* Claimed Organization Advisory */}
          {result.verification.claimedOrganization?.isDetected && (
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-medium text-white">
                <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                <span>Claimed Entity: {result.verification.claimedOrganization.name}</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {result.verification.claimedOrganization.guidance}
              </p>
            </div>
          )}

          {/* Step-by-step verification list */}
          <div className="space-y-2.5">
            {result.verification.steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-[#111115] border border-white/5">
                <span className="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center font-mono text-[11px] font-medium shrink-0">
                  {idx + 1}
                </span>
                <span className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* WHAT NOT TO DO */}
        <div className="p-6 rounded-2xl bg-[#0c0c0e] border border-rose-500/20 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-rose-500/20">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-mono uppercase tracking-wider text-rose-300 font-medium">
                WHAT NOT TO DO
              </h3>
            </div>
            <span className="text-xs font-mono text-rose-400/80">Prohibited Actions</span>
          </div>

          <div className="space-y-2.5">
            {result.verification.doNotActions.map((action, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-rose-500/[0.03] border border-rose-500/10">
                <span className="text-rose-400 font-bold shrink-0 text-sm">&times;</span>
                <span className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {action}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 text-[11px] font-mono text-zinc-500">
            * This checklist reflects defensive cybersecurity standards to eliminate financial and credential exposure.
          </div>
        </div>

      </div>

      {/* 5. EVIDENCE PANEL */}
      <div className="p-6 rounded-2xl bg-[#0c0c0e] border border-white/10 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">
              EVIDENCE COMPILATION
            </h3>
            <p className="text-xs text-zinc-500">Local analysis & authenticated threat intelligence sources</p>
          </div>

          {/* Evidence sub-tabs */}
          <div className="inline-flex p-1 rounded-full bg-[#141418] border border-white/10 text-xs">
            <button
              onClick={() => setActiveEvidenceTab('local')}
              className={`px-3 py-1 rounded-full transition-colors ${
                activeEvidenceTab === 'local' ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Local Engine
            </button>
            {result.evidence.domainInformation && (
              <button
                onClick={() => setActiveEvidenceTab('domain')}
                className={`px-3 py-1 rounded-full transition-colors ${
                  activeEvidenceTab === 'domain' ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Domain Intel
              </button>
            )}
            <button
              onClick={() => setActiveEvidenceTab('external')}
              className={`px-3 py-1 rounded-full transition-colors ${
                activeEvidenceTab === 'external' ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              External Sources
            </button>
            <button
              onClick={() => setActiveEvidenceTab('meta')}
              className={`px-3 py-1 rounded-full transition-colors ${
                activeEvidenceTab === 'meta' ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Content Meta
            </button>
          </div>
        </div>

        {/* Tab 1: Local Analysis */}
        {activeEvidenceTab === 'local' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {result.evidence.localAnalysis.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#111115] border border-white/5 space-y-1">
                <div className="text-[11px] font-mono text-zinc-400 uppercase">{item.label}</div>
                <div className="text-xs font-mono font-medium text-white break-words">{item.value}</div>
                {item.detail && <div className="text-[11px] text-zinc-500 font-sans">{item.detail}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Domain Information */}
        {activeEvidenceTab === 'domain' && result.evidence.domainInformation && (
          <div className="space-y-3 font-mono text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[#111115] border border-white/5">
                <div className="text-zinc-500 text-[11px]">Hostname</div>
                <div className="text-white font-medium mt-0.5">{result.evidence.domainInformation.hostname}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#111115] border border-white/5">
                <div className="text-zinc-500 text-[11px]">TLD Extension</div>
                <div className="text-white font-medium mt-0.5">.{result.evidence.domainInformation.tld}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#111115] border border-white/5">
                <div className="text-zinc-500 text-[11px]">Protocol</div>
                <div className="text-white font-medium mt-0.5">{result.evidence.domainInformation.protocol}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: External Sources */}
        {activeEvidenceTab === 'external' && (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-[#111115] border border-white/5 text-xs text-zinc-400">
              <div className="font-mono text-white mb-1">External Reputation Status:</div>
              <p>{result.evidence.externalSources.disclaimer}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.evidence.externalSources.sources.map((src, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-[#111115] border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-white">{src.name}</div>
                    <div className="text-[11px] text-zinc-500 font-mono">{src.note}</div>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                    {src.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Content Metadata */}
        {activeEvidenceTab === 'meta' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-[#111115] border border-white/5">
              <div className="text-zinc-500 text-[11px]">Character Count</div>
              <div className="text-white font-medium text-sm mt-1">{result.evidence.userContentMetadata.characterCount}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#111115] border border-white/5">
              <div className="text-zinc-500 text-[11px]">Token Estimate</div>
              <div className="text-white font-medium text-sm mt-1">~{result.evidence.userContentMetadata.tokenEstimate}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#111115] border border-white/5">
              <div className="text-zinc-500 text-[11px]">Shannon Entropy</div>
              <div className="text-white font-medium text-sm mt-1">{result.evidence.userContentMetadata.entropyScore}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#111115] border border-white/5">
              <div className="text-zinc-500 text-[11px]">Extracted URLs</div>
              <div className="text-white font-medium text-sm mt-1">{result.evidence.userContentMetadata.extractedUrlCount}</div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
