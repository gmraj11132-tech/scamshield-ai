import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AnalyzerWorkspace } from './components/AnalyzerWorkspace';
import { AnalysisProgress } from './components/AnalysisProgress';
import { ReportView } from './components/ReportView';
import { HistoryView } from './components/HistoryView';
import { HowItWorksView } from './components/HowItWorksView';
import { SecurityPrivacyView } from './components/SecurityPrivacyView';
import { DemoModal } from './components/DemoModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { Footer } from './components/Footer';
import { 
  analyzeMessage, 
  analyzeUrl, 
  analyzeScreenshot, 
  analyzeEmail, 
  fetchDemoSamples, 
  checkHealth,
  getFallbackDemoSamples 
} from './services/api';
import { 
  getHistory, 
  saveToHistory, 
  clearHistory, 
  exportHistoryAsJson 
} from './utils/storage';
import { 
  AnalysisResult, 
  DemoSample, 
  HistoryItem, 
  InputType 
} from './types';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'analyze' | 'history' | 'how-it-works' | 'security'>('analyze');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pendingResult, setPendingResult] = useState<AnalysisResult | null>(null);
  const [currentInputType, setCurrentInputType] = useState<InputType>('message');
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [demoSamples, setDemoSamples] = useState<DemoSample[]>([]);
  const [selectedDemo, setSelectedDemo] = useState<DemoSample | null>(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [serverOnline, setServerOnline] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [, setKeyUpdateCounter] = useState(0);

  // Load history and demo samples on startup
  useEffect(() => {
    setHistoryItems(getHistory());

    checkHealth().then(res => {
      setServerOnline(res.status === 'operational');
    });

    fetchDemoSamples().then(samples => {
      if (samples && samples.length > 0) {
        setDemoSamples(samples);
      } else {
        setDemoSamples(getFallbackDemoSamples());
      }
    });
  }, []);

  // Save report to local history
  const handleSaveToHistory = useCallback((res: AnalysisResult) => {
    saveToHistory(res);
    setHistoryItems(getHistory());
  }, []);

  // Clear history
  const handleClearHistory = useCallback(() => {
    if (window.confirm('Clear all local analysis records from browser memory?')) {
      clearHistory();
      setHistoryItems([]);
    }
  }, []);

  // Export history
  const handleExportHistory = useCallback(() => {
    exportHistoryAsJson();
  }, []);

  // Start analysis trigger
  const handleStartAnalyze = async (payload: {
    type: InputType;
    content: string;
    depth: 'standard' | 'deep';
    language?: string;
    file?: File;
    emailFields?: { from?: string; subject?: string; body?: string; headers?: string };
  }) => {
    setErrorMessage(null);
    setCurrentInputType(payload.type);
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setPendingResult(null);

    try {
      let result: AnalysisResult;
      if (payload.type === 'message') {
        result = await analyzeMessage(payload.content, payload.depth, payload.language);
      } else if (payload.type === 'url') {
        result = await analyzeUrl(payload.content, payload.depth);
      } else if (payload.type === 'screenshot' && payload.file) {
        result = await analyzeScreenshot(payload.file, payload.depth);
      } else if (payload.type === 'email' && payload.emailFields) {
        result = await analyzeEmail(payload.emailFields, payload.depth);
      } else {
        throw new Error('Unsupported analysis request parameters.');
      }

      setPendingResult(result);
      handleSaveToHistory(result);
    } catch (err: unknown) {
      console.error('Analysis error:', err);
      setIsAnalyzing(false);
      setErrorMessage(err instanceof Error ? err.message : 'Analysis could not be completed.');
    }
  };

  const handleSequenceComplete = () => {
    if (pendingResult) {
      setAnalysisResult(pendingResult);
      setIsAnalyzing(false);
      setPendingResult(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectDemoSample = (sample: DemoSample, autoRun = false) => {
    setSelectedDemo(sample);
    setActiveView('analyze');
    setAnalysisResult(null);
    setErrorMessage(null);

    if (autoRun) {
      if (sample.type === 'message') {
        handleStartAnalyze({ type: 'message', content: sample.fullContent, depth: 'standard' });
      } else if (sample.type === 'url') {
        handleStartAnalyze({ type: 'url', content: sample.fullContent, depth: 'standard' });
      } else if (sample.type === 'email' && sample.emailFields) {
        handleStartAnalyze({
          type: 'email',
          content: sample.fullContent,
          depth: 'standard',
          emailFields: sample.emailFields
        });
      }
    } else {
      setTimeout(() => {
        const el = document.getElementById('analyzer-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleResetToAnalyzer = () => {
    setActiveView('analyze');
    setAnalysisResult(null);
    setIsAnalyzing(false);
    setPendingResult(null);
    setSelectedDemo(null);
    setErrorMessage(null);
    setTimeout(() => {
      const el = document.getElementById('analyzer-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050506] text-zinc-100 selection:bg-white/20 selection:text-white">
      
      {/* Primary Navigation */}
      <Navbar
        activeView={activeView}
        setActiveView={(view) => {
          setActiveView(view);
          if (view !== 'analyze') {
            setAnalysisResult(null);
          }
        }}
        historyCount={historyItems.length}
        onOpenDemoModal={() => setIsDemoModalOpen(true)}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
        onResetToAnalyzer={handleResetToAnalyzer}
        serverOnline={serverOnline}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* VIEW 1: ANALYZE */}
        {activeView === 'analyze' && (
          <div>
            {!analysisResult && !isAnalyzing && (
              <Hero
                onAnalyzeClick={() => {
                  const el = document.getElementById('analyzer-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                onHowItWorksClick={() => setActiveView('how-it-works')}
                onOpenDemo={() => setIsDemoModalOpen(true)}
              />
            )}

            {/* Error Banner */}
            {errorMessage && (
              <div className="max-w-4xl mx-auto my-4 px-4">
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between font-sans">
                  <span>{errorMessage}</span>
                  <button 
                    onClick={() => setErrorMessage(null)}
                    className="underline text-rose-400 hover:text-white ml-4 font-mono"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Progress Screen */}
            {isAnalyzing && (
              <AnalysisProgress
                inputType={currentInputType}
                onSequenceComplete={handleSequenceComplete}
              />
            )}

            {/* Security Report View */}
            {analysisResult && !isAnalyzing && (
              <ReportView
                result={analysisResult}
                onAnalyzeAnother={() => {
                  setAnalysisResult(null);
                  setSelectedDemo(null);
                }}
                onSaveToHistory={handleSaveToHistory}
                isSaved={historyItems.some(h => h.id === analysisResult.id)}
              />
            )}

            {/* Workspace */}
            {!analysisResult && !isAnalyzing && (
              <AnalyzerWorkspace
                onAnalyze={handleStartAnalyze}
                demoSamples={demoSamples}
                selectedDemo={selectedDemo}
                onClearDemo={() => setSelectedDemo(null)}
              />
            )}
          </div>
        )}

        {/* VIEW 2: HISTORY */}
        {activeView === 'history' && (
          <HistoryView
            items={historyItems}
            onSelectResult={(res) => {
              setAnalysisResult(res);
              setActiveView('analyze');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onClearHistory={handleClearHistory}
            onExportHistory={handleExportHistory}
            onGoToAnalyze={() => setActiveView('analyze')}
          />
        )}

        {/* VIEW 3: HOW IT WORKS */}
        {activeView === 'how-it-works' && (
          <HowItWorksView
            onGoToAnalyze={() => setActiveView('analyze')}
          />
        )}

        {/* VIEW 4: SECURITY & PRIVACY */}
        {activeView === 'security' && (
          <SecurityPrivacyView />
        )}

      </main>

      {/* Demo Modal Drawer */}
      <DemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        samples={demoSamples}
        onSelectSample={handleSelectDemoSample}
      />

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onKeySaved={() => setKeyUpdateCounter(c => c + 1)}
      />

      {/* Footer */}
      <Footer onNavigate={(view) => setActiveView(view)} />

    </div>
  );
};

export default App;
