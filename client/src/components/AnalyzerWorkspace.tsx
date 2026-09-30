import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Link2, 
  Image as ImageIcon, 
  Mail, 
  ArrowRight, 
  UploadCloud, 
  FileText, 
  AlertCircle, 
  Sparkles,
  X,
  SlidersHorizontal,
  Check
} from 'lucide-react';
import { InputType, DemoSample } from '../types';

interface AnalyzerWorkspaceProps {
  onAnalyze: (payload: {
    type: InputType;
    content: string;
    depth: 'standard' | 'deep';
    language?: string;
    file?: File;
    emailFields?: { from?: string; subject?: string; body?: string; headers?: string };
  }) => void;
  demoSamples: DemoSample[];
  selectedDemo?: DemoSample | null;
  onClearDemo?: () => void;
}

export const AnalyzerWorkspace: React.FC<AnalyzerWorkspaceProps> = ({
  onAnalyze,
  demoSamples,
  selectedDemo,
  onClearDemo
}) => {
  const [activeTab, setActiveTab] = useState<InputType>('message');
  const [messageContent, setMessageContent] = useState('');
  const [urlContent, setUrlContent] = useState('');
  const [depth, setDepth] = useState<'standard' | 'deep'>('standard');
  const [language, setLanguage] = useState('auto');
  
  // Screenshot states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Email states
  const [emailFrom, setEmailFrom] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailHeaders, setEmailHeaders] = useState('');
  const [showEmailHeaders, setShowEmailHeaders] = useState(false);

  // Error alert
  const [validationError, setValidationError] = useState<string | null>(null);

  // Handle preset injection when a demo sample is selected
  useEffect(() => {
    if (selectedDemo) {
      setActiveTab(selectedDemo.type);
      setValidationError(null);

      if (selectedDemo.type === 'message') {
        setMessageContent(selectedDemo.fullContent);
      } else if (selectedDemo.type === 'url') {
        setUrlContent(selectedDemo.fullContent);
      } else if (selectedDemo.type === 'email' && selectedDemo.emailFields) {
        setEmailFrom(selectedDemo.emailFields.from || '');
        setEmailSubject(selectedDemo.emailFields.subject || '');
        setEmailBody(selectedDemo.emailFields.body || '');
      }
    }
  }, [selectedDemo]);

  // Handle paste screenshot from clipboard
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (activeTab !== 'screenshot') return;
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/')) {
          handleImageFile(file);
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [activeTab]);

  const handleImageFile = (file: File) => {
    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      setValidationError('Unsupported file type. Please upload a PNG, JPG, or WEBP image.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setValidationError('Image size exceeds 10MB limit.');
      return;
    }
    setValidationError(null);
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setValidationError(null);

    if (activeTab === 'message') {
      if (!messageContent.trim()) {
        setValidationError('Please paste or type a suspicious message to analyze.');
        return;
      }
      onAnalyze({
        type: 'message',
        content: messageContent.trim(),
        depth,
        language: language === 'auto' ? undefined : language
      });
    } else if (activeTab === 'url') {
      if (!urlContent.trim()) {
        setValidationError('Please enter a valid URL.');
        return;
      }
      onAnalyze({
        type: 'url',
        content: urlContent.trim(),
        depth
      });
    } else if (activeTab === 'screenshot') {
      if (!selectedFile) {
        setValidationError('Please drop or select a screenshot image to analyze.');
        return;
      }
      onAnalyze({
        type: 'screenshot',
        content: selectedFile.name,
        depth,
        file: selectedFile
      });
    } else if (activeTab === 'email') {
      if (!emailBody.trim() && !emailSubject.trim()) {
        setValidationError('Please provide at least a subject or email body to analyze.');
        return;
      }
      onAnalyze({
        type: 'email',
        content: emailBody.trim() || emailSubject.trim(),
        depth,
        emailFields: {
          from: emailFrom.trim() || undefined,
          subject: emailSubject.trim() || undefined,
          body: emailBody.trim() || undefined,
          headers: emailHeaders.trim() || undefined
        }
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };

  const charCount = messageContent.length;
  const tokenEstimate = Math.ceil(charCount / 4);

  return (
    <div id="analyzer-section" className="w-full max-w-4xl mx-auto my-10 px-4">
      
      {/* Workspace Card - OpenAI Surface Design */}
      <div className="rounded-2xl bg-[#0c0c0e] border border-white/10 shadow-2xl overflow-hidden">
        
        {/* Workspace Top Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#09090b]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white" />
              <h2 className="text-xs font-mono font-medium tracking-widest text-zinc-300 uppercase">
                ANALYZE CONTENT
              </h2>
            </div>
            <p className="text-xs text-zinc-500 font-sans mt-0.5">
              Dual-vector neural reasoning & deterministic pattern parser
            </p>
          </div>

          {/* Quick Demo Case Inserter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 hidden md:inline font-mono">Sample:</span>
            <select
              aria-label="Load demo sample"
              className="text-xs bg-[#141418] border border-white/10 rounded-lg px-3 py-1.5 text-zinc-300 hover:text-white focus:outline-none focus:border-white/30 transition-colors"
              onChange={(e) => {
                const sample = demoSamples.find(s => s.id === e.target.value);
                if (sample) {
                  setActiveTab(sample.type);
                  if (sample.type === 'message') setMessageContent(sample.fullContent);
                  if (sample.type === 'url') setUrlContent(sample.fullContent);
                  if (sample.type === 'email' && sample.emailFields) {
                    setEmailFrom(sample.emailFields.from || '');
                    setEmailSubject(sample.emailFields.subject || '');
                    setEmailBody(sample.emailFields.body || '');
                  }
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>Load test scenario...</option>
              {demoSamples.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab Selection Bar - OpenAI Segmented Pill */}
        <div className="px-6 pt-5 pb-3 bg-[#0a0a0c] border-b border-white/[0.05]">
          <div className="inline-flex p-1 rounded-full bg-[#141418] border border-white/10 gap-1">
            
            <button
              onClick={() => { setActiveTab('message'); setValidationError(null); }}
              className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 ${
                activeTab === 'message'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Message</span>
            </button>

            <button
              onClick={() => { setActiveTab('url'); setValidationError(null); }}
              className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 ${
                activeTab === 'url'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>URL</span>
            </button>

            <button
              onClick={() => { setActiveTab('screenshot'); setValidationError(null); }}
              className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 ${
                activeTab === 'screenshot'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Screenshot</span>
            </button>

            <button
              onClick={() => { setActiveTab('email'); setValidationError(null); }}
              className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 ${
                activeTab === 'email'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </button>

          </div>
        </div>

        {/* Validation Warning Alert */}
        {validationError && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Active Tab Work Area */}
        <div className="p-6 bg-[#0a0a0c]">
          
          {/* TAB 1: MESSAGE */}
          {activeTab === 'message' && (
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  rows={7}
                  value={messageContent}
                  onChange={(e) => {
                    setMessageContent(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Paste a suspicious SMS, WhatsApp, Telegram, or payment request message here..."
                  className="w-full bg-[#111115] border border-white/10 focus:border-white/30 rounded-xl p-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none transition-colors code-editor-font leading-relaxed resize-y"
                />
              </div>

              {/* Quick sample pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-zinc-500 font-mono">Try real scam:</span>
                {demoSamples.filter(s => s.type === 'message').slice(0, 4).map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setMessageContent(s.fullContent)}
                    className="text-[11px] font-sans px-2.5 py-1 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-zinc-300 transition-colors"
                  >
                    {s.title.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: URL */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                  Target URL to Analyze
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={urlContent}
                    onChange={(e) => {
                      setUrlContent(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="https://chase-security-verify.top/login"
                    className="w-full bg-[#111115] border border-white/10 focus:border-white/30 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none transition-colors font-mono"
                  />
                </div>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Deconstructs hostname entropy, brand typosquatting, TLD abuse risk, and homoglyphic punycode encoding.
              </p>
            </div>
          )}

          {/* TAB 3: SCREENSHOT */}
          {activeTab === 'screenshot' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleImageFile(e.target.files[0]);
                  }
                }}
              />

              {!selectedFile ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                    dragActive
                      ? 'border-white bg-white/5'
                      : 'border-white/10 hover:border-white/20 bg-[#111115]/50'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-zinc-300">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-medium text-white mb-1">
                    Drop screenshot here or <span className="underline text-zinc-300">Choose File</span>
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono mb-3">
                    PNG, JPG, WEBP &bull; Max 10MB &bull; Or paste directly from clipboard (Ctrl+V)
                  </p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-zinc-400">
                    <Sparkles className="w-3 h-3 text-zinc-400" />
                    <span>OCR Powered: Tesseract.js (Offline) + Gemini Vision</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#111115] border border-white/10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Screenshot thumbnail"
                        className="w-14 h-14 rounded-lg object-cover border border-white/10 shrink-0"
                      />
                    )}
                    <div className="overflow-hidden">
                      <p className="text-xs font-medium text-white truncate">{selectedFile.name}</p>
                      <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                        {(selectedFile.size / 1024).toFixed(1)} KB &bull; Image Ready for OCR
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearFile}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: EMAIL */}
          {activeTab === 'email' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-400">From (Sender Header)</label>
                  <input
                    type="text"
                    value={emailFrom}
                    onChange={(e) => setEmailFrom(e.target.value)}
                    placeholder="support@paypal-security.com or paypal@gmail.com"
                    className="w-full bg-[#111115] border border-white/10 focus:border-white/30 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none transition-colors font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-400">Subject</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Urgent: Your account has been suspended"
                    className="w-full bg-[#111115] border border-white/10 focus:border-white/30 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-zinc-400">Email Body</label>
                <textarea
                  rows={5}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Paste the email body text..."
                  className="w-full bg-[#111115] border border-white/10 focus:border-white/30 rounded-xl p-3.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none transition-colors code-editor-font leading-relaxed resize-y"
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setShowEmailHeaders(!showEmailHeaders)}
                  className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <span>{showEmailHeaders ? '[-] Hide Raw Headers' : '[+] Add Raw Email Headers (DKIM, SPF, Received)'}</span>
                </button>
                {showEmailHeaders && (
                  <textarea
                    rows={3}
                    value={emailHeaders}
                    onChange={(e) => setEmailHeaders(e.target.value)}
                    placeholder="Received: from mail.attacker.net ... DKIM-Signature: ..."
                    className="w-full mt-2 bg-[#111115] border border-white/10 focus:border-white/30 rounded-lg p-3 text-[11px] text-zinc-300 font-mono placeholder:text-zinc-600 focus:outline-none"
                  />
                )}
              </div>
            </div>
          )}

        </div>

        {/* Workspace Bottom Controls & Action Bar */}
        <div className="px-6 py-4 border-t border-white/[0.08] bg-[#09090b] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Metadata & Controls */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-500">
            {activeTab === 'message' && (
              <span>
                {charCount} chars &bull; ~{tokenEstimate} tokens
              </span>
            )}

            {/* Depth Selector */}
            <div className="flex items-center gap-2">
              <span>Depth:</span>
              <div className="inline-flex rounded-full bg-[#141418] border border-white/10 p-0.5">
                <button
                  type="button"
                  onClick={() => setDepth('standard')}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] transition-colors ${
                    depth === 'standard' ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Standard
                </button>
                <button
                  type="button"
                  onClick={() => setDepth('deep')}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] transition-colors ${
                    depth === 'deep' ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Deep Neural
                </button>
              </div>
            </div>
          </div>

          {/* Main Action Button - OpenAI Signature Solid Pill */}
          <button
            type="button"
            onClick={() => handleSubmit()}
            className="px-6 py-2.5 rounded-full bg-white text-black font-medium text-xs hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 group shadow-md"
          >
            <span>
              {activeTab === 'url' ? 'Analyze URL' : activeTab === 'screenshot' ? 'Extract & Analyze' : 'Analyze Threat'}
            </span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>

        </div>

      </div>
    </div>
  );
};
