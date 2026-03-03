import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import {
  CheckCircle2, XCircle, ChevronRight, RotateCcw,
  Target, Clock, Zap, Trophy, Brain, TrendingUp, TrendingDown, Minus, Loader2,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || '';

async function submitQuizResult(subject, chapterId, score, total, correct) {
  if (!API_BASE) return null;
  const userId = localStorage.getItem('currentUser') || 'anonymous';
  try {
    const res = await fetch(`${API_BASE}/api/quiz-result`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-ID': userId },
      body: JSON.stringify({
        subject,
        chapter_id: chapterId,
        score,
        total_questions: total,
        correct,
      }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ── Question bank keyed by chapterId ─────────────────────────────────────────

const QUESTION_BANK = {
  // SC1007
  'SC1007-ch01': [
    { q: 'What happens when you dereference a NULL pointer in C?', options: ['Returns 0', 'Segmentation fault / undefined behaviour', 'Allocates memory', 'Returns the pointer address'], answer: 1, explain: 'Dereferencing NULL is undefined behaviour — most OS implementations raise SIGSEGV (segfault).' },
    { q: 'Which memory region stores local variables in C?', options: ['Heap', 'BSS segment', 'Stack', 'Data segment'], answer: 2, explain: 'Local variables live on the call stack and are automatically reclaimed when the function returns.' },
    { q: 'Pointer arithmetic: if int *p points to arr[2], what does p+1 point to?', options: ['arr[2] + 1 byte', 'arr[3]', 'arr[1]', 'Undefined'], answer: 1, explain: 'p+1 advances by sizeof(int) bytes, pointing to the next integer element arr[3].' },
  ],
  'SC1007-ch02': [
    { q: 'In a singly linked list, what is the time complexity of deletion given a pointer to the node?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], answer: 1, explain: 'You must traverse to find the predecessor, making deletion O(n) unless you have the previous node pointer.' },
    { q: 'Which linked list variant allows traversal in both directions?', options: ['Circular list', 'Singly linked list', 'Doubly linked list', 'Skip list'], answer: 2, explain: 'Doubly linked lists store both next and prev pointers, enabling bidirectional traversal.' },
  ],
  'SC1007-ch03': [
    { q: 'What is the base case for computing factorial(n) recursively?', options: ['n == 1 returns n', 'n == 0 returns 1', 'n < 0 returns -1', 'n == 2 returns 2'], answer: 1, explain: 'factorial(0) = 1 is the standard base case. Without it, the recursion would not terminate.' },
    { q: 'What problem does memoization solve in recursive algorithms?', options: ['Stack overflow', 'Recomputing overlapping subproblems', 'Infinite loops', 'Memory leaks'], answer: 1, explain: 'Memoization caches previously computed results so overlapping recursive calls return instantly.' },
    { q: 'How many stack frames does factorial(5) create?', options: ['4', '5', '6', '10'], answer: 2, explain: 'factorial(5) → factorial(4) → … → factorial(0): 6 frames (5 down to 0 inclusive).' },
  ],
  'SC1007-ch04': [
    { q: 'In a BST, inorder traversal produces elements in which order?', options: ['Random', 'Reverse sorted', 'Sorted ascending', 'Level order'], answer: 2, explain: 'BST inorder (left → root → right) always yields elements in ascending sorted order.' },
    { q: 'What rotation fixes a left-left imbalance in an AVL tree?', options: ['Left rotation', 'Right rotation', 'Left-Right double rotation', 'Right-Left double rotation'], answer: 1, explain: 'A single right rotation at the unbalanced node restores AVL balance in the LL case.' },
  ],
  'SC1007-ch05': [
    { q: 'What is the worst-case time complexity of Quick Sort?', options: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'], answer: 1, explain: 'Quick Sort degrades to O(n²) when the pivot is always the smallest or largest element (already sorted input with naive pivot).' },
    { q: 'Merge Sort is stable. What does "stable" mean?', options: ['It never crashes', 'Equal elements maintain their original relative order', 'It runs in O(1) space', 'It works on linked lists only'], answer: 1, explain: 'A stable sort preserves the original order of equal keys, important when sorting compound records.' },
  ],
  'SC1007-ch06': [
    { q: "BFS on an unweighted graph finds the shortest path. Why?", options: ['It uses a stack', 'It explores all nodes at distance k before k+1', 'It uses dynamic programming', 'It backtracks optimally'], answer: 1, explain: 'BFS expands nodes level by level, so the first time a node is reached, it is via the fewest edges.' },
    { q: "Dijkstra's algorithm fails on graphs with:", options: ['Directed edges', 'Negative edge weights', 'Weighted edges', 'Cycles'], answer: 1, explain: "Dijkstra's greedy relaxation assumes all edge weights are non-negative. Negative weights break the invariant." },
    { q: 'What data structure makes DFS naturally iterative?', options: ['Queue', 'Priority queue', 'Stack', 'Hash map'], answer: 2, explain: 'DFS uses a stack (explicitly or via the call stack in recursion) to track the frontier.' },
  ],
  // MH1810
  'MH1810-ch01': [
    { q: 'The dot product of two orthogonal vectors is:', options: ['1', '-1', '0', 'Undefined'], answer: 2, explain: 'Orthogonal (perpendicular) vectors have cos(90°) = 0, making their dot product zero.' },
  ],
  'MH1810-ch05': [
    { q: 'To find eigenvalues of matrix A, you solve:', options: ['Ax = 0', 'det(A - λI) = 0', 'A^T x = λx', 'tr(A) = λ'], answer: 1, explain: 'The characteristic equation det(A − λI) = 0 gives all eigenvalues λ.' },
    { q: 'A matrix is diagonalisable if and only if:', options: ['It is symmetric', 'It has n linearly independent eigenvectors', 'All eigenvalues are distinct', 'Its determinant is nonzero'], answer: 1, explain: 'Diagonalisability requires a full set of n linearly independent eigenvectors (forming the basis for the change-of-basis matrix P).' },
  ],
  // SC2001
  'SC2001-ch04': [
    { q: 'Which property must a problem have for dynamic programming to apply?', options: ['Greedy choice', 'Optimal substructure', 'Polynomial time', 'Linear space'], answer: 1, explain: 'DP requires optimal substructure: an optimal solution contains optimal solutions to subproblems.' },
    { q: 'In the 0/1 knapsack DP, what does dp[i][w] represent?', options: ['Number of items', 'Max value using first i items with capacity w', 'Weight of item i', 'Remaining capacity'], answer: 1, explain: 'dp[i][w] = maximum value achievable with the first i items and weight limit w.' },
  ],
  // SC2002
  'SC2002-ch06': [
    { q: 'The Observer pattern defines a:', options: ['One-to-one dependency', 'One-to-many dependency', 'Many-to-many relationship', 'Singleton constraint'], answer: 1, explain: 'Observer establishes a one-to-many dependency so when one subject changes state, all observers are notified automatically.' },
    { q: 'Strategy pattern enables:', options: ['Object creation at runtime', 'Interchangeable algorithms at runtime', 'Lazy initialisation', 'Structural composition'], answer: 1, explain: 'Strategy defines a family of algorithms and makes them interchangeable, allowing behaviour to vary independently from clients that use it.' },
  ],
  // SC2005
  'SC2005-ch04': [
    { q: 'RISC architecture primarily features:', options: ['Complex variable-length instructions', 'Simple fixed-length instructions', 'Hardware-managed memory', 'Large instruction sets'], answer: 1, explain: 'RISC (Reduced Instruction Set Computer) uses simple, fixed-length instructions executable in one clock cycle.' },
  ],
};

// Fallback generic questions
const FALLBACK_QUESTIONS = [
  { q: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'], answer: 1, explain: 'Binary search halves the search space each step, giving O(log n) time complexity.' },
  { q: 'Which data structure is LIFO?', options: ['Queue', 'Stack', 'Heap', 'Deque'], answer: 1, explain: 'A Stack is Last-In-First-Out — the most recently pushed element is popped first.' },
  { q: 'Big-O notation describes:', options: ['Exact runtime', 'Worst-case growth rate', 'Average-case performance', 'Memory usage only'], answer: 1, explain: 'Big-O gives an upper bound on the growth rate of an algorithm\'s resource usage.' },
];

function getQuestions(subjectCode, chapterId) {
  const key = chapterId ? `${subjectCode}-${chapterId}` : null;
  const bank = (key && QUESTION_BANK[key]) || FALLBACK_QUESTIONS;
  // Shuffle and take up to 3
  return [...bank].sort(() => Math.random() - 0.5).slice(0, Math.min(3, bank.length));
}

// ── Timer hook ────────────────────────────────────────────────────────────────

function useTimer(active) {
  const [seconds, setSeconds] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (active) {
      ref.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      clearInterval(ref.current);
    }
    return () => clearInterval(ref.current);
  }, [active]);
  const reset = () => setSeconds(0);
  return { seconds, reset };
}

// ── Quiz Simulator ───────────────────────────────────────────────────────────

export default function QuizSimulator({ subjectCode, chapterId = null, chapterTitle = '', onQuizComplete }) {
  const [phase, setPhase] = useState('idle'); // idle | quiz | done
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showExplain, setShowExplain] = useState(false);
  const [fsrsResult, setFsrsResult] = useState(null);   // FSRS API response
  const [submitting, setSubmitting] = useState(false);
  const { seconds, reset } = useTimer(phase === 'quiz');

  const start = () => {
    const qs = getQuestions(subjectCode, chapterId);
    setQuestions(qs);
    setCurrent(0);
    setSelected(null);
    setAnswers([]);
    setShowExplain(false);
    setFsrsResult(null);
    reset();
    setPhase('quiz');
  };

  const handleSelect = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    setShowExplain(true);
  };

  const handleNext = async () => {
    const q = questions[current];
    const newAnswers = [...answers, { correct: selected === q.answer, selected, answer: q.answer }];
    setAnswers(newAnswers);
    if (current + 1 < questions.length) {
      setCurrent(c => c + 1);
      setSelected(null);
      setShowExplain(false);
    } else {
      // Last question — compute score and submit to FSRS
      const correctCount = newAnswers.filter(a => a.correct).length;
      const totalQ = questions.length;
      const pctScore = Math.round((correctCount / totalQ) * 100);

      setPhase('done');

      if (chapterId && subjectCode) {
        setSubmitting(true);
        const result = await submitQuizResult(
          subjectCode, chapterId, pctScore, totalQ, correctCount
        );
        setFsrsResult(result);
        setSubmitting(false);
        if (result && onQuizComplete) onQuizComplete();
      }
    }
  };

  const score = answers.filter(a => a.correct).length;
  const total = questions.length;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  // Idle state
  if (phase === 'idle') {
    return (
      <div className="rounded-xl p-5 bg-slate-900/70 border border-indigo-500/20 backdrop-blur-sm flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Brain size={15} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-100">Practice Quiz</h3>
          {chapterTitle && (
            <span className="text-[10px] font-mono text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-700/40">
              {chapterTitle}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500">
          Test your knowledge with AI-curated questions grounded in your lecture material and quiz history.
        </p>
        <button
          onClick={start}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 hover:text-indigo-200 transition-all"
        >
          <Zap size={14} />
          Start Practice Quiz
        </button>
      </div>
    );
  }

  // Done state
  if (phase === 'done') {
    const grade = pct >= 80 ? 'Excellent' : pct >= 60 ? 'Good' : pct >= 40 ? 'Needs Work' : 'Critical';
    const gradeColor = pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-sky-400' : pct >= 40 ? 'text-amber-400' : 'text-red-400';

    // FSRS grade label and trend icon
    const fsrsGrade = fsrsResult?.grade;
    const fsrsGradeColor = {
      perfect: 'text-emerald-400', good: 'text-sky-400',
      hard: 'text-amber-400', fail: 'text-red-400',
    }[fsrsGrade] ?? 'text-slate-400';
    const FsrsTrendIcon = fsrsGrade === 'perfect' || fsrsGrade === 'good'
      ? TrendingUp : fsrsGrade === 'fail' ? TrendingDown : Minus;

    return (
      <div className="rounded-xl p-5 bg-slate-900/70 border border-indigo-500/20 backdrop-blur-sm flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Trophy size={15} className="text-amber-400" />
          <h3 className="text-sm font-semibold text-slate-100">Quiz Complete</h3>
        </div>
        <div className="flex items-center gap-5">
          <div className="flex flex-col items-center justify-center w-20 h-20 rounded-full border-4 shrink-0"
            style={{ borderColor: pct >= 60 ? '#6366f1' : '#ef4444' }}>
            <span className="text-2xl font-bold text-slate-50">{pct}%</span>
            <span className="text-[9px] text-slate-500 font-mono">score</span>
          </div>
          <div className="flex flex-col gap-1">
            <p className={cn('text-lg font-bold', gradeColor)}>{grade}</p>
            <p className="text-xs text-slate-400">{score}/{total} correct · {seconds}s</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <Clock size={10} /> {Math.round(seconds / Math.max(total,1))}s avg
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <Target size={10} /> {total} questions
              </div>
            </div>
          </div>
        </div>

        {/* Per-question review */}
        <div className="flex flex-col gap-1.5">
          {answers.map((a, i) => (
            <div key={i} className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border',
              a.correct ? 'bg-emerald-500/8 border-emerald-500/20 text-emerald-400' : 'bg-red-500/8 border-red-500/20 text-red-400'
            )}>
              {a.correct ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
              <span className="text-slate-400">Q{i + 1}:</span>
              <span>{a.correct ? 'Correct' : `Wrong — correct was option ${a.answer + 1}`}</span>
            </div>
          ))}
        </div>

        {/* ── FSRS Memory Model Update ── */}
        {chapterId && (
          <div className={cn(
            'rounded-xl border p-3 flex flex-col gap-2',
            submitting
              ? 'bg-slate-800/40 border-slate-700/40'
              : fsrsResult
                ? 'bg-indigo-500/8 border-indigo-500/20'
                : 'bg-slate-800/40 border-slate-700/40'
          )}>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-semibold">
                FSRS Memory Model
              </span>
              {submitting && <Loader2 size={10} className="animate-spin text-slate-500" />}
            </div>

            {submitting && (
              <p className="text-[10px] font-mono text-slate-500">Updating stability state…</p>
            )}

            {!submitting && fsrsResult && (
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Stability', value: `${fsrsResult.S}d`, sub: 'days to R=0.9' },
                  { label: 'Difficulty', value: `${fsrsResult.D}/10`, sub: 'material hardness' },
                  { label: 'Next Review', value: `${fsrsResult.next_review_in}d`, sub: 'optimal interval' },
                ].map(item => (
                  <div key={item.label} className="rounded-lg bg-slate-800/60 border border-slate-700/40 px-2 py-1.5 text-center">
                    <p className="text-sm font-bold text-slate-100">{item.value}</p>
                    <p className="text-[9px] text-slate-500 font-mono">{item.label}</p>
                  </div>
                ))}
              </div>
            )}

            {!submitting && fsrsResult && (
              <div className={cn(
                'flex items-center gap-2 text-[10px] font-mono px-2 py-1 rounded-lg',
                fsrsGradeColor
              )}>
                <FsrsTrendIcon size={11} />
                <span className="font-semibold capitalize">{fsrsGrade}</span>
                <span className="text-slate-500 ml-1">·</span>
                <span className="text-slate-500">
                  {fsrsGrade === 'perfect' ? 'Memory consolidated — interval extended significantly'
                   : fsrsGrade === 'good'    ? 'Good recall — stability increased'
                   : fsrsGrade === 'hard'    ? 'Recall was difficult — shorter next interval'
                   : 'Memory unstable — stability reset, review again soon'}
                </span>
              </div>
            )}

            {!submitting && fsrsResult && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-mono text-slate-600">Dashboard stability:</span>
                <div className="flex-1 h-1.5 rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${fsrsResult.stability}%`,
                      background: fsrsResult.bar_color,
                    }}
                  />
                </div>
                <span className="text-[10px] font-mono font-semibold" style={{ color: fsrsResult.bar_color }}>
                  {fsrsResult.stability}%
                </span>
              </div>
            )}

            {!submitting && !fsrsResult && (
              <p className="text-[10px] font-mono text-slate-600">
                Select a chapter to record FSRS memory updates
              </p>
            )}
          </div>
        )}

        {pct < 60 && (
          <div className="p-3 rounded-lg bg-amber-500/8 border border-amber-500/20 text-xs text-amber-300">
            <span className="font-semibold">AI Recommendation:</span> Schedule a focused revision session. The Mentor agent can explain any concepts you struggled with.
          </div>
        )}

        <button
          onClick={start}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-sm font-medium bg-slate-800/60 text-slate-300 border border-slate-700/50 hover:bg-slate-700/60 transition-all"
        >
          <RotateCcw size={13} />
          Retry Quiz
        </button>
      </div>
    );
  }

  // Quiz phase
  const q = questions[current];
  const isCorrect = selected === q.answer;
  const progress = ((current) / questions.length) * 100;

  return (
    <div className="rounded-xl p-5 bg-slate-900/70 border border-indigo-500/20 backdrop-blur-sm flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain size={14} className="text-indigo-400" />
          <span className="text-xs font-mono text-slate-500">Q{current + 1}/{questions.length}</span>
        </div>
        <div className="flex items-center gap-1 text-xs font-mono text-slate-500">
          <Clock size={11} />
          {seconds}s
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question */}
      <p className="text-sm font-medium text-slate-100 leading-relaxed">{q.q}</p>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {q.options.map((opt, i) => {
          let style = 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:border-indigo-500/40 hover:bg-indigo-500/8';
          if (selected !== null) {
            if (i === q.answer) style = 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300';
            else if (i === selected && i !== q.answer) style = 'bg-red-500/15 border-red-500/50 text-red-300';
            else style = 'bg-slate-800/30 border-slate-700/30 text-slate-500 opacity-60';
          }
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={selected !== null}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs border text-left transition-all duration-150',
                style
              )}
            >
              <span className="font-mono text-slate-500 shrink-0">{String.fromCharCode(65 + i)}.</span>
              {opt}
              {selected !== null && i === q.answer && <CheckCircle2 size={13} className="ml-auto text-emerald-400 shrink-0" />}
              {selected !== null && i === selected && i !== q.answer && <XCircle size={13} className="ml-auto text-red-400 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {showExplain && (
        <div className={cn(
          'p-3 rounded-lg text-xs border leading-relaxed',
          isCorrect
            ? 'bg-emerald-500/8 border-emerald-500/20 text-emerald-300'
            : 'bg-red-500/8 border-red-500/20 text-red-300'
        )}>
          <span className="font-semibold">{isCorrect ? '✓ Correct! ' : '✗ Not quite. '}</span>
          <span className="text-slate-400">{q.explain}</span>
        </div>
      )}

      {/* Next button */}
      {selected !== null && (
        <button
          onClick={handleNext}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-all"
        >
          {current + 1 < questions.length ? (
            <><ChevronRight size={14} /> Next Question</>
          ) : (
            <><Trophy size={14} /> See Results</>
          )}
        </button>
      )}
    </div>
  );
}
