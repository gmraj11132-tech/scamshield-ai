# ScamShield AI

> **Automated Multi-Vector Threat Intelligence & Cyber Deception Analysis**  
> *A high-precision cybersecurity verification tool engineered to dissect fraudulent messages, typosquatted URLs, deceptive screenshots, and spoofed emails.*

---

## Live Demo & Public Deployment

* **Live Web Application**: [https://gmraj11132-tech.github.io/scamshield-ai/](https://gmraj11132-tech.github.io/scamshield-ai/)
* **Engine Architecture**: Dual-Vector Neural (Google Gemini 2.5 Flash) + Deterministic Heuristics + Tesseract.js OCR
* **UI Design Language**: Minimalist Obsidian Dark theme inspired by modern Silicon Valley research labs ([OpenAI](https://openai.com), Anthropic, Linear).

---

## 1. Problem Statement & Real-World Impact

Digital fraud and social engineering have evolved from generic spam into highly targeted, cross-border psychological extortion schemes. Over **$1.02 trillion** was stolen globally in financial fraud last year. The primary victims are everyday consumers who lack access to specialized cybersecurity threat intelligence tools.

ScamShield AI addresses the most insidious real-world fraud vectors:

| Attack Vector | Attacker Tactic | ScamShield AI Forensic Detection |
| :--- | :--- | :--- |
| **Banking KYC / PAN Freeze** | Claims bank account or SIM will be deactivated tonight unless KYC is updated via an SMS link. | Identifies institutional identity claim without authentic domain verification, flags urgency manipulation, and triggers credential harvesting warnings. |
| **Electricity Disconnection Extortion** | Threatens immediate power shutoff at 9:30 PM due to an un-updated bill, demanding payment to an officer's personal number. | Recognizes utility board impersonation, artificial power cutoff coercion, and unauthorized peer-to-peer phone routing. |
| **Digital Arrest & Customs Seizure** | Extortionists claim an international parcel in the victim's name was seized containing MDMA / narcotics, threatening CBI / police arrest via video call. | Flags high-severity punitive coercion, fabricated law enforcement authority, and illegal digital statement intimidation. |
| **Prepaid Task & YouTube Rating Scams** | Freelance job offers promising \$50–\$300 daily for liking videos or reviewing hotels, requiring a Telegram VIP recharge deposit. | Detects advance-fee task fraud patterns, unrealistic ROI promises, and deposit-locking mechanisms. |
| **QR Code / UPI Reversal Trick** | Scammers send a QR code claiming "Scan QR code to receive money / claim cashback", prompting for a UPI PIN. | Evaluates payment direction logic: flags that entering PIN or scanning QR codes debits money rather than credits it. |
| **Domain Typosquatting & Punycode** | Lookalike URLs (e.g. `paypal-security-update.click`, `chase-auth.top`) designed to mimic authentic banking login portals. | Performs Shannon entropy analysis, subdomain decomposition, brand Levenshtein distance checks, and flags high-abuse TLDs. |
| **Malicious APK Delivery** | Attackers instruct users on WhatsApp to download `.apk` updates to "protect their phone" or "claim subsidies". | Identifies sideloading file signatures and warns against installing unsigned Android packages. |

---

## 2. Core Architecture & Capabilities

ScamShield AI operates on a **defense-in-depth dual-engine architecture**:

```
                       ┌────────────────────────────────────────┐
                       │          User Input Ingestion          │
                       │  (Message / URL / Screenshot / Email)  │
                       └──────────────────┬─────────────────────┘
                                          │
                  ┌───────────────────────┴────────────────────────┐
                  ▼                                                ▼
     ┌────────────────────────┐                       ┌────────────────────────┐
     │ Deterministic Engine   │                       │ Neural Intelligence    │
     │ 50+ Pattern Rules      │                       │ Gemini 2.5 Flash       │
     │ Shannon Entropy Calc   │                       │ Deep Context & Semantics│
     │ URL Domain Tree Parser │                       │ Multimodal Vision OCR  │
     └────────────┬───────────┘                       └────────────┬───────────┘
                  │                                                │
                  └───────────────────────┬────────────────────────┘
                                          ▼
                       ┌────────────────────────────────────────┐
                       │       70/30 Hybrid Risk Blending       │
                       │     Calibrated Score (0 - 100)         │
                       │     Strict Non-Fabrication Policy      │
                       └──────────────────┬─────────────────────┘
                                          │
            ┌─────────────────────────────┼─────────────────────────────┐
            ▼                             ▼                             ▼
   [ Threat Assessment ]         [ Detected Signals ]         [ Safe Verification ]
   Calibrated Score Gauge        Categorized Indicators       Actionable Checklist
   Confidence Level              Verbatim Evidence Snippets   "WHAT NOT TO DO"
```

### Key Technical Pillars

1. **Dual-Engine Text Understanding**:
   - **Google Gemini 2.5 Flash**: Evaluates conversational subtext, psychological coercion, and sophisticated multilingual fraud schemes.
   - **Deterministic Heuristic Rules**: 50+ regex and behavioral rules running in parallel to catch high-speed signatures with zero latency.
   - **70/30 Blending**: Combines neural semantic evaluation with deterministic rules for resilient, calibrated scoring.

2. **Dual-Engine OCR for Screenshots**:
   - **Primary**: Gemini 2.5 Flash Multimodal Vision extracts all visible text, warnings, timestamps, and URLs from image uploads.
   - **Embedded Offline OCR**: [Tesseract.js](https://tesseract.projectnaptha.com/) runs 100% locally in-memory — ensuring screenshot analysis functions reliably even with zero external API keys!

3. **Domain Deconstruction & Typosquatting Engine**:
   - Decomposes target URLs into protocol, subdomain, registered domain, and TLD.
   - Checks brand registries for target mimicry across 25+ international and regional brands (PayPal, Chase, Wells Fargo, SBI, HDFC, FedEx, DHL, Apple, Microsoft, Amazon).
   - Flags suspicious high-abuse TLDs (`.top`, `.xyz`, `.click`, `.buzz`, `.club`, `.work`).
   - Detects URL shorteners (`bit.ly`, `tinyurl`, `t.co`) that disguise malicious endpoints.

4. **Strict Non-Fabrication Policy**:
   - ScamShield AI never fakes external security reputation scores. If VirusTotal or Google Safe Browsing API keys are absent, results are transparently labeled as `"Local analysis"`.
   - Never outputs definitive absolutes like *"This is 100% a scam"*; uses standard cybersecurity language: *"High-risk indicators detected"*.

---

## 3. UI/UX Design System

Engineered with a **code-editor, research-lab aesthetic** inspired by [OpenAI](https://openai.com) and modern cybersecurity consoles:

* **Dark-First Palette**: Deep Obsidian Black (`#050506`), flat dark surfaces (`#0c0c0e`, `#111115`), hairline borders (`border-white/10`).
* **OpenAI Signature Elements**:
  - High-contrast solid white rounded pill buttons (`bg-white text-black hover:bg-zinc-200`).
  - Segmented horizontal tab bar (`[ Message ] [ URL ] [ Screenshot ] [ Email ]`).
  - Restrained severity indicators: subtle rose, orange, amber, and emerald badge fills with low opacity to prevent visual fatigue.
  - Interactive **"Why This Was Flagged"** inspector with clickable verbatim highlighted chips.
  - In-app **API Key Modal** allowing users to plug in their Google Gemini API key or use built-in offline analysis.

---

## 4. Project Structure

```
scamshield-ai/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Automated GitHub Pages CI/CD workflow
├── client/                     # React 18 + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx             # Obsidian navbar with Gemini status
│   │   │   ├── Hero.tsx               # Minimalist editorial hero section
│   │   │   ├── AnalyzerWorkspace.tsx  # 4-tab analysis workspace
│   │   │   ├── AnalysisProgress.tsx   # Step-by-step terminal execution
│   │   │   ├── ReportView.tsx         # Executive cybersecurity threat report
│   │   │   ├── HistoryView.tsx        # Local browser vault history
│   │   │   ├── HowItWorksView.tsx     # Technical pipeline documentation
│   │   │   ├── SecurityPrivacyView.tsx# Data handling & privacy disclosures
│   │   │   ├── DemoModal.tsx          # Real-world test scenario picker
│   │   │   ├── ApiKeyModal.tsx        # Gemini API Key configuration
│   │   │   └── Footer.tsx             # Standard legal disclaimer & navigation
│   │   ├── services/
│   │   │   ├── api.ts                 # Dual-mode API fetcher
│   │   │   └── client-analyzer.ts     # Standalone in-browser fallback engine
│   │   ├── types.ts                   # Frontend TypeScript interfaces
│   │   └── index.css                  # Tailwind styles & anti-aliased font
│   ├── tailwind.config.js
│   └── vite.config.ts
├── server/                     # Express + TypeScript Threat Engine Backend
│   ├── src/
│   │   ├── engines/
│   │   │   ├── analyzer.ts            # Master analysis coordinator
│   │   │   ├── gemini-ai-engine.ts    # Google Gemini 2.5 Flash neural client
│   │   │   ├── ocr-service.ts         # Dual-engine OCR (Gemini + Tesseract.js)
│   │   │   ├── input-parser.ts        # Shannon entropy & entity extraction
│   │   │   ├── url-analyzer.ts        # Typosquatting & domain deconstruction
│   │   │   ├── signal-engine.ts       # 50+ deterministic heuristic rules
│   │   │   ├── risk-engine.ts         # Compounding risk factor calculations
│   │   │   ├── annotator.ts           # Character-level substring tagging
│   │   │   ├── evidence-engine.ts     # Transparent evidence compilation
│   │   │   └── recommendation-engine.ts# Actionable verification checklists
│   │   ├── routes/
│   │   │   ├── analyze.ts             # REST endpoints (/message, /url, /screenshot, /email, /test-key)
│   │   │   ├── health.ts              # Health & features status
│   │   │   └── demo.ts                # Real-world scenario presets
│   │   ├── tests/
│   │   │   └── analyzer.test.ts       # Automated Node.js test suite (9/9 pass)
│   │   └── index.ts                   # Express server entry point
│   ├── tsconfig.json
│   └── package.json
├── .gitignore
├── package.json                # Monorepo root scripts
└── README.md
```

---

## 5. Getting Started (Local Development)

### Prerequisites

* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/gmraj11132-tech/scamshield-ai.git
   cd scamshield-ai
   ```

2. **Install all dependencies**:
   ```bash
   # Install server dependencies
   cd server && npm install

   # Install client dependencies
   cd ../client && npm install
   ```

3. **Configure Environment Variables (Optional)**:
   Create a `.env` file in the `server` directory:
   ```bash
   cd ../server
   cp .env.example .env
   ```
   Add your Google Gemini API key:
   ```env
   PORT=3001
   GEMINI_API_KEY=AIzaSy...
   ```
   *(Note: ScamShield AI functions seamlessly without any API key using embedded Tesseract OCR and deterministic heuristics).*

4. **Run Automated Test Suite**:
   ```bash
   cd server
   npm test
   ```
   All 9 automated unit and integration tests will execute and pass.

5. **Start Development Servers**:
   ```bash
   # In terminal 1 (Backend API):
   cd server
   npm run dev

   # In terminal 2 (Frontend Client):
   cd client
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

6. **Production Build & Execution**:
   ```bash
   # Build client SPA
   cd client && npm run build

   # Build server
   cd ../server && npm run build

   # Run unified server (serves API + built client SPA on port 3001)
   npm start
   ```
   Open `http://localhost:3001`.

---

## 6. API Reference

| Endpoint | Method | Payload | Description |
| :--- | :--- | :--- | :--- |
| `/api/health` | `GET` | None | Returns server health, uptime, and engine capabilities. |
| `/api/demo-samples` | `GET` | None | Retrieves 7 curated real-world scam test scenarios. |
| `/api/analyze/message` | `POST` | `{ content, depth?, language? }` | Analyzes SMS, chat, or raw text for social engineering. |
| `/api/analyze/url` | `POST` | `{ url, depth? }` | Deconstructs domain, TLD abuse, and typosquatting. |
| `/api/analyze/screenshot` | `POST` | `multipart/form-data` (`screenshot`, `depth?`) | Extracts text via OCR (Tesseract / Gemini) and analyzes threat. |
| `/api/analyze/email` | `POST` | `{ from, subject, body, headers?, depth? }` | Evaluates sender domain spoofing and email body threats. |
| `/api/analyze/test-key` | `POST` | `{ apiKey }` | Pings Google Gemini API to validate user credentials. |

---

## 7. Privacy & Security Disclosures

* **Zero Persistent Storage**: Submitted text, URLs, and images are processed ephemerally in volatile memory. No user content or telephone numbers are written to external databases.
* **Local Vault**: Scan history is retained strictly in the user's browser `localStorage`. Users can export or clear history at any time.
* **Educational Purpose**: ScamShield AI provides automated probabilistic assessments and educational verification guidance. It does not replace certified incident response or legal counsel.

---

## 8. License

Distributed under the **MIT License**. See `LICENSE` for details.
