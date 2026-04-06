# NeuroRead — AI-Powered Reading Accessibility Platform

**NeuroRead** is an adaptive reading platform designed to support dyslexic learners of all ages. It combines real-time text simplification, word-level TTS synchronisation, and a full adaptive learning engine powered by Bayesian Knowledge Tracing (BKT), Item Response Theory (IRT), and SM-2 Spaced Repetition.

---

## What it actually does

| Mode | What it does |
|---|---|
| **Assistive Mode** | Pastes any complex text → AI simplifies it → reads aloud word by word with phoneme color coding for b/d/p/q |
| **Learning Mode** | Adaptive exercises (phonics, spelling, comprehension) that update skill estimates after every answer using BKT |
| **Practice Mode** | SM-2 spaced-repetition review queue that surfaces only the skills you're about to forget |

Everything the user sees (font, size, colour overlay, reading speed) is controlled through a single Accessibility Panel, persisted to `localStorage`.

---

## How to run

### Prerequisites
- Python 3.11+
- Node.js 18+
- A Groq API key (free at https://console.groq.com)

### 1. Backend

```bash
cd ai-accessibility-assistant-main/backend

# Copy and fill in your API key
cp .env.example .env
# Edit .env and set GROQ_API_KEY=...

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API will be live at `http://localhost:8000`.  
Verify with: `curl http://localhost:8000/health`

### 2. Frontend

```bash
cd ai-accessibility-assistant-main/ai-accessibility-assistant-frontend-main

npm install
npm run dev
```

The app will open at `http://localhost:5173`.

### 3. Running tests

```bash
cd ai-accessibility-assistant-main
pip install pytest

pytest tests/test_bkt.py -v
pytest tests/test_simplification.py -v
```

---

## Architecture

```
/backend          FastAPI Python backend
  /app
    /ml           BKT, IRT, SM-2, ZPD, Exercise Generator
    /routes       API route handlers
    /services     Simplification, TTS, OCR, LLM client
  session_store.py  Redis/in-memory session state

/frontend (ai-accessibility-assistant-frontend-main)
  /src
    /components   React UI components
    /stores       Zustand state (accessibilityStore)
    /styles       accessibility.css

/tests            pytest unit tests
```

---

## Key API endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Returns `{"status": "ok", "version": "2.0"}` |
| POST | `/simplify` | Simplify text with Groq LLM |
| POST | `/assistive/chunk` | Split text into sentence chunks |
| POST | `/assistive/annotate` | Get per-character phoneme colour annotations |
| POST | `/api/learning/session/start` | Start an adaptive learning session |
| POST | `/api/learning/session/{id}/answer` | Submit an answer, get BKT update |
| GET | `/api/learning/session/{id}/skills` | Get current skill P(know) values |
| GET | `/api/learning/session/{id}/recommend` | Get next SM-2-scheduled exercise |

---

## Research references

| Model | Reference |
|---|---|
| **BKT** (Bayesian Knowledge Tracing) | Corbett, A. T., & Anderson, J. R. (1994). Knowledge tracing: Modeling the acquisition of procedural knowledge. *User Modeling and User-Adapted Interaction*, 4(4), 253–278. |
| **IRT** (Item Response Theory) | Lord, F. M. (1952). *A Theory of Test Scores*. Psychometric Monograph No. 7. Richmond, VA: Psychometric Corporation. |
| **ZPD** (Zone of Proximal Development) | Vygotsky, L. S. (1978). *Mind in Society: The Development of Higher Psychological Processes*. Cambridge, MA: Harvard University Press. |
| **Colour overlays** | Wilkins, A. J. (2004). *Reading Through Colour*. London: Wiley. |
| **SM-2 Spaced Repetition** | Wozniak, P. A. (1987). Optimization of learning. MSc thesis, University of Economics, Poznań. SuperMemo algorithm. |
| **Phonological awareness** | Snowling, M. J., & Hulme, C. (2011). Evidence-based interventions for reading and language difficulties. *Journal of Child Psychology and Psychiatry*, 52(4), 381–392. |

---

## Demo path (3 minutes)

1. **00:00** — Open app, complete onboarding (age 8, "Reading words aloud" + "Spelling").
2. **00:30** — Assistive Mode: paste medical jargon, click Simplify, enable colour overlay + coloured letters + chunk reading, press play, watch TTS highlight each word.
3. **01:30** — Learning Mode → Adaptive AI tab: answer a phonics exercise, watch the b/d Distinction skill bar animate up, press **J+K** to open Judge Mode with raw BKT JSON.
4. **02:30** — Practice Mode → AI-Powered Review: complete ~3 exercise queue, see "Next review: in 6 days" (SM-2), view session summary.
5. **03:00** — Open Accessibility Panel, switch to OpenDyslexic, increase font size to 20px, apply Cream overlay.

---

## License

MIT
