# Kalam Notes (कलम)

> **Turn lectures and mentor sessions into handwritten notebook pages you can verify against what was spoken.**

Kalam Notes is an intelligent lecture transcription and structured notebook application designed to transcribe spoken dialogue and transform sessions into handwritten-style digital notes with verifiable audio citations.

---

## 📖 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Handwritten Notes Interface](#handwritten-notes-interface)
- [Environment Configuration](#environment-configuration)
- [Getting Started](#getting-started)
- [Security & Privacy](#security--privacy)
- [License](#license)

---

## 🎯 Overview

Attending fast-paced lectures, workshops, or mentor calls often makes it difficult to actively participate while simultaneously maintaining neat, structured notes.

**Kalam Notes provides:**
- **Verifiable Citations:** Notes are directly linked to timestamps in the source audio, allowing you to instantly replay the exact moment a concept was discussed.
- **Categorized Review:** Spoken material is systematically organized into logical note sections and actionable follow-ups rather than unstructured walls of text.
- **Realistic Notebook Visuals:** Notes are presented on ruled digital paper with cursive typography, hand-drawn diagrams, highlights, and margin stickies.

---

## 🌟 Key Features

- **Audio Capture & Ingestion:** In-browser audio recording with real-time waveform feedback, or audio file upload.
- **Structured Knowledge Organization:** Sessions are automatically segmented into concise thematic topics with corresponding notes and follow-up prompts.
- **Synchronized Audio Player:** Scrubbable timeline with topic checkpoints, active speaker display, and one-tap timestamp seeking.
- **Interactive Editing:** Edit topics and notes directly on the page, with automatic persistence.
- **Export Options:** Export notebook pages as print-ready PDF or high-resolution images.

---

## 🖋️ Handwritten Notes Interface

The notebook view replicates an authentic physical notebook:
- **Ruled Paper Canvas:** Classic notebook paper styling with red margin guidelines.
- **Typography & Aesthetics:** Cursive handwriting fonts with subtle organic baseline variation.
- **Sketch Figures & Annotations:** Hand-drawn diagrams, boxed mathematical expressions, and animated annotations.
- **Follow-up Stickies:** Distinctive margin sticky notes for questions and action items.

---

## 🔑 Environment Configuration

All credentials and service configurations are managed strictly via environment variables. **No secret keys or identifiers are hardcoded in the codebase.**

Refer to `.env.example` for all configurable variables:

```bash
# Server configuration
PORT=3000
PYTHON_PORT=5001
APP_ENV=development
APP_URL=http://localhost:3000

# AI & Speech Services
GEMINI_API_KEY=
SARVAM_API_KEY=
SARVAM_API_BASE_URL=https://api.sarvam.ai

# Relational Database
DATABASE_PATH=./data/kalam_notes.db

# Quotas and Defaults
MAX_AUDIO_UPLOAD_SIZE_MB=500
DAILY_AUDIO_LIMIT_MINUTES=120
DEFAULT_NOTES_LANGUAGE=English
DEFAULT_SPOKEN_LANGUAGE=Auto-detect

# Firebase Client Configuration (Optional / Client-side)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_DATABASE_ID=
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Python 3.10+
- npm or bun

### 1. Clone the repository
```bash
git clone https://github.com/your-username/kalam-notes.git
cd kalam-notes
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
```bash
cp .env.example .env
# Fill in any required credentials in your local .env file
```

### 4. Run the development server
```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

---

## 🛡️ Security & Privacy

- **Speaker Consent:** Recording or uploading audio requires explicit speaker agreement confirmation before processing.
- **Zero Hardcoded Secrets:** All API keys and sensitive tokens are resolved exclusively from environment variables.
- **Data Isolation:** User sessions and notes are protected by strict ownership checks and client-side isolation rules.
- **Local Persistence & Private Sync:** Audio buffers are ephemeral and processed in-stream, with optional private storage sync.

---

## 📄 License

Apache License 2.0. See [LICENSE](LICENSE) for details.
