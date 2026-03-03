# Testbench — ExceeLearn

## 🎬 Demo Video (Recommended — Watch First)

**https://youtu.be/zDf56Db8Hq0**

The demo video shows the complete working application including FSRS memory updates, RAG-grounded AI Mentor, study plan generation, and the explainable AI "Why?" mechanism.

---

## 🚀 Quickest Way to Test

Run the backend locally (see SETUP.md) and open the frontend at `http://localhost:5173`. Log in with `test@test.com` — all FSRS state and AI features are pre-loaded and ready.

> **Note:** The live Firebase deployment at `https://excelearn-1c00e.web.app` requires the backend to be running locally at `http://localhost:8000`. Full cloud deployment instructions are in SETUP.md.

---

## Local Setup (Optional)

This folder contains all the files needed to set up and test ExceeLearn locally.

## Contents

| File | Purpose |
|---|---|
| `SETUP.md` | **Start here** — full step-by-step setup and run instructions |
| `sample_data/fsrs_state_test@test.com.json` | Pre-loaded FSRS memory state for the demo account (`test@test.com`) — 27 chapters across 5 subjects with realistic quiz history and memory decay |
| `sample_data/backend.env.example` | Template for backend environment variables (API keys) |
| `sample_data/frontend.env.example` | Template for frontend environment variable |

## Quick Start

1. Read [`SETUP.md`](./SETUP.md) for full instructions
2. Copy `sample_data/fsrs_state_test@test.com.json` → `backend/services/`
3. Configure your API keys in `backend/.env`
4. Run the backend: `uvicorn main:app --reload --port 8000`
5. Run the frontend: `npm run dev`
6. Log in with `test@test.com`

## Demo Account

| Field | Value |
|---|---|
| Email | `test@test.com` |
| Password | any value |
| Data | 6 weeks of realistic quiz history across 5 subjects |
| Highlights | Clear memory decay visible in SC1007/ch06, MH1810/ch05, SC2001/ch06 |
