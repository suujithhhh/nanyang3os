# ExceeLearn — Testbench Setup Guide

This folder contains everything you need to run and test ExceeLearn locally, including pre-loaded sample data that demonstrates the FSRS memory decay model with a realistic student history.

---

## 📁 Testbench Contents

```
testbench/
├── SETUP.md                              ← This file
└── sample_data/
    ├── fsrs_state_test@test.com.json     ← Pre-loaded student FSRS history (27 chapters)
    ├── backend.env.example               ← Backend environment variable template
    └── frontend.env.example              ← Frontend environment variable template
```

---

## 🧪 What the Sample Data Represents

The file `fsrs_state_test@test.com.json` contains a realistic student profile — **6 weeks into semester** — with quiz history across all 5 subjects (27 chapters). It showcases:

| Chapter | Stability (S) | Difficulty (D) | Last Score | Status |
|---|---|---|---|---|
| SC2002 OOP Principles | 28 days | 3.5 | 93% | 🟢 Mastered |
| SC2001 Algorithm Basics | 25 days | 4.0 | 88% | 🟢 Mastered |
| SC1007 Binary Trees | 22 days | 4.0 | 91% | 🟢 Mastered |
| MH1810 Eigenvalues | 3 days | 8.0 | 38% | 🔴 Critical — memory decaying |
| SC1007 Graph Algorithms | 3.5 days | 8.5 | 41% | 🔴 Critical — memory decaying |
| SC2001 NP-Completeness | 5 days | 8.0 | 48% | 🔴 Critical |

This contrast — mastered chapters vs. critically decaying ones — demonstrates the **memory decay model** working in real time.

---

## ✅ Prerequisites

Before you begin, make sure you have:

- [ ] **Node.js** v18 or higher — [Download](https://nodejs.org/)
- [ ] **Python** 3.11 or higher — [Download](https://www.python.org/)
- [ ] **Git** — [Download](https://git-scm.com/)
- [ ] A **Google Gemini API key** — [Get one free](https://aistudio.google.com/app/apikey)
- [ ] An **Azure AI Search** service (free tier works) — [Azure Portal](https://portal.azure.com/)
- [ ] An **Azure Blob Storage** account — [Azure Portal](https://portal.azure.com/)

> **Note:** Firebase/Firestore is **optional**. Without it, the backend automatically uses local JSON files for data persistence — all features work identically.

---

## 🚀 Step-by-Step Setup

### Step 1 — Clone the Repository

```bash
git clone <your-repo-url>
cd excelearn
```

---

### Step 2 — Load the Sample Student Data

Copy the pre-loaded FSRS state file into the backend services folder:

**On Windows:**
```bash
copy testbench\sample_data\fsrs_state_test@test.com.json backend\services\fsrs_state_test@test.com.json
```

**On macOS / Linux:**
```bash
cp testbench/sample_data/fsrs_state_test@test.com.json backend/services/fsrs_state_test@test.com.json
```

This gives the demo account (`test@test.com`) a full 6-week history with clearly visible memory decay patterns.

---

### Step 3 — Configure the Backend

#### 3a. Navigate to the backend folder

```bash
cd backend
```

#### 3b. Create and activate a Python virtual environment

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**On macOS / Linux:**
```bash
python -m venv venv
source venv/bin/activate
```

#### 3c. Install Python dependencies

```bash
pip install -r requirements.txt
```

#### 3d. Set up environment variables

Copy the example env file and fill in your API keys:

**On Windows:**
```bash
copy ..\testbench\sample_data\backend.env.example .env
```

**On macOS / Linux:**
```bash
cp ../testbench/sample_data/backend.env.example .env
```

Now open `.env` in any text editor and replace the placeholder values with your real keys:

```env
EXTERNAL_API_KEY=your_actual_gemini_key
AZURE_SEARCH_ENDPOINT=https://your-service.search.windows.net
AZURE_SEARCH_KEY=your_actual_search_key
AZURE_SEARCH_INDEX_NAME=excelearn-index
AZURE_BLOB_CONNECTION_STRING=your_actual_connection_string
```

#### 3e. Start the backend server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

✅ Verify it's running by opening: `http://localhost:8000/api/health`

You should see a JSON response with model and index status.

---

### Step 4 — Configure the Frontend

Open a **new terminal** and go back to the `excelearn/` folder:

```bash
cd excelearn
```

#### 4a. Install frontend dependencies

```bash
npm install
```

#### 4b. Set up the frontend environment

**On Windows:**
```bash
copy testbench\sample_data\frontend.env.example .env.local
```

**On macOS / Linux:**
```bash
cp testbench/sample_data/frontend.env.example .env.local
```

> The default value (`http://localhost:8000`) is correct if you followed Step 3. No changes needed.

#### 4c. Start the frontend

```bash
npm run dev
```

✅ Open your browser at: `http://localhost:5173`

---

### Step 5 — Log In with the Demo Account

On the login screen, enter:

- **Email:** `test@test.com`
- **Password:** `password123` *(any value works — authentication is session-based for demo)*

You will immediately see the dashboard populated with the pre-loaded student history.

---

## 🔬 What to Test

### Test 1 — Memory Decay Visualisation
1. Log in as `test@test.com`
2. Click **SC1007** (Data Structures) in the sidebar
3. Observe chapter stability scores — ch06 (Graph Algorithms) should show **Critical** (red) with low stability
4. Click **MH1810** (Linear Algebra) — ch05 (Eigenvalues) is the most critical chapter (S=3.0 days, last score 38%)
5. Compare against SC2002 ch01 (OOP Principles) — fully mastered (S=28 days, score 93%)

### Test 2 — Live FSRS Update via Quiz
1. Navigate to any subject (e.g. SC1007)
2. Click the **Practice Quiz** tab
3. Complete a 3-question quiz
4. View the results screen — it shows updated S, D, and next review date
5. Go back to the Chapters tab — the stability score for that chapter has updated

### Test 3 — RAG Pipeline (requires Azure keys)
1. Click the **Upload** button in the top-right header
2. Select a subject and upload any PDF (your own notes, a freely available resource)
3. Wait for the success message (pages processed + chunks indexed)
4. Open the **Agent Dock** at the bottom of the screen
5. Select the **Mentor** tab and ask a question about the content you uploaded
6. The response will be grounded in your PDF with source citations

### Test 4 — Smart Timer Session
1. Click the timer icon in the header
2. Select a subject and press **Start**
3. Study for at least 15 minutes (or simulate by waiting)
4. Press **Stop** — view the session summary
5. Check the subject's stability scores — they will have updated based on session duration and quality

### Test 5 — Study Plan Generation
1. Navigate to any subject
2. Click **Generate Study Plan**
3. A day-by-day exam prep plan is generated, prioritising critical chapters first

---

## 🐛 Troubleshooting

| Problem | Solution |
|---|---|
| Backend won't start | Check Python version (`python --version` should be 3.11+) and that venv is activated |
| `ModuleNotFoundError` | Run `pip install -r requirements.txt` again inside the venv |
| `/api/health` returns error | Check your `.env` file — ensure all Azure keys are correct |
| Frontend shows blank page | Check browser console; ensure `VITE_API_BASE` points to the correct backend port |
| Agent chat not responding | Backend may be offline — check the terminal running uvicorn for errors |
| Stability scores not updating | Ensure `X-User-ID` header is being sent — log out and log back in |
| Azure Search index error | Call `POST /api/admin/reset-index` once to initialise the index |

---

## 📝 Notes for Judges

- **Login:** Use `test@test.com` with any password to access the pre-loaded demo account
- **Seeded data:** The dashboard statistics (heatmap, achievements, exam dates) are pre-seeded to represent a realistic student scenario. The FSRS stability scores are dynamic and update with every quiz and study session.
- **No Firebase needed:** The backend runs fully without Firebase — it uses the JSON files in `backend/services/` for state persistence
- **Azure keys required** for: PDF upload, RAG chat, and document indexing. Without them, the quiz simulator, FSRS model, and study plan features still work fully.

---

*ExceeLearn — Microsoft Track, AI in Education Hackathon 2026*
