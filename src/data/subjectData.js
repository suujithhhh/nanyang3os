// ── All Subject Chapter Data ──────────────────────────────────────────────────

export const SUBJECT_META = {
  SC1007: {
    code: 'SC1007',
    title: 'Data Structures & Algorithms',
    progress: 72,
    daysToExam: 2,
    totalModules: 18,
    completedModules: 13,
    gradient: 'from-red-600 to-rose-400',
    shadowColor: 'shadow-red-500/30',
    examBorderColor: 'border-red-500/30',
    examTextColor: 'text-red-400',
    avgStabilityColor: 'text-red-400',
  },
  MH1810: {
    code: 'MH1810',
    title: 'Linear Algebra',
    progress: 55,
    daysToExam: 9,
    totalModules: 12,
    completedModules: 7,
    gradient: 'from-indigo-600 to-violet-400',
    shadowColor: 'shadow-indigo-500/30',
    examBorderColor: 'border-indigo-500/30',
    examTextColor: 'text-indigo-400',
    avgStabilityColor: 'text-indigo-400',
  },
  SC2001: {
    code: 'SC2001',
    title: 'Algorithm Design & Analysis',
    progress: 45,
    daysToExam: 21,
    totalModules: 14,
    completedModules: 6,
    gradient: 'from-sky-600 to-cyan-400',
    shadowColor: 'shadow-sky-500/30',
    examBorderColor: 'border-sky-500/30',
    examTextColor: 'text-sky-400',
    avgStabilityColor: 'text-sky-400',
  },
  SC2002: {
    code: 'SC2002',
    title: 'Object-Oriented Design',
    progress: 60,
    daysToExam: 28,
    totalModules: 12,
    completedModules: 7,
    gradient: 'from-violet-600 to-purple-400',
    shadowColor: 'shadow-violet-500/30',
    examBorderColor: 'border-violet-500/30',
    examTextColor: 'text-violet-400',
    avgStabilityColor: 'text-violet-400',
  },
  SC2005: {
    code: 'SC2005',
    title: 'Computer Organisation',
    progress: 38,
    daysToExam: 35,
    totalModules: 10,
    completedModules: 4,
    gradient: 'from-emerald-600 to-teal-400',
    shadowColor: 'shadow-emerald-500/30',
    examBorderColor: 'border-emerald-500/30',
    examTextColor: 'text-emerald-400',
    avgStabilityColor: 'text-emerald-400',
  },
};

export const SUBJECT_CHAPTERS = {
  SC1007: [
    { id: 'ch01', num: 'CH 01', title: 'Pointers & Memory', subtitle: 'Stack, Heap, Pointer Arithmetic, References', stability: 82, trend: 'up', status: 'mastered', lectures: 3, quizScore: 91, lastStudied: '3d ago', topics: ['Stack vs Heap', 'Pointer Arithmetic', 'Memory Leaks', 'References'], whySource: 'Quiz 1 result (91%) + Lecture 1–3 PDFs', borderColor: 'border-emerald-500/40', barColor: '#10b981', glowColor: 'rgba(16,185,129,0.12)' },
    { id: 'ch02', num: 'CH 02', title: 'Linked Lists', subtitle: 'Singly, Doubly, Circular & Operations', stability: 74, trend: 'up', status: 'good', lectures: 4, quizScore: 78, lastStudied: '1d ago', topics: ['Singly Linked', 'Doubly Linked', 'Circular List', 'Insert/Delete'], whySource: 'Quiz 2 result (78%) + Lecture 4–7 PDFs', borderColor: 'border-sky-500/40', barColor: '#0ea5e9', glowColor: 'rgba(14,165,233,0.12)' },
    { id: 'ch03', num: 'CH 03', title: 'Recursion', subtitle: 'Base Cases, Call Stack, Tail Recursion', stability: 41, trend: 'down', status: 'critical', lectures: 3, quizScore: 52, lastStudied: '4d ago', topics: ['Base Cases', 'Call Stack', 'Tail Recursion', 'Memoization'], whySource: 'Quiz 3 result (52%) — below threshold · Lecture 8 PDF flagged', borderColor: 'border-red-500/50', barColor: '#EF4444', glowColor: 'rgba(239,68,68,0.14)' },
    { id: 'ch04', num: 'CH 04', title: 'Binary Trees', subtitle: 'BST, Traversals, AVL & Rotations', stability: 68, trend: 'up', status: 'good', lectures: 5, quizScore: 72, lastStudied: '2h ago', topics: ['BST Operations', 'Inorder/Preorder', 'AVL Trees', 'Rotations'], whySource: 'Quiz 4 result (72%) + Lecture 9–13 PDFs + last notebook session', borderColor: 'border-indigo-500/40', barColor: '#6366f1', glowColor: 'rgba(99,102,241,0.12)' },
    { id: 'ch05', num: 'CH 05', title: 'Sorting Algorithms', subtitle: 'Bubble, Merge, Quick, Heap Sort', stability: 55, trend: 'neutral', status: 'review', lectures: 4, quizScore: 61, lastStudied: '2d ago', topics: ['Bubble Sort', 'Merge Sort', 'Quick Sort', 'Heap Sort'], whySource: 'Quiz 5 result (61%) + Lecture 14–17 PDFs', borderColor: 'border-amber-500/40', barColor: '#f59e0b', glowColor: 'rgba(245,158,11,0.12)' },
    { id: 'ch06', num: 'CH 06', title: 'Graph Algorithms', subtitle: 'BFS, DFS, Dijkstra, Minimum Spanning Trees', stability: 29, trend: 'down', status: 'critical', lectures: 5, quizScore: 38, lastStudied: '6d ago', topics: ['BFS/DFS', 'Dijkstra', "Prim's MST", 'Topological Sort'], whySource: 'Quiz 6 result (38%) — critical · Lecture 18 PDF not yet reviewed', borderColor: 'border-red-500/50', barColor: '#EF4444', glowColor: 'rgba(239,68,68,0.14)' },
  ],
  MH1810: [
    { id: 'ch01', num: 'CH 01', title: 'Vectors & Spaces', subtitle: 'Vector Operations, Dot/Cross Product, Subspaces', stability: 80, trend: 'up', status: 'mastered', lectures: 2, quizScore: 88, lastStudied: '2d ago', topics: ['Vector Ops', 'Dot Product', 'Cross Product', 'Subspaces'], whySource: 'Quiz 1 result (88%) + Lecture 1–2 PDFs', borderColor: 'border-emerald-500/40', barColor: '#10b981', glowColor: 'rgba(16,185,129,0.12)' },
    { id: 'ch02', num: 'CH 02', title: 'Matrix Operations', subtitle: 'Addition, Multiplication, Transpose, Inverse', stability: 76, trend: 'up', status: 'good', lectures: 3, quizScore: 81, lastStudied: '3d ago', topics: ['Matrix Mult', 'Transpose', 'Inverse', 'Rank'], whySource: 'Quiz 2 result (81%) + Lecture 3–5 PDFs', borderColor: 'border-sky-500/40', barColor: '#0ea5e9', glowColor: 'rgba(14,165,233,0.12)' },
    { id: 'ch03', num: 'CH 03', title: 'Systems of Equations', subtitle: 'Gaussian Elimination, Row Echelon, RREF', stability: 69, trend: 'neutral', status: 'good', lectures: 3, quizScore: 74, lastStudied: '4d ago', topics: ['Gaussian Elim', 'Row Echelon', 'RREF', 'Back Sub'], whySource: 'Quiz 3 result (74%) + Lecture 6–8 PDFs', borderColor: 'border-indigo-500/40', barColor: '#6366f1', glowColor: 'rgba(99,102,241,0.12)' },
    { id: 'ch04', num: 'CH 04', title: 'Determinants', subtitle: 'Cofactor Expansion, Properties, Cramer\'s Rule', stability: 58, trend: 'neutral', status: 'review', lectures: 2, quizScore: 63, lastStudied: '5d ago', topics: ['Cofactors', "Cramer's Rule", 'Properties', 'Expansion'], whySource: 'Quiz 4 result (63%) + Lecture 9–10 PDFs', borderColor: 'border-amber-500/40', barColor: '#f59e0b', glowColor: 'rgba(245,158,11,0.12)' },
    { id: 'ch05', num: 'CH 05', title: 'Eigenvalues & Eigenvectors', subtitle: 'Characteristic Polynomial, Diagonalisation', stability: 44, trend: 'down', status: 'critical', lectures: 3, quizScore: 55, lastStudied: '1d ago', topics: ['Char. Polynomial', 'Eigenvalues', 'Eigenvectors', 'Diagonalisation'], whySource: 'Quiz 5 result (55%) — weak · Lecture 11–13 PDFs flagged', borderColor: 'border-red-500/50', barColor: '#EF4444', glowColor: 'rgba(239,68,68,0.14)' },
    { id: 'ch06', num: 'CH 06', title: 'Orthogonality', subtitle: 'Gram-Schmidt, QR Decomposition, Projections', stability: 33, trend: 'down', status: 'critical', lectures: 2, quizScore: 41, lastStudied: '6d ago', topics: ['Gram-Schmidt', 'QR Decomp', 'Projections', 'Orthonormal'], whySource: 'Quiz 6 result (41%) — critical · Lecture 14–15 PDFs not reviewed', borderColor: 'border-red-500/50', barColor: '#EF4444', glowColor: 'rgba(239,68,68,0.14)' },
  ],
  SC2001: [
    { id: 'ch01', num: 'CH 01', title: 'Algorithm Basics', subtitle: 'Complexity, Big-O, Omega, Theta Notation', stability: 85, trend: 'up', status: 'mastered', lectures: 2, quizScore: 92, lastStudied: '3d ago', topics: ['Big-O', 'Omega', 'Theta', 'Asymptotic'], whySource: 'Quiz 1 result (92%) + Lecture 1–2 PDFs', borderColor: 'border-emerald-500/40', barColor: '#10b981', glowColor: 'rgba(16,185,129,0.12)' },
    { id: 'ch02', num: 'CH 02', title: 'Divide & Conquer', subtitle: 'Merge Sort, Quick Sort, Recurrences', stability: 78, trend: 'up', status: 'good', lectures: 3, quizScore: 83, lastStudied: '2d ago', topics: ['Merge Sort', 'Quick Sort', 'Recurrences', 'Master Theorem'], whySource: 'Quiz 2 result (83%) + Lecture 3–5 PDFs', borderColor: 'border-sky-500/40', barColor: '#0ea5e9', glowColor: 'rgba(14,165,233,0.12)' },
    { id: 'ch03', num: 'CH 03', title: 'Greedy Algorithms', subtitle: 'Activity Selection, Huffman, Kruskal', stability: 62, trend: 'neutral', status: 'review', lectures: 3, quizScore: 68, lastStudied: '4d ago', topics: ['Activity Select', 'Huffman Coding', "Kruskal's MST", 'Greedy Choice'], whySource: 'Quiz 3 result (68%) + Lecture 6–8 PDFs', borderColor: 'border-amber-500/40', barColor: '#f59e0b', glowColor: 'rgba(245,158,11,0.12)' },
    { id: 'ch04', num: 'CH 04', title: 'Dynamic Programming', subtitle: 'Memoization, Tabulation, Optimal Substructure', stability: 47, trend: 'down', status: 'critical', lectures: 4, quizScore: 54, lastStudied: '5d ago', topics: ['Memoization', 'Tabulation', 'LCS', 'Knapsack'], whySource: 'Quiz 4 result (54%) — below threshold · Lecture 9–12 PDFs flagged', borderColor: 'border-red-500/50', barColor: '#EF4444', glowColor: 'rgba(239,68,68,0.14)' },
    { id: 'ch05', num: 'CH 05', title: 'Graph Algorithms', subtitle: 'BFS, DFS, Dijkstra, Bellman-Ford', stability: 71, trend: 'up', status: 'good', lectures: 3, quizScore: 76, lastStudied: '1d ago', topics: ['BFS', 'DFS', 'Dijkstra', 'Bellman-Ford'], whySource: 'Quiz 5 result (76%) + Lecture 13–15 PDFs', borderColor: 'border-indigo-500/40', barColor: '#6366f1', glowColor: 'rgba(99,102,241,0.12)' },
    { id: 'ch06', num: 'CH 06', title: 'NP-Completeness', subtitle: 'P vs NP, Reductions, NP-Hard Problems', stability: 38, trend: 'down', status: 'critical', lectures: 2, quizScore: 44, lastStudied: '7d ago', topics: ['P vs NP', 'Reductions', 'NP-Hard', 'SAT Problem'], whySource: 'Quiz 6 result (44%) — critical · Lecture 16–17 not yet reviewed', borderColor: 'border-red-500/50', barColor: '#EF4444', glowColor: 'rgba(239,68,68,0.14)' },
  ],
  SC2002: [
    { id: 'ch01', num: 'CH 01', title: 'OOP Principles', subtitle: 'Encapsulation, Abstraction, Inheritance, Polymorphism', stability: 88, trend: 'up', status: 'mastered', lectures: 2, quizScore: 94, lastStudied: '2d ago', topics: ['Encapsulation', 'Abstraction', 'Inheritance', 'Polymorphism'], whySource: 'Quiz 1 result (94%) + Lecture 1–2 PDFs', borderColor: 'border-emerald-500/40', barColor: '#10b981', glowColor: 'rgba(16,185,129,0.12)' },
    { id: 'ch02', num: 'CH 02', title: 'UML & Modelling', subtitle: 'Class Diagrams, Sequence Diagrams, Use Cases', stability: 75, trend: 'up', status: 'good', lectures: 3, quizScore: 80, lastStudied: '3d ago', topics: ['Class Diagrams', 'Sequence Diag', 'Use Cases', 'UML Notation'], whySource: 'Quiz 2 result (80%) + Lecture 3–5 PDFs', borderColor: 'border-sky-500/40', barColor: '#0ea5e9', glowColor: 'rgba(14,165,233,0.12)' },
    { id: 'ch03', num: 'CH 03', title: 'SOLID Principles', subtitle: 'Single Responsibility, Open/Closed, Liskov, etc.', stability: 66, trend: 'neutral', status: 'review', lectures: 2, quizScore: 70, lastStudied: '4d ago', topics: ['SRP', 'Open/Closed', 'Liskov Sub', 'DIP'], whySource: 'Quiz 3 result (70%) + Lecture 6–7 PDFs', borderColor: 'border-amber-500/40', barColor: '#f59e0b', glowColor: 'rgba(245,158,11,0.12)' },
    { id: 'ch04', num: 'CH 04', title: 'Creational Patterns', subtitle: 'Singleton, Factory, Abstract Factory, Builder', stability: 59, trend: 'neutral', status: 'review', lectures: 3, quizScore: 64, lastStudied: '4d ago', topics: ['Singleton', 'Factory', 'Abstract Factory', 'Builder'], whySource: 'Quiz 4 result (64%) + Lecture 8–10 PDFs', borderColor: 'border-amber-500/40', barColor: '#f59e0b', glowColor: 'rgba(245,158,11,0.12)' },
    { id: 'ch05', num: 'CH 05', title: 'Structural Patterns', subtitle: 'Adapter, Decorator, Facade, Composite', stability: 51, trend: 'down', status: 'review', lectures: 3, quizScore: 58, lastStudied: '5d ago', topics: ['Adapter', 'Decorator', 'Facade', 'Composite'], whySource: 'Quiz 5 result (58%) + Lecture 11–13 PDFs', borderColor: 'border-amber-500/40', barColor: '#f59e0b', glowColor: 'rgba(245,158,11,0.12)' },
    { id: 'ch06', num: 'CH 06', title: 'Behavioural Patterns', subtitle: 'Observer, Strategy, Command, Iterator', stability: 43, trend: 'down', status: 'critical', lectures: 3, quizScore: 49, lastStudied: '6d ago', topics: ['Observer', 'Strategy', 'Command', 'Iterator'], whySource: 'Quiz 6 result (49%) — weak · Lecture 14–16 PDFs flagged for review', borderColor: 'border-red-500/50', barColor: '#EF4444', glowColor: 'rgba(239,68,68,0.14)' },
  ],
  SC2005: [
    { id: 'ch01', num: 'CH 01', title: 'Digital Logic', subtitle: 'Boolean Algebra, Logic Gates, Combinational Circuits', stability: 79, trend: 'up', status: 'good', lectures: 2, quizScore: 84, lastStudied: '3d ago', topics: ['Boolean Algebra', 'Logic Gates', 'Combinational', 'K-Maps'], whySource: 'Quiz 1 result (84%) + Lecture 1–2 PDFs', borderColor: 'border-sky-500/40', barColor: '#0ea5e9', glowColor: 'rgba(14,165,233,0.12)' },
    { id: 'ch02', num: 'CH 02', title: 'Data Representation', subtitle: 'Binary, Hex, Two\'s Complement, IEEE 754', stability: 72, trend: 'up', status: 'good', lectures: 2, quizScore: 77, lastStudied: '4d ago', topics: ['Binary/Hex', "Two's Complement", 'IEEE 754', 'Fixed Point'], whySource: 'Quiz 2 result (77%) + Lecture 3–4 PDFs', borderColor: 'border-indigo-500/40', barColor: '#6366f1', glowColor: 'rgba(99,102,241,0.12)' },
    { id: 'ch03', num: 'CH 03', title: 'CPU Architecture', subtitle: 'ALU, Registers, Control Unit, Datapath', stability: 48, trend: 'down', status: 'critical', lectures: 3, quizScore: 53, lastStudied: '5d ago', topics: ['ALU', 'Registers', 'Control Unit', 'Datapath'], whySource: 'Quiz 3 result (53%) — below threshold · Lecture 5–7 PDFs flagged', borderColor: 'border-red-500/50', barColor: '#EF4444', glowColor: 'rgba(239,68,68,0.14)' },
    { id: 'ch04', num: 'CH 04', title: 'Instruction Set Architecture', subtitle: 'RISC vs CISC, Addressing Modes, MIPS', stability: 41, trend: 'down', status: 'critical', lectures: 3, quizScore: 46, lastStudied: '7d ago', topics: ['RISC vs CISC', 'Addressing Modes', 'MIPS ISA', 'Instruction Types'], whySource: 'Quiz 4 result (46%) — critical · Lecture 8–10 PDFs not reviewed', borderColor: 'border-red-500/50', barColor: '#EF4444', glowColor: 'rgba(239,68,68,0.14)' },
    { id: 'ch05', num: 'CH 05', title: 'Memory Hierarchy', subtitle: 'Cache, RAM, Virtual Memory, Paging', stability: 35, trend: 'down', status: 'critical', lectures: 2, quizScore: 40, lastStudied: '8d ago', topics: ['Cache Levels', 'RAM Types', 'Virtual Memory', 'Paging/TLB'], whySource: 'Quiz 5 result (40%) — critical · Lecture 11–12 PDFs not reviewed', borderColor: 'border-red-500/50', barColor: '#EF4444', glowColor: 'rgba(239,68,68,0.14)' },
    { id: 'ch06', num: 'CH 06', title: 'I/O & Peripherals', subtitle: 'Interrupts, DMA, Bus Architecture, I/O Interfaces', stability: 55, trend: 'neutral', status: 'review', lectures: 2, quizScore: 60, lastStudied: '6d ago', topics: ['Interrupts', 'DMA', 'Bus Architecture', 'I/O Interfaces'], whySource: 'Quiz 6 result (60%) + Lecture 13–14 PDFs', borderColor: 'border-amber-500/40', barColor: '#f59e0b', glowColor: 'rgba(245,158,11,0.12)' },
  ],
};

// Mock AI responses keyed by context + agent tab + keywords
export const MOCK_AI_RESPONSES = {
  MH1810: {
    analyse: [
      { match: ['eigenvalue', 'ch05'], reply: 'CH05 Eigenvalues at 44%: your Quiz 5 showed difficulty with the characteristic polynomial and diagonalisation steps. Lecture 11–13 slides are flagged. Recommend 2h focused session.' },
      { match: ['orthogonal', 'ch06'], reply: 'CH06 Orthogonality at 33% is your most critical MH1810 gap. Gram-Schmidt and QR decomposition not yet reviewed. With 9 days to exam, start here tonight.' },
      { match: [], reply: 'MH1810 gap map: CH06 Orthogonality (33%), CH05 Eigenvalues (44%), CH04 Determinants (58%) need attention. Strong areas: CH01 Vectors (80%), CH02 Matrices (76%).' },
    ],
    plan: [
      { match: ['week', 'schedule', 'plan'], reply: 'MH1810 9-day plan: Days 1-2 Orthogonality (Gram-Schmidt drills), Days 3-4 Eigenvalues (characteristic polynomial practice), Days 5-6 Determinants (Cramer\'s Rule), Day 7 Matrices review, Days 8-9 Mock exam + weak area drill.' },
      { match: ['today', 'tonight', 'now'], reply: 'Tonight: CH06 Orthogonality — read Lecture 14 (Gram-Schmidt), attempt 3 worked examples. Estimated 90 min. Then 20 min spaced recall of CH05 Eigenvalue steps.' },
      { match: [], reply: 'Priority order for MH1810: CH06 Orthogonality → CH05 Eigenvalues → CH04 Determinants → CH03 Systems. CH01 and CH02 are solid — only light review needed before exam.' },
    ],
    mentor: [
      { match: ['gram', 'schmidt', 'orthogonal'], reply: 'Gram-Schmidt: given vectors {v1, v2, …}, produce orthonormal set {u1, u2, …}. Step 1: u1 = v1/||v1||. Step 2: subtract projection of v2 onto u1, then normalise. Repeat. Result: QR decomposition where Q has orthonormal columns.' },
      { match: ['eigenvalue', 'characteristic'], reply: 'Eigenvalue recipe: (1) Form A - λI. (2) Compute det(A - λI) = 0 — this is the characteristic polynomial. (3) Solve for λ. (4) For each λ, solve (A - λI)x = 0 to get eigenvectors.' },
      { match: [], reply: 'I am grounded in MH1810 Lectures 1–15. Ask me about Vectors, Matrices, Gaussian Elimination, Determinants, Eigenvalues, or Orthogonality — I\'ll reference your lecture slides and quiz mistakes.' },
    ],
  },
  SC2001: {
    analyse: [
      { match: ['dynamic', 'dp', 'ch04'], reply: 'CH04 Dynamic Programming at 47%: Quiz 4 shows confusion between memoization and tabulation, and difficulty setting up DP state. Lectures 9–12 are flagged. Two focused sessions should close this gap.' },
      { match: ['np', 'ch06'], reply: 'CH06 NP-Completeness at 38% is critical. Quiz 6 (44%) shows P vs NP concept unclear. With 21 days to exam, schedule 1 session this week and revisit in Week 3 via spaced repetition.' },
      { match: [], reply: 'SC2001 gap map: CH06 NP-Completeness (38%), CH04 Dynamic Programming (47%), CH03 Greedy (62%) need attention. Strengths: CH01 Big-O (85%), CH02 Divide & Conquer (78%).' },
    ],
    plan: [
      { match: ['today', 'tonight', 'now'], reply: 'Tonight: CH04 DP — start with memoized Fibonacci, then attempt LCS problem. Use tabulation approach. 90 min session. Then 15 min spaced review of CH02 Divide & Conquer.' },
      { match: [], reply: 'SC2001 study order (21 days): Week 1 — CH04 DP (2 sessions) + CH06 NP (1 session). Week 2 — CH03 Greedy + CH05 Graph review. Week 3 — full mock exam + spaced repetition on all critical chapters.' },
    ],
    mentor: [
      { match: ['dynamic', 'programming', 'dp'], reply: 'DP recipe: (1) Define subproblem — what does dp[i] represent? (2) Identify recurrence — how does dp[i] relate to smaller subproblems? (3) Base cases. (4) Order of computation. Example — LCS: dp[i][j] = length of LCS of s1[1..i] and s2[1..j].' },
      { match: ['np', 'p vs np'], reply: 'P = problems solvable in polynomial time. NP = problems verifiable in polynomial time. P ⊆ NP. NP-hard: at least as hard as hardest NP problems. NP-complete: NP-hard AND in NP. Famous NP-complete: SAT, 3-SAT, Clique, Vertex Cover.' },
      { match: [], reply: 'I am grounded in SC2001 Lectures 1–17. Ask me about Big-O, Divide & Conquer, Greedy algorithms, Dynamic Programming, Graph algorithms, or NP-Completeness.' },
    ],
  },
  SC2002: {
    analyse: [
      { match: ['behavioural', 'ch06', 'observer'], reply: 'CH06 Behavioural Patterns at 43%: Quiz 6 (49%) shows confusion between Observer and Strategy. Lectures 14–16 flagged. Recommend 1.5h session with worked code examples.' },
      { match: ['structural', 'ch05'], reply: 'CH05 Structural Patterns at 51% is borderline. Adapter vs Decorator distinction is weak based on quiz errors. 1 focused session should push this to review-safe.' },
      { match: [], reply: 'SC2002 gap map: CH06 Behavioural (43%), CH05 Structural (51%), CH04 Creational (59%) need work. Strengths: CH01 OOP (88%), CH02 UML (75%).' },
    ],
    plan: [
      { match: ['today', 'tonight', 'now'], reply: 'Tonight: CH06 Behavioural Patterns — implement Observer pattern in pseudocode, then compare with Strategy. 75 min. Use CH01 OOP Polymorphism as mental anchor.' },
      { match: [], reply: 'SC2002 study order (28 days): Week 1 — CH06 Behavioural + CH05 Structural. Week 2 — CH04 Creational + CH03 SOLID review. Week 3-4 — UML diagrams practice + full design exercise.' },
    ],
    mentor: [
      { match: ['observer', 'pattern'], reply: 'Observer: Subject maintains a list of Observers. When Subject state changes, it calls notify() which calls update() on each Observer. Use when: many objects depend on one, and you want loose coupling. Java: use java.util.Observable or custom interface.' },
      { match: ['strategy', 'pattern'], reply: 'Strategy: define a family of algorithms, encapsulate each, make them interchangeable. Context holds a reference to a Strategy interface. Client sets the strategy at runtime. Example: sorting with different comparators.' },
      { match: [], reply: 'I am grounded in SC2002 Lectures 1–16. Ask me about OOP principles, UML diagrams, SOLID, Creational/Structural/Behavioural design patterns — I\'ll walk through code examples.' },
    ],
  },
  SC2005: {
    analyse: [
      { match: ['memory', 'ch05'], reply: 'CH05 Memory Hierarchy at 35% is your most critical SC2005 gap. Cache levels, virtual memory, and paging/TLB concepts flagged. Quiz 5 (40%) shows foundational gaps. 2 focused sessions needed.' },
      { match: ['isa', 'ch04', 'risc'], reply: 'CH04 ISA at 41%: RISC vs CISC distinction and MIPS addressing modes are weak. Quiz 4 (46%) confirms this. Lectures 8–10 not yet reviewed in depth.' },
      { match: [], reply: 'SC2005 gap map: CH05 Memory Hierarchy (35%), CH04 ISA (41%), CH03 CPU Architecture (48%) are critical. Strengths: CH01 Digital Logic (79%), CH02 Data Representation (72%).' },
    ],
    plan: [
      { match: ['today', 'tonight', 'now'], reply: 'Tonight: CH05 Memory Hierarchy — draw the cache hierarchy diagram from memory, then study virtual memory paging with TLB. 2h session. Quiz yourself on cache hit/miss rates.' },
      { match: [], reply: 'SC2005 study order (35 days): Week 1 — CH05 Memory + CH04 ISA. Week 2 — CH03 CPU Architecture. Week 3 — CH06 I/O review. Week 4 — CH01 & CH02 light review. Week 5 — full mock exam.' },
    ],
    mentor: [
      { match: ['cache', 'memory', 'virtual'], reply: 'Memory hierarchy: Registers (fastest, smallest) → L1/L2/L3 Cache → RAM → Disk. Cache works on temporal/spatial locality. Virtual memory: each process gets its own address space. TLB = Translation Lookaside Buffer — caches page table entries for fast VA→PA translation.' },
      { match: ['risc', 'cisc', 'mips'], reply: 'RISC: fixed-length instructions, load/store architecture, many registers, simple addressing. CISC: variable-length, complex instructions doing many operations, fewer registers. MIPS is a RISC ISA: 32 registers, 3 instruction formats (R/I/J), 32-bit fixed width.' },
      { match: [], reply: 'I am grounded in SC2005 Lectures 1–14. Ask me about Digital Logic, Data Representation, CPU Architecture, ISA/MIPS, Memory Hierarchy, or I/O systems.' },
    ],
  },

  home: {
    analyse: [
      { match: ['gap', 'critical', 'weak'], reply: 'Your 3 critical gaps are: SC1007 Recursion (41%), SC1007 Graph Algorithms (29%), and MH1810 Orthogonality (33%). I recommend tackling Recursion first as it unblocks Graph understanding.' },
      { match: ['sc1007', 'recursion'], reply: 'SC1007 Recursion sits at 41% stability. Your Quiz 3 showed weak base-case identification. I suggest reviewing Lecture 8 slides 14–22 and attempting 5 practice problems.' },
      { match: ['mh1810', 'linear algebra'], reply: 'MH1810 has 2 critical chapters: Eigenvalues (44%) and Orthogonality (33%). With 9 days until your exam, I recommend 2 sessions per chapter starting today.' },
      { match: [], reply: 'Across all 5 subjects, I detect 5 chapters below the 50% stability threshold. Your strongest subject is SC2002 OOP (avg 63.7%). Would you like a full breakdown?' },
    ],
    plan: [
      { match: ['week', 'schedule', 'plan'], reply: 'Week 8 plan: Mon — SC1007 Graph BFS/DFS (2h). Tue — SC1007 Recursion drills (1.5h). Wed — MH1810 Eigenvalues (2h). Thu — Mock exam SC1007. Fri — MH1810 Orthogonality review (2h).' },
      { match: ['exam', 'sc1007'], reply: 'SC1007 exam is in 2 days. I recommend: tonight — Graph Algorithms review (CH06), tomorrow morning — Recursion practice (CH03), afternoon — full past paper under timed conditions.' },
      { match: [], reply: 'Your optimal study sequence based on spaced repetition and exam proximity: (1) SC1007 critical gaps, (2) MH1810 exam prep, (3) SC2001 DP chapter, (4) SC2002 Behavioural Patterns.' },
    ],
    mentor: [
      { match: ['recursion', 'explain'], reply: 'Recursion: a function that calls itself with a smaller input until a base case is reached. Key insight — every recursive call adds a stack frame. Stack overflow occurs when base case is never reached. Example: factorial(n) = n * factorial(n-1), base: factorial(0) = 1.' },
      { match: ['eigenvalue', 'explain'], reply: 'An eigenvalue λ satisfies Av = λv where v is a non-zero eigenvector. To find eigenvalues: solve det(A - λI) = 0. This characteristic polynomial gives you all eigenvalues. Then substitute back to find eigenvectors.' },
      { match: [], reply: 'I have all 5 subject lecture PDFs indexed and ready. You can ask me to explain any concept, walk through a proof, or quiz you on a topic. What would you like to explore?' },
    ],
  },
  SC1007: {
    analyse: [
      { match: ['recursion', 'ch03', 'gap'], reply: 'CH03 Recursion at 41%: your Quiz 3 errors were concentrated in memoization (missed 4/5 questions) and tail recursion identification. Lecture 8, slides 14–22 cover exactly these. Estimated 90 min to close this gap.' },
      { match: ['graph', 'ch06'], reply: 'CH06 Graph Algorithms at 29% is your most critical gap. You have not reviewed Lecture 18 (Dijkstra) and scored 38% on Quiz 6. With 2 days to exam, I suggest a focused 2h session tonight on BFS/DFS, then Dijkstra tomorrow.' },
      { match: [], reply: 'SC1007 gap map: CH03 Recursion (41%) and CH06 Graph Algorithms (29%) are below threshold. CH05 Sorting (55%) needs reinforcement. Your strongest chapters are CH01 Pointers (82%) and CH02 Linked Lists (74%).' },
    ],
    plan: [
      { match: ['pointer', 'ch01'], reply: 'Great news — CH01 Pointers is your anchor at 82%. Use this as a bridge: pointer-based thinking directly applies to Linked List traversal (CH02) and recursive stack frames (CH03). Build from your strength.' },
      { match: ['tonight', 'today', 'now'], reply: 'Tonight\'s plan: (1) 30 min — CH06 BFS/DFS flashcards, (2) 45 min — Dijkstra worked examples from Lecture 18, (3) 20 min — CH03 Recursion base case drills. Total: 95 min.' },
      { match: [], reply: 'Optimal SC1007 study order with 2 days left: CH06 Graph (tonight, 2h) → CH03 Recursion (tomorrow morning, 1.5h) → CH05 Sorting revision (tomorrow afternoon, 1h) → CH04 Binary Trees light review (30 min).' },
    ],
    mentor: [
      { match: ['binary tree', 'bst', 'ch04'], reply: 'BST property: for any node N, all left subtree values < N < all right subtree values. Inorder traversal of a BST gives sorted output. Insertion: O(log n) average, O(n) worst case (degenerate). AVL trees maintain balance via rotations.' },
      { match: ['recursion', 'base case'], reply: 'Base case pattern: always identify (1) the smallest valid input, (2) what the function should return for it. Example — binary search: base case is when low > high (not found) or arr[mid] == target (found). Every recursive step must move toward the base case.' },
      { match: ['graph', 'bfs', 'dfs'], reply: 'BFS uses a queue, explores level-by-level, finds shortest path in unweighted graphs. DFS uses a stack (or recursion), explores depth-first, useful for cycle detection and topological sort. Both are O(V+E) time complexity.' },
      { match: [], reply: 'I am grounded in SC1007 Lectures 1–18 and your quiz results. Ask me to explain Recursion, Graph traversal, Sorting algorithms, Binary Trees, Linked Lists, or Pointer arithmetic — I will reference your specific lecture material.' },
    ],
  },
};
