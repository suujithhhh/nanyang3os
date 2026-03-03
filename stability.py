"""
ExceeLearn Stability Service — FSRS-Inspired Three-Component Model
==================================================================

Three Components
----------------
  S  — Stability   : number of days before retrievability drops to 0.9
                     (higher = more stable memory, decays slower)
  R  — Retrievability : probability of recall right now ∈ [0, 1]
                     R = 0.9 ** (days_since_last_review / S)
  D  — Difficulty  : inherent difficulty of the material ∈ [1, 10]
                     (used to scale how much S grows after a good review)

State is persisted in fsrs_state.json next to this file.

FSRS Update Rules (after a quiz)
---------------------------------
  score ∈ [0, 100]  (raw quiz percentage)

  Grade mapping:
    score >= 90  → "perfect"   → S grows maximally
    score >= 75  → "good"      → S grows moderately
    score >= 60  → "hard"      → S grows slightly, D increases
    score <  60  → "fail"      → S resets toward initial, D increases

  Stability update:
    w1=2.0, w2=1.5, w3=0.8, w4=0.5  (grade weights: perfect→fail)

    new_S_perfect = S * w1 * (11 - D) / 10
    new_S_good    = S * w2 * (11 - D) / 10
    new_S_hard    = S * w3 * (11 - D) / 10
    new_S_fail    = max(INIT_S, S * w4 * R)   # partial credit for current R

  Difficulty update (capped [1, 10]):
    fail/hard: D = min(10, D + 1.0 / 1.5)
    good:      D unchanged
    perfect:   D = max(1, D - 0.5)

  Retrievability after update:
    After any review, the memory is refreshed → R resets to 1.0
    (next decay starts from today)

Keyword Seeding
---------------
  If a chapter has never been reviewed, we seed S and D from the keyword
  analysis of uploaded PDF content (same logic as before, now used only
  to initialise the FSRS state rather than be the final answer).

    hard_ratio = hard_hits / max(1, hard_hits + core_hits)
    D_seed     = 1 + hard_ratio * 9          # [1, 10]
    S_seed     = 20 - hard_ratio * 15        # [5, 20] days

  This means a PDF heavy on "complexity/NP-hard" keywords starts with
  higher difficulty and lower initial stability — the heatmap will be
  red/yellow immediately, before any quiz is taken.
"""

import json
import math
import re
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Optional

# ── Persistence — Firestore (Cloud Run) with JSON-file fallback (local dev) ───

_firestore_client = None
_FSRS_COLLECTION  = "fsrs_state"

def _get_firestore():
    """Lazily initialise Firestore client. Returns None if unavailable."""
    global _firestore_client
    if _firestore_client is not None:
        return _firestore_client
    try:
        from google.cloud import firestore
        _firestore_client = firestore.Client()
        return _firestore_client
    except Exception:
        return None


def _load_state(user_id: str = None) -> dict:
    """
    Load FSRS state for a user.
    Tries Firestore first (Cloud Run), falls back to local JSON (dev).
    """
    db = _get_firestore()
    if db and user_id:
        try:
            doc = db.collection(_FSRS_COLLECTION).document(user_id).get()
            if doc.exists:
                return doc.to_dict() or {}
            return {}
        except Exception:
            pass

    # Local JSON fallback
    STATE_DIR  = Path(__file__).parent
    path = STATE_DIR / (f"fsrs_state_{user_id}.json" if user_id else "fsrs_state.json")
    if path.exists():
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            return {}
    return {}


def _save_state(state: dict, user_id: str = None) -> None:
    """
    Persist FSRS state for a user.
    Tries Firestore first (Cloud Run), falls back to local JSON (dev).
    """
    db = _get_firestore()
    if db and user_id:
        try:
            db.collection(_FSRS_COLLECTION).document(user_id).set(state)
            return
        except Exception:
            pass

    # Local JSON fallback
    STATE_DIR = Path(__file__).parent
    path = STATE_DIR / (f"fsrs_state_{user_id}.json" if user_id else "fsrs_state.json")
    try:
        path.write_text(
            json.dumps(state, indent=2, default=str),
            encoding="utf-8"
        )
    except Exception:
        pass

# ── FSRS Constants ────────────────────────────────────────────────────────────

INIT_S      = 4.0    # days — initial stability for a brand-new card
INIT_D      = 5.0    # initial difficulty (mid-range)
TARGET_R    = 0.9    # retrievability threshold used in decay formula
DECAY_BASE  = 0.9    # R = DECAY_BASE ** (t / S)

# Grade weights for S update
GRADE_WEIGHTS = {
    "perfect": 2.0,
    "good":    1.5,
    "hard":    0.8,
    "fail":    0.5,
}

MIN_S = 1.0    # days — absolute floor for stability
MAX_S = 365.0  # days — ceiling (1 year)
MIN_D = 1.0
MAX_D = 10.0

# ── Keyword Profiles (for seeding D and S from PDF content) ──────────────────

CHAPTER_PROFILES = {
    "SC1007": [
        {"id": "ch01", "title": "Pointers & Memory",
         "hard": ["segmentation fault", "dangling pointer", "memory leak", "undefined behaviour", "double free", "buffer overflow"],
         "core": ["pointer", "memory", "stack", "heap", "malloc", "reference", "address"]},
        {"id": "ch02", "title": "Linked Lists",
         "hard": ["circular reference", "race condition", "concurrent modification", "cache miss", "fragmentation"],
         "core": ["linked list", "node", "next", "head", "tail", "insert", "delete", "traverse"]},
        {"id": "ch03", "title": "Recursion",
         "hard": ["complexity", "exponential", "stack overflow", "combinatorial explosion", "memoization overhead", "tail call"],
         "core": ["recursion", "base case", "recursive", "call stack", "memoization", "fibonacci", "factorial"]},
        {"id": "ch04", "title": "Binary Trees",
         "hard": ["complexity", "degenerate", "worst case", "unbalanced", "skewed", "rotation", "rebalance"],
         "core": ["binary tree", "bst", "traversal", "inorder", "preorder", "postorder", "avl", "height", "leaf", "node"]},
        {"id": "ch05", "title": "Sorting Algorithms",
         "hard": ["worst case", "complexity", "o(n^2)", "o(n log n)", "adversarial", "pivot", "partition", "instability"],
         "core": ["sort", "merge sort", "quick sort", "bubble", "heap sort", "compare", "swap", "array"]},
        {"id": "ch06", "title": "Graph Algorithms",
         "hard": ["complexity", "np-hard", "np-complete", "exponential", "dijkstra", "negative cycle", "shortest path"],
         "core": ["graph", "bfs", "dfs", "vertex", "edge", "queue", "visited", "adjacency", "spanning tree"]},
    ],
    "MH1810": [
        {"id": "ch01", "title": "Vectors & Spaces",
         "hard": ["abstract", "dimension", "basis", "linear independence", "span", "subspace", "null space"],
         "core": ["vector", "dot product", "cross product", "magnitude", "unit vector", "addition", "scalar"]},
        {"id": "ch02", "title": "Matrix Operations",
         "hard": ["singular", "ill-conditioned", "rank deficiency", "complexity", "numerical instability", "pivoting"],
         "core": ["matrix", "multiply", "transpose", "inverse", "identity", "determinant", "row", "column"]},
        {"id": "ch03", "title": "Systems of Equations",
         "hard": ["inconsistent", "underdetermined", "overdetermined", "rank", "degenerate", "ill-posed"],
         "core": ["gaussian", "elimination", "row echelon", "rref", "pivot", "solution", "augmented", "back substitution"]},
        {"id": "ch04", "title": "Determinants",
         "hard": ["complexity", "cofactor expansion", "laplace", "singular matrix", "degenerate", "non-invertible"],
         "core": ["determinant", "cofactor", "minor", "cramer", "expansion", "property", "sign"]},
        {"id": "ch05", "title": "Eigenvalues & Eigenvectors",
         "hard": ["complexity", "characteristic polynomial", "degenerate", "repeated eigenvalue", "jordan form", "diagonalisation"],
         "core": ["eigenvalue", "eigenvector", "characteristic", "polynomial", "diagonalise", "spectrum"]},
        {"id": "ch06", "title": "Orthogonality",
         "hard": ["complexity", "gram-schmidt", "qr decomposition", "projection", "orthonormal", "numerical instability"],
         "core": ["orthogonal", "perpendicular", "projection", "inner product", "norm", "unit vector"]},
    ],
    "SC2001": [
        {"id": "ch01", "title": "Algorithm Basics",
         "hard": ["complexity", "asymptotic", "tight bound", "lower bound", "worst case", "amortised"],
         "core": ["big-o", "notation", "time complexity", "space complexity", "algorithm", "omega", "theta"]},
        {"id": "ch02", "title": "Divide & Conquer",
         "hard": ["complexity", "recurrence", "master theorem", "worst case", "unbalanced partition", "pivot"],
         "core": ["divide", "conquer", "merge sort", "quick sort", "recurrence", "subproblem", "combine"]},
        {"id": "ch03", "title": "Greedy Algorithms",
         "hard": ["greedy choice", "exchange argument", "counterexample", "non-greedy", "suboptimal", "complexity"],
         "core": ["greedy", "optimal", "huffman", "kruskal", "activity selection", "local optimum"]},
        {"id": "ch04", "title": "Dynamic Programming",
         "hard": ["complexity", "overlapping subproblems", "optimal substructure", "state space", "dp transition", "exponential"],
         "core": ["dynamic programming", "memoization", "tabulation", "dp", "subproblem", "knapsack", "lcs"]},
        {"id": "ch05", "title": "Graph Algorithms",
         "hard": ["complexity", "negative weight", "bellman-ford", "shortest path", "cycle detection", "topological"],
         "core": ["graph", "bfs", "dfs", "dijkstra", "shortest", "vertex", "edge", "weighted"]},
        {"id": "ch06", "title": "NP-Completeness",
         "hard": ["np-hard", "np-complete", "reduction", "polynomial", "intractable", "exponential", "sat", "complexity"],
         "core": ["np", "p vs np", "reduction", "decision problem", "certificate", "verifiable"]},
    ],
    "SC2002": [
        {"id": "ch01", "title": "OOP Principles",
         "hard": ["complexity", "coupling", "cohesion", "anti-pattern", "god object", "spaghetti code"],
         "core": ["encapsulation", "abstraction", "inheritance", "polymorphism", "class", "object", "method"]},
        {"id": "ch02", "title": "UML & Modelling",
         "hard": ["complexity", "association", "aggregation", "composition", "multiplicity", "dependency"],
         "core": ["uml", "class diagram", "sequence diagram", "use case", "actor", "notation", "relationship"]},
        {"id": "ch03", "title": "SOLID Principles",
         "hard": ["violation", "coupling", "dependency inversion", "interface segregation", "liskov substitution"],
         "core": ["solid", "single responsibility", "open closed", "liskov", "interface", "dependency"]},
        {"id": "ch04", "title": "Creational Patterns",
         "hard": ["complexity", "anti-pattern", "overuse", "coupling", "object creation", "prototype"],
         "core": ["singleton", "factory", "abstract factory", "builder", "prototype", "creational", "pattern"]},
        {"id": "ch05", "title": "Structural Patterns",
         "hard": ["complexity", "deep inheritance", "tight coupling", "wrapper hell", "structural"],
         "core": ["adapter", "decorator", "facade", "composite", "proxy", "bridge", "structural pattern"]},
        {"id": "ch06", "title": "Behavioural Patterns",
         "hard": ["complexity", "coupling", "callback hell", "event loop", "observer storm", "strategy pattern"],
         "core": ["observer", "strategy", "command", "iterator", "state", "behavioural", "pattern"]},
    ],
    "SC2005": [
        {"id": "ch01", "title": "Digital Logic",
         "hard": ["complexity", "hazard", "race condition", "metastability", "propagation delay", "fanout"],
         "core": ["boolean", "logic gate", "and", "or", "not", "circuit", "truth table", "k-map"]},
        {"id": "ch02", "title": "Data Representation",
         "hard": ["overflow", "underflow", "precision", "ieee 754", "rounding error", "denormalised"],
         "core": ["binary", "hexadecimal", "two's complement", "floating point", "representation", "sign bit"]},
        {"id": "ch03", "title": "CPU Architecture",
         "hard": ["complexity", "pipeline hazard", "data hazard", "control hazard", "stall", "forwarding", "branch prediction"],
         "core": ["cpu", "alu", "register", "control unit", "datapath", "fetch", "decode", "execute"]},
        {"id": "ch04", "title": "Instruction Set Architecture",
         "hard": ["complexity", "addressing mode", "risc vs cisc", "instruction encoding", "orthogonality"],
         "core": ["instruction", "mips", "risc", "cisc", "opcode", "operand", "addressing", "isa"]},
        {"id": "ch05", "title": "Memory Hierarchy",
         "hard": ["complexity", "cache miss", "page fault", "thrashing", "replacement policy", "tlb miss", "virtual memory"],
         "core": ["cache", "memory", "ram", "virtual", "paging", "tlb", "hierarchy", "locality"]},
        {"id": "ch06", "title": "I/O & Peripherals",
         "hard": ["complexity", "dma conflict", "interrupt latency", "bus contention", "polling overhead"],
         "core": ["interrupt", "dma", "bus", "i/o", "peripheral", "controller", "interface"]},
    ],
}

# ── Helpers ───────────────────────────────────────────────────────────────────

def _count_keywords(text: str, keywords: list[str]) -> int:
    text_lower = text.lower()
    return sum(
        len(re.findall(r'\b' + re.escape(kw.lower()) + r'\b', text_lower))
        for kw in keywords
    )

def _today_str() -> str:
    return date.today().isoformat()

def _days_since(date_str: str) -> float:
    try:
        past = date.fromisoformat(date_str)
        return max(0.0, (date.today() - past).days)
    except Exception:
        return 0.0

def _clamp(val: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, val))

# ── Core FSRS Functions ───────────────────────────────────────────────────────

def compute_R(S: float, days: float) -> float:
    """
    Retrievability: R = 0.9 ** (days / S)
    Returns a float in (0, 1]. At days=0, R=1. At days=S, R=0.9.
    """
    if S <= 0:
        return 0.0
    return DECAY_BASE ** (days / S)

def score_to_grade(score: float) -> str:
    """Map a 0-100 quiz score to an FSRS grade string."""
    if score >= 90:
        return "perfect"
    elif score >= 75:
        return "good"
    elif score >= 60:
        return "hard"
    else:
        return "fail"

def update_S(S: float, D: float, R: float, grade: str) -> float:
    """
    Update Stability after a review.

    Formula:
      S_new = S * weight * difficulty_factor
      difficulty_factor = (11 - D) / 10  ∈ [0.1, 1.0]

    For 'fail', partial credit: S_new = max(INIT_S, S * 0.5 * R)
    """
    w = GRADE_WEIGHTS[grade]
    diff_factor = (11.0 - D) / 10.0

    if grade == "fail":
        new_S = max(INIT_S, S * w * R)
    else:
        new_S = S * w * diff_factor

    return _clamp(new_S, MIN_S, MAX_S)

def update_D(D: float, grade: str) -> float:
    """
    Update Difficulty after a review.
      fail/hard → D increases (harder than thought)
      good      → D unchanged
      perfect   → D decreases (easier than thought)
    """
    if grade == "fail":
        new_D = D + 1.0
    elif grade == "hard":
        new_D = D + 0.5
    elif grade == "good":
        new_D = D
    else:  # perfect
        new_D = D - 0.5
    return _clamp(new_D, MIN_D, MAX_D)

def stability_to_score(S: float, R: float) -> int:
    """
    Convert FSRS (S, R) into a 0-100 dashboard stability score.

    Formula blends current retrievability with long-term stability:
      score = R * 60 + min(S / 30, 1.0) * 40
      → R=1, S=30d  → 100
      → R=0.9, S=10d → 58
      → R=0.5, S=1d  → 31
    Clamped to [0, 100].
    """
    r_component = R * 60.0
    s_component = min(S / 30.0, 1.0) * 40.0
    return int(_clamp(r_component + s_component, 0, 100))

def _status_from_score(score: int) -> str:
    if score >= 75: return "mastered"
    if score >= 60: return "good"
    if score >= 45: return "review"
    return "critical"

def _bar_color_from_score(score: int) -> str:
    if score >= 75: return "#10b981"
    if score >= 60: return "#0ea5e9"
    if score >= 45: return "#f59e0b"
    return "#EF4444"

# ── Seed from Keywords (first-time initialisation) ────────────────────────────

def _seed_from_keywords(
    chapter_profile: dict,
    full_text: str,
) -> tuple[float, float]:
    """
    Derive initial (S, D) from keyword hits in uploaded PDFs.
    Used only when a chapter has never been reviewed.

    Returns (S_seed, D_seed).
    """
    hard_hits = _count_keywords(full_text, chapter_profile["hard"])
    core_hits = _count_keywords(full_text, chapter_profile["core"])
    total = hard_hits + core_hits

    if total == 0:
        return INIT_S, INIT_D

    hard_ratio = hard_hits / total   # 0 = all core, 1 = all hard
    D_seed = _clamp(1.0 + hard_ratio * 9.0, MIN_D, MAX_D)
    S_seed = _clamp(20.0 - hard_ratio * 15.0, MIN_S, 20.0)
    return S_seed, D_seed

# ── State Key ─────────────────────────────────────────────────────────────────

def _key(subject: str, chapter_id: str) -> str:
    return f"{subject}/{chapter_id}"

# ── Session-based FSRS update ─────────────────────────────────────────────────

def record_session(
    subject: str,
    duration_minutes: float,
    focus_quality: float,   # 0.0–1.0
    pause_count: int = 0,
    user_id: str = None,
) -> dict:
    """
    Update FSRS state for ALL chapters of a subject after a study session.

    Duration rules (per spec):
      < 15 min  : No stability gain — threshold for memory encoding not met.
      15–44 min : Standard gain, scaled by focus_quality.
      45–90 min : 1.2x focus bonus applied to S gain.
      > 120 min : 0.8x saturation penalty applied to S gain.
      90–120    : No multiplier (full standard gain).

    Focus quality / pause impact:
      Frequent pausing (captured in focus_quality already, plus pause_count
      reinforcement) slightly increases D for each chapter.

    All chapters in the subject share the same session duration multiplier;
    individual chapter S/D values are preserved and updated incrementally.
    """
    if duration_minutes < 15:
        # Below encoding threshold — no update
        return {
            "subject": subject,
            "duration_minutes": duration_minutes,
            "applied": False,
            "reason": "Session too short (< 15 min). No stability gain recorded.",
            "chapters": [],
        }

    # ── Duration multiplier ──────────────────────────────────────────────────
    if duration_minutes <= 90:
        if duration_minutes >= 45:
            duration_multiplier = 1.2   # focus bonus zone
        else:
            duration_multiplier = 1.0   # 15–44 min: standard
    elif duration_minutes <= 120:
        duration_multiplier = 1.0       # 90–120 min: standard (fatigue alert shown)
    else:
        duration_multiplier = 0.8       # > 120 min: saturation penalty

    # ── Pause / focus_quality → difficulty pressure ──────────────────────────
    # Extra D pressure when the session was highly scattered:
    #   focus_quality < 0.5 with many pauses → small D nudge
    pause_rate = pause_count / max(duration_minutes, 1)   # pauses per minute
    d_pressure = 0.0
    if focus_quality < 0.5 and pause_rate > 0.1:
        d_pressure = min(0.5, pause_rate * 0.5)

    profiles  = CHAPTER_PROFILES.get(subject, [])
    state     = _load_state(user_id)
    results   = []
    today_str = _today_str()

    for profile in profiles:
        k     = _key(subject, profile["id"])
        entry = state.get(k)

        # Initialise if never seen
        if entry is None:
            entry = {
                "S":           INIT_S,
                "D":           INIT_D,
                "last_review": None,
                "reviews":     0,
                "last_score":  None,
            }

        S = entry["S"]
        D = entry["D"]

        # Current R (decay since last review)
        days = _days_since(entry["last_review"]) if entry.get("last_review") else 0.0
        R    = compute_R(S, days)

        # Session quality maps to a synthetic grade:
        #   focus_quality >= 0.75 → "good"
        #   focus_quality >= 0.50 → "hard"
        #   focus_quality <  0.50 → "fail" (only reached if >= 15 min, which is fine)
        if focus_quality >= 0.75:
            grade = "good"
        elif focus_quality >= 0.50:
            grade = "hard"
        else:
            grade = "fail"

        # ── Update S (with duration multiplier) ──────────────────────────────
        base_new_S = update_S(S, D, R, grade)
        new_S = _clamp(base_new_S * duration_multiplier, MIN_S, MAX_S)

        # ── Update D (with extra pause pressure) ─────────────────────────────
        base_new_D = update_D(D, grade)
        new_D = _clamp(base_new_D + d_pressure, MIN_D, MAX_D)

        entry.update({
            "S":           round(new_S, 3),
            "D":           round(new_D, 3),
            "last_review": today_str,
            "reviews":     entry.get("reviews", 0) + 1,
            # Keep last_score from quiz (don't overwrite with None)
        })
        state[k] = entry

        dash = stability_to_score(new_S, 1.0)
        results.append({
            "chapter_id": profile["id"],
            "title":      profile["title"],
            "S":          round(new_S, 3),
            "D":          round(new_D, 3),
            "R":          1.0,
            "stability":  dash,
            "status":     _status_from_score(dash),
            "bar_color":  _bar_color_from_score(dash),
            "grade":      grade,
        })

    _save_state(state, user_id)

    return {
        "subject":             subject,
        "duration_minutes":    duration_minutes,
        "focus_quality":       focus_quality,
        "pause_count":         pause_count,
        "duration_multiplier": duration_multiplier,
        "d_pressure":          round(d_pressure, 3),
        "applied":             True,
        "chapters":            results,
    }


# ── Public API ────────────────────────────────────────────────────────────────

def get_chapter_state(subject: str, chapter_id: str, user_id: str = None) -> dict:
    """
    Return the current FSRS state dict for a chapter.
    If no state exists yet, returns defaults.
    """
    state = _load_state(user_id)
    return state.get(_key(subject, chapter_id), {
        "S": INIT_S,
        "D": INIT_D,
        "last_review": None,
        "reviews": 0,
        "last_score": None,
    })

def record_quiz_result(
    subject: str,
    chapter_id: str,
    score: float,          # 0-100
    pdf_text: str = "",    # optional: current PDF content for seeding
    user_id: str = None,
) -> dict:
    """
    Update FSRS state after a quiz.

    1. Load current state (seed from PDFs if first review).
    2. Compute current R (decay since last review).
    3. Map score → grade.
    4. Update S and D.
    5. Persist.
    6. Return updated state + derived dashboard values.
    """
    state  = _load_state(user_id)
    k      = _key(subject, chapter_id)
    entry  = state.get(k)

    # ── First review: seed S and D from keyword analysis if PDF text available
    if entry is None:
        profile = next(
            (p for p in CHAPTER_PROFILES.get(subject, []) if p["id"] == chapter_id),
            None
        )
        if profile and pdf_text:
            S_seed, D_seed = _seed_from_keywords(profile, pdf_text)
        else:
            S_seed, D_seed = INIT_S, INIT_D

        entry = {
            "S": S_seed,
            "D": D_seed,
            "last_review": None,
            "reviews": 0,
            "last_score": None,
        }

    # ── Compute current R
    days = _days_since(entry["last_review"]) if entry.get("last_review") else 0.0
    R    = compute_R(entry["S"], days)

    # ── Grade and update
    grade = score_to_grade(score)
    new_S = update_S(entry["S"], entry["D"], R, grade)
    new_D = update_D(entry["D"], grade)

    # ── Build updated entry
    entry.update({
        "S":           round(new_S, 3),
        "D":           round(new_D, 3),
        "last_review": _today_str(),
        "reviews":     entry.get("reviews", 0) + 1,
        "last_score":  score,
    })

    state[k] = entry
    _save_state(state, user_id)

    # ── Derive dashboard values (R resets to 1.0 after review)
    dashboard_score = stability_to_score(new_S, 1.0)
    return {
        "subject":        subject,
        "chapter_id":     chapter_id,
        "grade":          grade,
        "S":              entry["S"],
        "D":              entry["D"],
        "R":              1.0,
        "stability":      dashboard_score,
        "status":         _status_from_score(dashboard_score),
        "bar_color":      _bar_color_from_score(dashboard_score),
        "reviews":        entry["reviews"],
        "last_review":    entry["last_review"],
        "last_score":     score,
        "next_review_in": round(new_S, 1),   # days until R drops to 0.9
    }

def calculate_stability(subject: str, chunks: list[dict], user_id: str = None) -> list[dict]:
    """
    For each chapter in subject:
      - Load FSRS state from JSON
      - If reviewed: compute current R from decay, derive dashboard score
      - If not reviewed: seed S/D from keyword analysis of PDF chunks
      - Return per-chapter result list

    This is the main function called by GET /api/stability/{subject}.
    """
    profiles = CHAPTER_PROFILES.get(subject, [])
    if not profiles:
        return []

    state     = _load_state(user_id)
    full_text = " ".join(c.get("content", "") for c in chunks)
    has_pdf   = bool(full_text.strip())

    results = []
    for profile in profiles:
        k     = _key(subject, profile["id"])
        entry = state.get(k)

        if entry and entry.get("last_review"):
            # ── Reviewed before: apply time-decay
            S    = entry["S"]
            D    = entry["D"]
            days = _days_since(entry["last_review"])
            R    = compute_R(S, days)
            dash = stability_to_score(S, R)
            assessed = True
        elif has_pdf:
            # ── Never reviewed but PDFs uploaded: seed from keywords
            S_seed, D_seed = _seed_from_keywords(profile, full_text)
            S    = S_seed
            D    = D_seed
            # No review yet → R is full (just "learned" from notes)
            R    = 1.0
            dash = stability_to_score(S, R)
            assessed = True
            days = 0.0
        else:
            # ── No data at all: neutral baseline
            S    = INIT_S
            D    = INIT_D
            R    = 1.0
            dash = 50
            days = 0.0
            assessed = False

        results.append({
            "chapter_id":       profile["id"],
            "title":            profile["title"],
            "stability":        dash,
            "status":           _status_from_score(dash),
            "bar_color":        _bar_color_from_score(dash),
            "S":                round(S, 2),
            "D":                round(D, 2),
            "R":                round(R, 4),
            "days_since_review": round(days, 1) if entry and entry.get("last_review") else None,
            "last_review":      entry.get("last_review") if entry else None,
            "last_score":       entry.get("last_score") if entry else None,
            "reviews":          entry.get("reviews", 0) if entry else 0,
            "next_review_in":   round(S, 1),
            "assessed":         assessed,
        })

    return results
