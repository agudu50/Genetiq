# Genetiq + Gemma AI — Implementation & Pitch Guide

> **One-liner:** Genetiq is a Ghana-focused digital health twin that uses local Google Gemma AI for symptom triage, lab-result interpretation, and personalized action plans — with offline fallbacks so it still works when connectivity or GPU resources are limited.

---

## Table of Contents

1. [How Gemma Is Implemented](#how-gemma-is-implemented)
2. [Architecture](#architecture)
3. [Layer Breakdown](#layer-breakdown)
4. [Dev & Deployment](#dev--deployment)
5. [Pitch for Judges (2–3 min)](#pitch-for-judges-23-min)
6. [Pitch for Technical Team (5–10 min)](#pitch-for-technical-team-510-min)
7. [FAQ — Anticipated Questions](#faq--anticipated-questions)
8. [Suggested Slide Outline](#suggested-slide-outline)
9. [Honest Framing](#honest-framing)

---

## How Gemma Is Implemented

Genetiq integrates Google Gemma through a **three-tier architecture**:

```
React UI  →  GemmaService.ts  →  FastAPI (Python)  →  Gemma model (Hugging Face)
                    ↓ (fallback)
             Offline Simulator + Local OCR Parser
```

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **UI** | `TriageWidget`, `AIAssistant`, `ImportOrUpload`, `PlanWidget` | User-facing chat, lab upload, action plans, 3D twin |
| **Service** | `client/src/App/Services/GemmaService.ts` | Health checks, API calls, CPU/GPU routing, fallbacks |
| **API** | `server/gemma/server.py` | FastAPI endpoints, model loading, prompt orchestration |
| **Inference** | `server/gemma/inference.py` | Chat template formatting, `model.generate()` |
| **Prompts** | `server/gemma/prompts.py` | Ghana-tuned system prompts with structured JSON outputs |

---

## Architecture

```mermaid
flowchart TB
    subgraph UI["React Frontend"]
        TW[TriageWidget / AI Chat]
        UP[Lab Upload / Scanner]
        PW[Plan Widget]
        DT[3D Digital Twin]
        NB[Navbar AI Status]
    end

    subgraph Service["GemmaService.ts"]
        HC[Health Check Cache]
        CH[chatWithGemma]
        AN[analyzeLabResults]
        AP[generateActionPlan]
        SIM[Offline Simulator]
    end

    subgraph API["FastAPI — server/gemma/server.py :8000"]
        H[/api/gemma/health]
        C[/api/gemma/chat]
        A[/api/gemma/analyze]
        P[/api/gemma/action-plan]
        T[/api/gemma/translate]
    end

    subgraph ML["Inference Layer"]
        PR[prompts.py — Ghana-tuned system prompts]
        INF[inference.py — chat template + generate]
        MD[(Gemma model via Hugging Face)]
    end

    TW --> CH
    UP --> AN
    PW --> AP
    CH --> HC
    AN --> HC
    AP --> HC
    HC --> H
    CH --> C
    AN --> A
    AP --> P
    C --> PR --> INF --> MD
    A --> PR --> INF --> MD
    P --> PR --> INF --> MD
    CH -.->|CPU / offline| SIM
    AN -.->|CPU / offline| SIM
    CH --> DT
    AN --> DT
    NB --> HC
```

---

## Layer Breakdown

### Layer 1 — Python AI Server (`server/gemma/`)

| File | Role |
|------|------|
| `server.py` | FastAPI app, model loading, REST endpoints |
| `inference.py` | Formats chat messages, runs `model.generate()` |
| `prompts.py` | Ghana-specific system prompts (JSON-structured outputs) |
| `requirements.txt` | PyTorch, Transformers, FastAPI, Pillow |

**Model loading:**

- Uses Hugging Face `AutoModelForCausalLM` + `AutoProcessor` (designed for Gemma 4's multimodal path)
- Authenticated download via `HF_TOKEN` in `server/.env`
- Model ID configured via `GEMMA_MODEL` env var
- **Current default:** `google/gemma-2-2b-it` on CPU (practical for development machines)
- **Designed for:** `google/gemma-4-*` when a GPU server is available

**API endpoints:**

| Endpoint | Purpose |
|----------|---------|
| `GET /api/gemma/health` | Is the model loaded? CPU or GPU? Vision support? |
| `POST /api/gemma/chat` | Symptom triage → JSON with urgency + body system |
| `POST /api/gemma/analyze` | Lab photo/text → health score, findings, recommendations |
| `POST /api/gemma/action-plan` | Personalized follow-up / supplements / lifestyle plan |
| `POST /api/gemma/translate` | Health text → Twi, Ga, Ewe, Fante |

### Layer 2 — Frontend Service (`client/src/App/Services/GemmaService.ts`)

Single service layer the UI calls. It handles:

1. **Health polling** — checks `/api/gemma/health` every 15 seconds
2. **Smart routing** — GPU vs CPU vs offline
3. **Fallbacks** — never leaves the user hanging

**Resilience strategy:**

| Scenario | What happens |
|----------|--------------|
| **GPU + model loaded** | Real Gemma inference for chat, analyze, action plan |
| **CPU + model loaded** | Lab analysis uses OCR + local parser (instant); chat uses rule-based triage simulator (CPU Gemma is too slow for real-time chat) |
| **Server down / no internet** | Offline simulator with Ghana-specific symptom logic |
| **Text-only model (2B)** | Photos go through browser OCR first, then text is sent to Gemma |

**Connection status** is surfaced via `useGemmaConnection` hook:

- `Gemma AI live` — server up, model loaded
- `Gemma AI live (CPU)` — model loaded on CPU (fast-path mode)
- `Offline mode` — using simulator

### Layer 3 — UI Integration

| Feature | File(s) | What Gemma drives |
|---------|---------|-------------------|
| **AI Chat / Triage** | `TriageWidget.tsx`, `AIAssistant.tsx` | Symptom → urgency (Green/Yellow/Red) + advice |
| **3D Twin zoom** | `TriageWidget` → Redux `setCategory` | `bodySystem` from Gemma highlights the right body region |
| **Lab Scanner** | `ImportOrUpload.tsx` | Upload photo → findings + health score + plain-language summary |
| **Action Plan** | `PlanWidget` via `generateActionPlan()` | Follow-up care, supplements, lifestyle from lab + profile |
| **Connection badge** | `useGemmaConnection.ts`, `Navbar.tsx` | Live / offline status indicator |
| **Languages** | Twi, Ga, Ewe, Fante | Prompts + translation endpoint |

### Layer 4 — Ghana-Specific Intelligence (`prompts.py`)

Prompts are not generic health advice. They encode:

- **Local diseases:** malaria, typhoid, anemia, sickle cell, UTI, hypertension, diabetes
- **Local care path:** CHPS compounds for non-emergency; 112/193 for emergencies
- **Local remedies:** Kontomire, Sobolo, Moringa, Neem, ORS, Koko — always paired with "see a doctor"
- **Structured JSON output** so the UI can render cards, scores, and twin highlights reliably

Example chat output schema:

```json
{
  "message": "<response to user>",
  "bodySystem": "<Hematology|Gastroenterolgy|Pulmonology|...>",
  "urgency": "<Green|Yellow|Red>",
  "condition": "<suspected condition>",
  "system": "<medical system name>"
}
```

---

## Dev & Deployment

### Local development

```bash
# Frontend only (no Gemma — uses offline simulator)
cd client && npm run dev

# Frontend + Gemma AI server together
cd client && npm run dev:ai

# Gemma server only
cd client && npm run gemma
```

### Environment setup

1. Copy `server/.env.example` → `server/.env`
2. Add your Hugging Face token: `HF_TOKEN=hf_...`
3. Optionally set model: `GEMMA_MODEL=google/gemma-2-2b-it`

### Networking

| Environment | How API is reached |
|-------------|-------------------|
| **Dev** | Vite proxy: `/api/gemma` → `http://localhost:8000` |
| **Production** | Set `VITE_GEMMA_URL=https://your-gemma-api.example.com` at Vercel build time |

> **Note:** Vercel hosts only the React frontend. The Gemma Python server must be deployed separately (Railway, Fly.io, RunPod, etc.).

### Production checklist

- [ ] Host `server/gemma` on a GPU cloud instance
- [ ] Set `VITE_GEMMA_URL` on Vercel (or your frontend host)
- [ ] Set `GEMMA_MODEL=google/gemma-4-4B-it` (or larger) on the GPU server
- [ ] Optional: Dockerize the Gemma server
- [ ] Rotate `HF_TOKEN` if ever exposed
- [ ] Load-test `/api/gemma/analyze` with real lab images

---

## Pitch for Judges (2–3 min)

### Opening — The Problem

> "In Ghana, millions rely on CHPS compounds and understaffed clinics. Patients receive lab results they can't read, in a language they may not fully understand, often with poor internet. Genetiq closes that gap."

### Solution — What Gemma Enables

> "We built Genetiq — a digital health twin powered by **Google Gemma running locally**. Patients describe symptoms or photograph a lab sheet. Gemma triages urgency, explains results in plain English, suggests Ghanaian foods and remedies, and can respond in **Twi, Ga, Ewe, and Fante**. The 3D body model lights up the affected system — so users *see* where the problem is, not just read jargon."

### Why Local AI Matters

> "Cloud AI fails in rural Ghana. Our architecture runs Gemma on-device or on a local server — **no patient data leaves the community**, and it works offline with intelligent fallbacks."

### Demo Flow (live or recorded)

1. Open dashboard → show **"Gemma AI live"** badge
2. Chat: *"I have fever, chills, and headache"* → malaria triage, **Red/Yellow urgency**, Hematology twin highlight
3. Upload lab photo → health score, findings, recommendations in plain language
4. Switch language to Twi → localized response
5. Show emergency tab → Ghana numbers (112, CHPS guidance)

### Closing — Impact

> "Genetiq doesn't replace doctors — it extends CHPS capacity: faster triage, clearer lab explanations, and culturally relevant guidance, available 24/7 even when connectivity isn't."

---

## Pitch for Technical Team (5–10 min)

### 1. Design Philosophy

- **Separation of concerns:** React UI → `GemmaService` → FastAPI → `inference.py`
- **Prompt-as-API:** Gemma returns strict JSON; UI doesn't parse free text
- **Graceful degradation:** GPU → CPU fast path → offline simulator

### 2. Gemma 4 vs What Runs Today

The codebase is **architected for Gemma 4** (multimodal, `AutoProcessor`, vision lab scans).

**Currently deployed locally:** `google/gemma-2-2b-it` on CPU because:

- Gemma 4 12B is too heavy for CPU inference
- 2B is cached, loads reliably, and works for text-based tasks

**Upgrade path:** set `GEMMA_MODEL=google/gemma-4-4B-it` (or 12B) on a GPU server → vision + faster chat without code changes.

### 3. Performance Tradeoffs

| Decision | Why |
|----------|-----|
| CPU chat → simulator | Gemma on CPU = minutes per reply; simulator = instant triage |
| CPU analyze → OCR + parser | Avoids "Analysing…" hanging for 10+ minutes |
| Health keyword gate | Stops casual messages from hitting slow inference |
| Token caps on CPU | `estimate_chat_max_tokens()` / `estimate_analyze_max_tokens()` |

### 4. Security & Compliance

- `HF_TOKEN` in `server/.env` (gitignored) — gated model access
- Patient images processed locally, not sent to third-party APIs
- Disclaimers in every prompt: AI guidance, not diagnosis
- Urgency levels (Green/Yellow/Red) drive when to escalate to hospital

### 5. Key Files Reference

```
client/
  src/App/Services/GemmaService.ts    # Frontend AI service layer
  src/App/Hooks/useGemmaConnection.ts # Connection status hook
  src/Features/Dashboard/TriageWidget/  # Dashboard chat widget
  src/Views/Dashboard/Logs/AIAssistant.tsx  # Full AI portal
  src/Views/UploadMethod/ImportOrUpload/    # Lab scanner
  vite.config.ts                      # Dev proxy to :8000

server/gemma/
  server.py       # FastAPI app + endpoints
  inference.py    # Model generate() helpers
  prompts.py      # Ghana-tuned system prompts
  requirements.txt
```

---

## FAQ — Anticipated Questions

| Question | Answer |
|----------|--------|
| **Why Gemma 4?** | Open, efficient, multimodal, runs on edge; fits low-resource settings better than huge cloud models |
| **How accurate is it?** | Triage + education tool, not a diagnostic device; always directs to CHPS/hospital for confirmation |
| **Works offline?** | Yes — offline simulator + local OCR parser; full Gemma when server is reachable |
| **Why not ChatGPT API?** | Cost, latency, privacy, and no internet in rural areas |
| **Multilingual how?** | Language param on every request + translation endpoint + localized prompt copy |
| **How does the 3D twin connect?** | Gemma returns `bodySystem` → Redux updates category → Three.js zooms to that system |
| **Is patient data sent to Google?** | No — inference runs on your local/server Gemma instance via Hugging Face weights |

---

## Suggested Slide Outline

1. **Problem** — literacy, language, connectivity in Ghanaian healthcare
2. **Solution** — Genetiq + local Gemma AI
3. **Architecture diagram** — (use mermaid diagram above)
4. **Demo screenshots** — chat triage, lab results, 3D twin, languages
5. **Technical depth** — prompts, JSON API, fallbacks, edge deployment
6. **Impact & roadmap** — CHPS integration, Gemma 4 GPU deploy, wider language support

---

## Honest Framing

Don't oversell "full Gemma 4 multimodal on every laptop." Recommended pitch line:

> "We built a **Gemma-native health stack** — architected for Gemma 4 multimodal inference, currently running Gemma 2B on CPU for development, with a clear GPU upgrade path and robust offline fallbacks for real-world Ghanaian connectivity."

This reads as engineering maturity, not a limitation.

---

## Related Documentation

- [Main README](./README.md) — project overview and setup
- [server/.env.example](./server/.env.example) — environment variable template
