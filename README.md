# ExceeLearn 🎓

> **An AI-powered student learning companion that models your evolving knowledge state and delivers personalized, actionable guidance to improve learning outcomes.**

ExceeLearn combines **Retrieval-Augmented Generation (RAG)**, a **three-agent AI system**, and a **spaced repetition memory model (FSRS)** to help students understand what they know, what they don't, and exactly what to do next.

---

## 📽️ Demo Video

>(https://youtu.be/zDf56Db8Hq0?si=WLg7Amb0RsdA749U)  

---

## 🧪 Testbench

The `testbench/` folder contains everything judges need to run and verify the project:

```
excelearn/testbench/
├── README.md                              ← Quick start overview
├── SETUP.md                               ← Full step-by-step setup guide
└── sample_data/
    ├── fsrs_state_test@test.com.json      ← Pre-loaded 27-chapter FSRS student history
    ├── backend.env.example                ← Backend environment variable template
    └── frontend.env.example               ← Frontend environment variable template
```

👉 **[Start here → testbench/SETUP.md](./testbench/SETUP.md)**


Live Link for quick access : https://excelearn-1c00e.web.app/

> **Demo account:** Log in with `test@test.com` (any password) to see a pre-loaded student with 6 weeks of realistic quiz history, visible memory decay, and chapter mastery contrast across all 5 subjects.

---

## 📁 Repository Structure

```
excelearn/
├── README.md                     ← You are here
├── index.html                    ← Vite entry point
├── package.json                  ← Frontend dependencies
├── vite.config.js                ← Vite build config
├── tailwind.config.js            ← Tailwind CSS config
├── postcss.config.js
├── firebase.json                 ← Firebase Hosting config
├── .firebaserc                   ← Firebase project binding
├── .env.local                    ← Frontend env vars (see setup)
│
├── src/
│   ├── App.jsx                   ← Root component + error boundary
│   ├── main.jsx                  ← React entry point
│   ├── index.css                 ← Global styles
│   ├── firebase.js               ← Firebase app init
│   ├── assets/
│   ├── components/
│   │   ├── AppLayout.jsx         ← Main dashboard shell + sidebar
│   │   ├── HomeCanvas.jsx        ← Dashboard home (exams, mastery, stats)
│   │   ├── SubjectView.jsx       ← Per-subject chapters, radar, quiz
│   │   ├── AgentDock.jsx         ← AI agent chat dock (Analyse/Plan/Mentor)
│   │   ├── QuizSimulator.jsx     ← Interactive quiz + FSRS feedback
│   │   ├── SmartTimer.jsx        ← Study session timer with fatigue alerts
│   │   ├── StudyPlanModal.jsx    ← AI-generated day-by-day study plans
│   │   ├── KnowledgeRadar.jsx    ← SVG radar chart of chapter mastery
│   │   ├── ActivityHeatmap.jsx   ← 16-week study activity heatmap
│   │   ├── AchievementsPanel.jsx ← Gamified achievement badges
│   │   ├── UploadModal.jsx       ← PDF upload + RAG indexing UI
│   │   └── LoginView.jsx         ← Email-based login screen
│   ├── contexts/
│   │   ├── AuthContext.jsx       ← User session management
│   │   └── TimerContext.jsx      ← Global timer state
│   ├── data/
│   │   └── subjectData.js        ← Seeded subject/chapter data
│   ├── lib/
│   │   └── utils.js
│   └── components/ui/            ← Reusable UI primitives (badge, button, progress)
│
└── backend/
    ├── main.py                   ← FastAPI application (all API endpoints)
    ├── requirements.txt          ← Python dependencies
    ├── Dockerfile                ← Container build for Cloud Run
    ├── .dockerignore
    ├── .env                      ← Backend env vars (see setup)
    └── services/
        ├── azure_search.py       ← Vector indexing + hybrid search (Azure AI Search)
        ├── blob_storage.py       ← PDF storage (Azure Blob Storage)
        ├── firebase_auth.py      ← User ID extraction from request headers
        ├── gemini.py             ← Gemini LLM + embedding client
        └── stability.py          ← FSRS spaced repetition memory model
```

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **Three AI Agents** | Analyse (diagnose gaps), Plan (study schedule), Mentor (concept explanation) |
| **RAG Pipeline** | Upload lecture PDFs → chunked → embedded → hybrid vector+keyword search → grounded answers |
| **FSRS Memory Model** | Spaced repetition tracking Stability (S), Retrievability (R), Difficulty (D) per chapter |
| **Smart Timer** | Study session timer with cognitive fatigue alerts at 90 min; updates FSRS on session end |
| **Knowledge Radar** | SVG radar chart visualizing chapter-level mastery across all subjects |
| **Quiz Simulator** | Interactive quizzes that feed results into the FSRS model in real time |
| **Study Plan Generator** | Day-by-day exam prep plan prioritized by chapter criticality and exam proximity |
| **Activity Heatmap** | 16-week GitHub-style heatmap of study activity with gap detection |
| **Achievements System** | Gamified badges for streaks, mastery milestones, and study hours |

---

## 🛠️ Tech Stack

### Frontend
- **React 19** + Vite 7
- **Tailwind CSS 3** (dark mode, custom design system)
- **Lucide React** (icons)
- **Radix UI** (accessible primitives)
- **Firebase Hosting** (deployment)

### Backend
- **FastAPI** + Uvicorn (Python 3.11)
- **Google Gemini** (`gemini-2.5-flash-lite` for generation, `gemini-embedding-001` for 3072-dim embeddings)
- **Azure AI Search** (vector + BM25 hybrid search index)
- **Azure Blob Storage** (PDF document storage)
- **FSRS Algorithm** (custom implementation in `stability.py`)
- **Firestore** (production persistence) / JSON fallback (local dev)
- **Docker** (containerized for Cloud Run)

---

## ⚙️ Setup & Installation

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18 or higher
- [Python](https://www.python.org/) 3.11 or higher
- [pip](https://pip.pypa.io/)
- [Git](https://git-scm.com/)

You will also need accounts/keys for:
- **Google Gemini API** — [Get key here](https://aistudio.google.com/app/apikey)
- **Azure AI Search** — [Azure Portal](https://portal.azure.com/)
- **Azure Blob Storage** — [Azure Portal](https://portal.azure.com/)
- **Firebase** (optional, for Firestore persistence) — [Firebase Console](https://console.firebase.google.com/)

---

### Step 1 — Clone the Repository

```bash
git clone <your-repo-url>
cd excelearn
```

---

### Step 2 — Backend Setup

#### 2a. Navigate to the backend folder

```bash
cd backend
```

#### 2b. Create a virtual environment and install dependencies

```bash
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

#### 2c. Configure environment variables

Create a `.env` file in the `backend/` folder with the following variables:

```env
# Google Gemini API Key
EXTERNAL_API_KEY=your_gemini_api_key_here

# Azure AI Search
AZURE_SEARCH_ENDPOINT=https://your-search-service.search.windows.net
AZURE_SEARCH_KEY=your_azure_search_admin_key
AZURE_SEARCH_INDEX_NAME=excelearn-index

# Azure Blob Storage
AZURE_BLOB_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...

# Firebase (optional — only needed for Firestore persistence)
# FIREBASE_SERVICE_ACCOUNT_PATH=firebase-service-account.json
```

> **Note:** If you skip Firebase setup, the backend automatically falls back to local JSON files for FSRS state persistence. All core features still work.

#### 2d. Start the backend server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be running at `http://localhost:8000`.

You can verify it's working by visiting:
```
http://localhost:8000/api/health
```

---

### Step 3 — Frontend Setup

#### 3a. Open a new terminal and navigate to the frontend folder

```bash
# From the repo root:
cd excelearn
```

#### 3b. Install frontend dependencies

```bash
npm install
```

#### 3c. Configure environment variables

Create a `.env.local` file in the `excelearn/` folder:

```env
VITE_API_BASE=http://localhost:8000
```

> If your backend runs on a different port, update this accordingly.

#### 3d. Start the frontend development server

```bash
npm run dev
```

The app will be running at `http://localhost:5173`. Open this URL in your browser.

---

### Step 4 — First-Time Use

1. Open `http://localhost:5173` in your browser
2. On the login screen, enter **any email and password** (e.g. `test@test.com` / `password123`)
   - Authentication is email-based session storage for demo purposes
3. You will land on the **Dashboard**
4. To experience the full AI pipeline:
   - Click the **Upload** button (top-right header)
   - Select a subject and upload any relevant PDF (lecture notes, textbook chapter, etc.)
   - Wait for the success message showing pages processed and chunks indexed
   - Open the **AI Agent Dock** (bottom of screen) and ask the Mentor a question
   - The Mentor will respond with answers grounded in your uploaded PDF
5. Navigate to any **Subject** from the sidebar, go to **Practice Quiz**, complete a quiz
   - Your chapter stability scores will update in real time via the FSRS model

---

## 🐳 Running with Docker (Backend Only)

If you prefer to run the backend in a container:

```bash
cd backend

# Build the image
docker build -t excelearn-backend .

# Run the container (pass your env vars)
docker run -p 8000:8000 \
  -e EXTERNAL_API_KEY=your_key \
  -e AZURE_SEARCH_ENDPOINT=your_endpoint \
  -e AZURE_SEARCH_KEY=your_key \
  -e AZURE_SEARCH_INDEX_NAME=excelearn-index \
  -e AZURE_BLOB_CONNECTION_STRING=your_connection_string \
  excelearn-backend
```

---

## 🌐 Production Deployment

### Backend — Google Cloud Run

The `Dockerfile` is configured for Cloud Run deployment. Push the image to Google Container Registry and deploy via the Cloud Run console or `gcloud` CLI.

### Frontend — Firebase Hosting

```bash
# Build the frontend
npm run build

# Deploy to Firebase Hosting
firebase deploy
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check — model and index status |
| `POST` | `/api/chat` | AI agent chat (RAG-grounded) |
| `POST` | `/api/upload` | Upload and index a PDF |
| `GET` | `/api/documents` | List user's uploaded PDFs |
| `DELETE` | `/api/documents/{blob_path}` | Delete a PDF and its indexed chunks |
| `POST` | `/api/quiz-result` | Submit quiz score → FSRS update |
| `GET` | `/api/stability/{subject}` | Get all chapter stability scores |
| `GET` | `/api/stability/{subject}/{chapter_id}` | Get detailed chapter FSRS metrics |
| `POST` | `/api/stability/session` | Record a study session → FSRS update |
| `POST` | `/api/admin/reset-index` | Reset the Azure AI Search index |

All endpoints (except `/api/health`) require the `X-User-ID` header with the user's email.

---

## 🧠 AI Architecture

### Three-Agent System

```
User Query
    │
    ▼
┌─────────────────────────────────────────┐
│              Agent Dock                 │
│                                         │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │ ANALYSE  │ │  PLAN    │ │ MENTOR  │ │
│  │ temp=0.45│ │ temp=0.2 │ │ temp=0.3│ │
│  │ Gap diag.│ │ Schedules│ │ Explain │ │
│  └──────────┘ └──────────┘ └─────────┘ │
└─────────────────────────────────────────┘
    │
    ▼
RAG Pipeline:
  Query → Gemini Embedding → Azure AI Search (vector + BM25)
        → Top-K chunks → Gemini generation → Response + Citations
```

### FSRS Memory Model

Each chapter tracks three values updated after every quiz and study session:

| Component | Symbol | Description |
|---|---|---|
| Stability | S | Days before recall probability drops to 90% |
| Retrievability | R | Current recall probability (0–1) |
| Difficulty | D | Material difficulty (1–10) |

**Dashboard Score** = `R × 60 + min(S/30, 1.0) × 40`

| Score | Status | Color |
|---|---|---|
| ≥ 75 | Mastered | 🟢 Green |
| 60–74 | Good | 🔵 Blue |
| 45–59 | Needs Review | 🟡 Amber |
| < 45 | Critical | 🔴 Red |

---

## ⚠️ Known Limitations & Design Decisions

- **Seeded data:** Chapter stability scores, exam dates, and activity data are pre-seeded with realistic values representing a student 6 weeks into semester. This is because direct API access to educational platforms (Blackboard, NTULearn, etc.) is not publicly available. The backend FSRS model and RAG pipeline are fully functional — quizzes and PDF uploads update data dynamically.

- **Authentication:** Login uses email-based `localStorage` session storage for demo purposes. The backend uses the email as a user ID passed via the `X-User-ID` header. Production deployment would use Firebase Authentication with proper token verification.

- **PDF content:** Do not upload copyrighted lecture materials in a public/shared deployment. The system is designed to work with any PDF content you have rights to use. For testing, use your own handwritten notes or freely available resources.

- **Agent context cards** in the Agent Dock are pre-populated from seeded data. The **chat interface** makes live calls to the Gemini-powered RAG pipeline.

- **Study plan generation** is computed client-side using chapter priority scores. It does not make a live API call.

---

## 🔒 Responsible AI

ExceeLearn is designed with educational trust in mind:

- **Explainability:** Every AI insight includes a "Why?" tooltip showing its data source (Quiz History / PDF Analysis / Baseline Seed)
- **Source citations:** RAG responses include references to the specific document chunks used
- **Determinism:** Planning agent uses temperature 0.2 for consistent, reproducible study schedules
- **Human agency:** Students can override, dismiss, or retake quizzes to update their own model
- **Privacy:** All data is scoped to the user's email ID; no data is shared across users
- **Transparency:** The system clearly indicates when data is seeded vs. dynamically computed

---

## 📦 Dependencies Summary

### Frontend (`package.json`)
```
react ^19.2.0          react-dom ^19.2.0
firebase ^12.10.0       lucide-react ^0.575.0
tailwindcss ^3.4.19     @radix-ui/react-dialog
class-variance-authority clsx  tailwind-merge
@fontsource/inter       @fontsource/geist-mono
```

### Backend (`requirements.txt`)
```
fastapi==0.115.0              uvicorn[standard]==0.30.6
python-dotenv==1.0.1          google-generativeai==0.8.3
azure-search-documents==11.6.0b8  azure-storage-blob==12.22.0
pypdf==4.3.1                  python-multipart==0.0.12
firebase-admin==6.5.0         google-cloud-firestore==2.19.0
```

---

## 👥 Team

> *(Add your team member names and roles here)*

---

## 📄 License

This project was built for the **Microsoft Track — AI in Education Hackathon 2026**.

---

*Made with ❤️ and too much coffee.*


