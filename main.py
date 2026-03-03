"""
ExceeLearn Backend — FastAPI (main.py)

Endpoints:
  GET  /api/health          — health check + index status
  POST /api/admin/reset-index — delete & recreate index with vector schema
  POST /api/chat            — RAG-grounded Gemini agent (Mentor / Analyse / Plan)
  POST /api/upload          — PDF → Blob → chunk → embed → index
  GET  /api/documents       — list uploaded PDFs

Run with:
  uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""

import os
import textwrap
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pypdf import PdfReader
import io

load_dotenv(Path(__file__).parent / ".env")

from services.azure_search import (
    ensure_index,
    reset_index,
    hybrid_search,
    upload_chunks,
    delete_chunks_by_source,
)
from services.blob_storage import upload_pdf, list_pdfs, delete_pdf
from services.gemini import generate_response, AGENT_CONFIG
from services.stability import calculate_stability, record_quiz_result, record_session
from services.firebase_auth import get_verified_uid

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="ExceeLearn API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Startup ───────────────────────────────────────────────────────────────────
@app.on_event("startup")
def on_startup():
    try:
        ensure_index()
    except Exception as e:
        print(f"[WARN] Could not ensure index on startup: {e}")


# ── Pydantic models ───────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    user_query: str
    agent: Optional[str] = "mentor"   # "mentor" | "analyse" | "plan"
    subject: Optional[str] = None
    context: Optional[str] = None


# ── Agent system prompts ──────────────────────────────────────────────────────
def build_system_prompt(
    agent: str,
    subject: Optional[str],
    chunks: list[dict],
) -> str:
    subject_line = f"The student is studying: **{subject}**." if subject else ""

    if chunks:
        rag_block = "\n\n".join(
            f"[Source: {c['title']}, Page {c['page']}]\n{c['content']}"
            for c in chunks
        )
    else:
        rag_block = "No lecture material found for this query. Answer from general knowledge but flag this clearly."

    if agent == "mentor":
        return textwrap.dedent(f"""
            You are MENTOR, an expert academic tutor inside ExceeLearn — a smart learning platform for university students.
            {subject_line}

            YOUR PERSONALITY: Warm, encouraging, and precise. You explain like a senior student who just mastered the topic.
            Always use clear structure: lead with a 1-sentence summary, then break down the concept step by step.
            Use analogies when helpful. End with a quick "💡 Key Takeaway".

            YOUR RULES:
            - Ground every explanation in the lecture material below. Cite [Source, Page] inline.
            - If the material doesn't cover the question, say: "This isn't in your lecture notes, but from general knowledge:" and answer.
            - Never fabricate lecture content.
            - Keep responses focused — no unnecessary padding.

            === LECTURE MATERIAL (RAG) ===
            {rag_block}
            ==============================
        """).strip()

    elif agent == "analyse":
        return textwrap.dedent(f"""
            You are ANALYSER, a learning diagnostics AI inside ExceeLearn.
            {subject_line}

            YOUR PERSONALITY: Direct, clinical, and actionable. You think like a learning scientist.
            You do NOT explain concepts from scratch — you diagnose WHY the student is struggling.

            YOUR OUTPUT FORMAT (always follow this):
            🔍 **Gap Type**: [Conceptual | Procedural | Both]
            ⚠️ **Weak Areas**: bullet list of specific topics/subtopics the student is shaky on
            🧠 **Root Cause**: 1–2 sentences on WHY this gap exists (misconception, skipped prerequisite, etc.)
            🎯 **What to Focus On**: 2–3 precise, actionable next steps (with lecture reference if available)

            YOUR RULES:
            - Be specific — never say "you need to study more". Say WHAT exactly to study.
            - Distinguish conceptual gaps (misunderstands the idea) from procedural gaps (makes errors applying it).
            - Reference lecture material where relevant with [Source, Page].

            === LECTURE MATERIAL (RAG) ===
            {rag_block}
            ==============================
        """).strip()

    elif agent == "plan":
        return textwrap.dedent(f"""
            You are PLANNER, a study schedule AI inside ExceeLearn.
            {subject_line}

            YOUR PERSONALITY: Efficient, realistic, and structured. You think like a productivity coach who knows the syllabus.
            You produce tight, immediately usable study plans — no fluff.

            YOUR OUTPUT FORMAT (always follow this):
            📌 **Priority Topics** (ranked by urgency/difficulty):
              1. [Topic] — [why it's priority]
              2. ...

            📅 **Suggested Schedule**:
              - Session 1 (X min): [what to do, which pages/chapters]
              - Session 2 (X min): [what to do]
              - ...

            ⏱️ **Total Estimated Time**: X hours Y minutes

            ✅ **Success Criteria**: How the student knows they've mastered this

            YOUR RULES:
            - Ground every recommendation in the actual lecture material below.
            - Be realistic about time — don't over-schedule.
            - Prioritise weaker/critical topics first.
            - Reference lecture source/page when scheduling specific reading.

            === LECTURE MATERIAL (RAG) ===
            {rag_block}
            ==============================
        """).strip()

    return textwrap.dedent(f"""
        You are a helpful AI tutor inside ExceeLearn. {subject_line}

        === CONTEXT ===
        {rag_block}
    """).strip()


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "version": "2.0.0",
        "index":  os.getenv("AZURE_SEARCH_INDEX_NAME", "excelearn-index"),
        "model":  "gemini-2.5-flash-lite",
        "vector": "gemini-embedding-001 (3072 dims)",
    }


@app.post("/api/admin/reset-index")
def admin_reset_index():
    """
    DELETE the existing keyword-only index and CREATE a new vector-enabled one.
    WARNING: This erases all indexed documents. Re-upload PDFs after calling this.
    """
    result = reset_index()
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])
    return result


@app.post("/api/chat")
async def chat(req: ChatRequest, uid: str = Depends(get_verified_uid)):
    """
    RAG-grounded agent chat:
    1. Hybrid search Azure index for relevant lecture chunks (filtered by uid).
    2. Build agent-specific system prompt with those chunks.
    3. Call Gemini for a grounded response.
    4. Return reply + source citations.
    """
    if not req.user_query.strip():
        raise HTTPException(status_code=400, detail="user_query cannot be empty")

    # Step 1 — RAG: combine subject + query for richer retrieval
    search_query = f"{req.subject or ''} {req.user_query}".strip()
    chunks = hybrid_search(search_query, top=3, user_id=uid)

    # Step 2 — Build system prompt
    system_prompt = build_system_prompt(req.agent, req.subject, chunks)

    # Step 3 — Gemini (agent-specific temperature + token budget)
    cfg = AGENT_CONFIG.get(req.agent, AGENT_CONFIG["mentor"])
    try:
        reply = generate_response(
            system_prompt,
            req.user_query,
            temperature=cfg["temperature"],
            max_tokens=cfg["max_tokens"],
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gemini error: {str(e)}")

    # Step 4 — Return
    sources = [
        {"title": c["title"], "source": c["source"], "page": c["page"]}
        for c in chunks
        if c.get("content")
    ]

    return {
        "reply":    reply,
        "agent":    req.agent,
        "sources":  sources,
        "rag_used": len(chunks) > 0,
    }


@app.post("/api/upload")
async def upload_pdf_endpoint(
    file: UploadFile = File(...),
    subject: str = Form(default="General"),
    uid: str = Depends(get_verified_uid),
):
    """
    Upload a PDF → Azure Blob Storage → chunk text → embed → index in Azure Search.
    Accepts any PDF. Chunks by page (~500 words per chunk).
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    pdf_bytes = await file.read()
    if not pdf_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # ── 1. Upload raw PDF to Azure Blob ──────────────────────────────────────
    try:
        blob_path = upload_pdf(file.filename, pdf_bytes, subject=subject, user_id=uid)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Blob upload error: {str(e)}")

    # ── 2. Extract + chunk text from PDF (pypdf) ──────────────────────────────
    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        chunks = []
        chunk_size = 500  # words per chunk

        for page_num, page in enumerate(reader.pages, start=1):
            text = page.extract_text() or ""
            text = text.strip()
            if not text:
                continue

            words = text.split()
            for i in range(0, len(words), chunk_size):
                chunk_text = " ".join(words[i : i + chunk_size])
                if len(chunk_text) < 50:
                    continue
                chunks.append({
                    "text":   chunk_text,
                    "title":  file.filename,
                    "source": file.filename,
                    "page":   page_num,
                })
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"PDF parsing error: {str(e)}")

    if not chunks:
        raise HTTPException(
            status_code=422,
            detail="No extractable text found in PDF. It may be a scanned image PDF."
        )

    # ── 3. Embed + upload chunks to Azure Search ──────────────────────────────
    try:
        total_indexed = upload_chunks(chunks, user_id=uid)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Indexing error: {str(e)}")

    return {
        "success":        True,
        "filename":       file.filename,
        "subject":        subject,
        "blob_path":      blob_path,
        "pages_processed": len(reader.pages),
        "chunks_indexed": total_indexed,
    }


@app.get("/api/documents")
def list_documents(subject: str = None, uid: str = Depends(get_verified_uid)):
    """List all PDFs that have been uploaded (filtered to this user's documents)."""
    try:
        raw = list_pdfs(subject=subject, user_id=uid)
        docs = []
        for blob_name in raw:
            # Path is: {uid}/{subject}/{filename}
            remainder = blob_name[len(uid) + 1:] if blob_name.startswith(f"{uid}/") else blob_name
            parts = remainder.split("/", 1)
            blob_subject = parts[0] if len(parts) > 1 else "General"
            filename = parts[1] if len(parts) > 1 else remainder
            docs.append({
                "filename":  filename,
                "subject":   blob_subject,
                "blob_path": blob_name,
            })
        return {"documents": docs, "count": len(docs)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class QuizResultRequest(BaseModel):
    subject:    str
    chapter_id: str
    score:      float          # 0-100 raw quiz percentage
    total_questions: Optional[int] = None
    correct:    Optional[int]  = None


@app.post("/api/quiz-result")
async def post_quiz_result(req: QuizResultRequest, uid: str = Depends(get_verified_uid)):
    """
    Record a quiz result and update the FSRS Three-Component Model state.

    Updates Stability (S), Difficulty (D) and resets Retrievability (R=1).
    Persists state to fsrs_state.json on the server.

    Returns the updated FSRS values + derived dashboard stability score.
    """
    VALID_SUBJECTS = {"SC1007", "MH1810", "SC2001", "SC2002", "SC2005"}
    if req.subject not in VALID_SUBJECTS:
        raise HTTPException(status_code=404, detail=f"Unknown subject: {req.subject}")
    if not (0 <= req.score <= 100):
        raise HTTPException(status_code=400, detail="score must be between 0 and 100")

    # Fetch current PDF chunks to seed D/S on first review
    try:
        chunks = hybrid_search(req.subject, top=50, user_id=uid)
        pdf_text = " ".join(c.get("content", "") for c in chunks)
    except Exception:
        pdf_text = ""

    result = record_quiz_result(
        subject    = req.subject,
        chapter_id = req.chapter_id,
        score      = req.score,
        pdf_text   = pdf_text,
        user_id    = uid,
    )
    return result


@app.get("/api/stability/{subject}")
def get_stability(subject: str, uid: str = Depends(get_verified_uid)):
    """
    FSRS-based stability scores for each chapter of a subject.

    For each chapter:
      - If reviewed before: applies R = 0.9^(days/S) time-decay to compute
        current retrievability, then blends with S to produce dashboard score.
      - If never reviewed but PDFs uploaded: seeds S/D from keyword analysis.
      - If no data: returns neutral 50% baseline.

    Response shape:
      {
        subject: str,
        assessed: bool,
        chapters: [
          {
            chapter_id, title,
            stability  (0-100 dashboard score),
            status     (mastered|good|review|critical),
            bar_color  (hex),
            S          (stability in days),
            D          (difficulty 1-10),
            R          (retrievability 0-1),
            days_since_review,
            last_review    (ISO date | null),
            last_score     (0-100 | null),
            reviews        (int),
            next_review_in (days until R=0.9),
            assessed       (bool)
          }, ...
        ]
      }
    """
    VALID_SUBJECTS = {"SC1007", "MH1810", "SC2001", "SC2002", "SC2005"}
    if subject not in VALID_SUBJECTS:
        raise HTTPException(status_code=404, detail=f"Unknown subject: {subject}")

    # Pull all indexed chunks for this subject from Azure Search
    try:
        chunks = hybrid_search(subject, top=50, user_id=uid)
    except Exception:
        chunks = []

    chapter_scores = calculate_stability(subject, chunks, user_id=uid)
    assessed = any(c["assessed"] for c in chapter_scores)

    return {
        "subject":  subject,
        "assessed": assessed,
        "chapters": chapter_scores,
    }


@app.get("/api/stability/{subject}/{chapter_id}")
def get_chapter_stability(subject: str, chapter_id: str, uid: str = Depends(get_verified_uid)):
    """
    Detailed FSRS state for a single chapter — used by the frontend "Why?" tooltip.

    Returns a human-readable explanation alongside the raw FSRS values so the
    UI can render a transparent, data-grounded explanation of the stability score.

    Response shape:
      {
        subject, chapter_id, title,
        stability      (0-100 dashboard score),
        status         (mastered|good|review|critical),
        bar_color      (hex),
        S              (stability in days),
        D              (difficulty 1-10),
        R              (retrievability 0-1, current recall probability),
        days_since_review (float | null),
        last_review    (ISO date | null),
        last_score     (0-100 | null),
        reviews        (int),
        next_review_in (days until R drops to 0.9),
        assessed       (bool),
        data_source    ("quiz_history" | "pdf_keywords" | "baseline"),
        why_explanation (str — plain-English breakdown for the tooltip)
      }
    """
    VALID_SUBJECTS = {"SC1007", "MH1810", "SC2001", "SC2002", "SC2005"}
    if subject not in VALID_SUBJECTS:
        raise HTTPException(status_code=404, detail=f"Unknown subject: {subject}")

    # Pull PDF chunks to support keyword seeding explanation
    try:
        chunks = hybrid_search(subject, top=50, user_id=uid)
    except Exception:
        chunks = []

    # Get all chapters then find the one requested
    chapter_scores = calculate_stability(subject, chunks, user_id=uid)
    chapter = next((c for c in chapter_scores if c["chapter_id"] == chapter_id), None)
    if chapter is None:
        raise HTTPException(status_code=404, detail=f"Chapter '{chapter_id}' not found in {subject}")

    # ── Determine data source and build plain-English explanation ─────────────
    S    = chapter["S"]
    D    = chapter["D"]
    R    = chapter["R"]
    days = chapter.get("days_since_review")
    last_score  = chapter.get("last_score")
    reviews     = chapter.get("reviews", 0)
    next_review = chapter.get("next_review_in")
    stability   = chapter["stability"]
    assessed    = chapter["assessed"]

    if reviews > 0 and chapter.get("last_review"):
        # Real quiz history exists
        data_source = "quiz_history"
        grade_word = "unknown"
        if last_score is not None:
            if last_score >= 90:   grade_word = "excellent (≥90%)"
            elif last_score >= 75: grade_word = "good (75–89%)"
            elif last_score >= 60: grade_word = "needs work (60–74%)"
            else:                  grade_word = "critical (<60%)"

        days_str = f"{days:.0f} day{'s' if days != 1 else ''}" if days is not None else "unknown"
        r_pct    = f"{R * 100:.0f}%"
        why = (
            f"Based on your quiz history ({reviews} attempt{'s' if reviews != 1 else ''}).\n"
            f"Last quiz score: {last_score:.0f}% — {grade_word}.\n"
            f"Memory decay: {days_str} since last review → current recall probability R = {r_pct}.\n"
            f"Stability S = {S:.1f} days (how long until recall drops to 90%).\n"
            f"Difficulty D = {D:.1f}/10 (higher = the material resists long-term retention).\n"
            f"Dashboard score = R×60 + min(S/30,1)×40 = {stability}.\n"
            f"Next recommended review: in {next_review:.0f} day{'s' if next_review != 1 else ''}."
        )
    elif assessed and chunks:
        # Seeded from PDF keyword analysis — no quizzes yet
        data_source = "pdf_keywords"
        why = (
            f"No quizzes taken yet — score estimated from your uploaded lecture PDF.\n"
            f"Keyword analysis found a hard-concept ratio that maps to "
            f"Difficulty D = {D:.1f}/10 and initial Stability S = {S:.1f} days.\n"
            f"Higher D means the material has more advanced/complex terminology.\n"
            f"Current recall probability R = {R * 100:.0f}% (full, since no time has passed since upload).\n"
            f"Dashboard score = {stability}.\n"
            f"Take a quiz to get a personalised score based on your actual performance."
        )
    else:
        # No data — baseline only
        data_source = "baseline"
        why = (
            f"No quiz history and no lecture PDF uploaded for this chapter yet.\n"
            f"Showing neutral baseline score of 50%.\n"
            f"Upload a lecture PDF or take a practice quiz to get a personalised stability score."
        )

    return {
        **chapter,
        "subject":         subject,
        "data_source":     data_source,
        "why_explanation": why,
    }


class SessionRequest(BaseModel):
    subject:          str
    duration_minutes: float
    focus_quality:    float        # 0.0–1.0
    pause_count:      Optional[int] = 0


@app.post("/api/stability/session")
async def post_stability_session(req: SessionRequest, uid: str = Depends(get_verified_uid)):
    """
    Record a study session and update FSRS stability for all chapters of the subject.

    Duration rules applied in stability service:
      < 15 min   → No gain (encoding threshold not met)
      15–44 min  → Standard gain
      45–90 min  → 1.2x focus bonus on Stability (S)
      > 120 min  → 0.8x saturation penalty on Stability (S)

    Frequent pausing (low focus_quality + high pause_count) slightly
    increases Difficulty (D) for each chapter.

    After this call, GET /api/stability/{subject} will reflect the updated values.
    """
    VALID_SUBJECTS = {"SC1007", "MH1810", "SC2001", "SC2002", "SC2005"}
    if req.subject not in VALID_SUBJECTS:
        raise HTTPException(status_code=404, detail=f"Unknown subject: {req.subject}")
    if not (0.0 <= req.focus_quality <= 1.0):
        raise HTTPException(status_code=400, detail="focus_quality must be between 0.0 and 1.0")
    if req.duration_minutes < 0:
        raise HTTPException(status_code=400, detail="duration_minutes must be non-negative")

    result = record_session(
        subject          = req.subject,
        duration_minutes = req.duration_minutes,
        focus_quality    = req.focus_quality,
        pause_count      = req.pause_count or 0,
        user_id          = uid,
    )
    return result


@app.delete("/api/documents/{blob_path:path}")
def delete_document(blob_path: str, uid: str = Depends(get_verified_uid)):
    """
    Delete a PDF from Blob Storage and remove all its indexed chunks from Azure Search.
    blob_path is the full path e.g. 'SC1007/filename.pdf'
    """
    # Extract just the filename to match the 'source' field in the index
    filename = blob_path.split("/", 1)[-1] if "/" in blob_path else blob_path

    errors = []

    # 1. Delete from Blob Storage
    try:
        delete_pdf(blob_path)
    except Exception as e:
        errors.append(f"Blob delete error: {str(e)}")

    # 2. Remove chunks from Azure Search
    try:
        deleted_chunks = delete_chunks_by_source(filename)
    except Exception as e:
        errors.append(f"Search index delete error: {str(e)}")
        deleted_chunks = 0

    if errors:
        raise HTTPException(status_code=500, detail=" | ".join(errors))

    return {
        "success": True,
        "blob_path": blob_path,
        "filename": filename,
        "chunks_deleted": deleted_chunks,
    }


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
