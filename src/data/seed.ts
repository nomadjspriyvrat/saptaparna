import { latexToHtml } from "../latex";
import type { Course, CourseModule, DB, LiveClass, Payment, StudentRec, Trainer } from "../types";

const now = Date.now();
const iso = (dayOffset: number, hour = 12) => {
  const d = new Date(now + dayOffset * 86400000);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};
const dateOnly = (dayOffset: number) => {
  const d = new Date(now + dayOffset * 86400000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const T1 = "trn_1";

const trainers: Trainer[] = [
  {
    _id: T1,
    name: "Dr. Ananya Rao",
    email: "admin@edulaunch.io",
    password: "edulaunch",
    role: "admin",
    bio: "Former IISc faculty, 12 years of teaching real analysis and measure theory. Believes every student deserves beautifully typeset mathematics — and that ε–δ clicks once you see it argued honestly, line by line.",
    hue: 42,
    specialization: ["Real Analysis", "Measure Theory", "Functional Analysis"],
    experienceYears: 12,
  },
];

const courses: Course[] = [
  {
    _id: "crs_calc",
    title: "Advanced Calculus & Real Analysis",
    slug: "advanced-calculus",
    tagline: "From ε–δ to Lebesgue — a rigorous, LaTeX-typeset journey through the foundations of analysis.",
    description:
      "A proof-based tour of single-variable and classical analysis: limits, continuity, differentiation, the Riemann integral, sequences of functions, power series, Fourier series, and a first look at measure theory. Every lesson is authored in LaTeX and compiled on the platform, so the mathematics reads exactly as it would in a published text.",
    category: "Mathematics",
    level: "Undergraduate",
    totalHours: 32,
    pricing: { amount: 4999, currency: "INR", discountPrice: 2999, trialDays: 2 },
    isPublished: true,
    instructorId: T1,
    enrolled: 1284,
    rating: 4.9,
    createdAt: iso(-210),
  },
  {
    _id: "crs_linalg",
    title: "Linear Algebra, Done Rigorously",
    slug: "linear-algebra",
    tagline: "Vector spaces, linear maps, and spectral theory with complete proofs.",
    description:
      "A second course in linear algebra that treats the subject the way pure mathematics does: axioms first, matrices as consequences. Includes eigen-theory, inner product spaces, and the spectral theorem.",
    category: "Mathematics",
    level: "Undergraduate",
    totalHours: 18,
    pricing: { amount: 3499, currency: "INR", discountPrice: 1999, trialDays: 2 },
    isPublished: true,
    instructorId: T1,
    enrolled: 486,
    rating: 4.8,
    createdAt: iso(-120),
  },
];

/* ------------------------------------------------------------------ */
/*  Module LaTeX sources                                               */
/* ------------------------------------------------------------------ */

const L1 = String.raw`
\section{The Language of Convergence}
Analysis begins with one idea: \textbf{approximation you can control}. Calculus told you \emph{what} a limit is; analysis tells you exactly \emph{what that sentence means}.

\begin{definition}[Limit of a sequence]
We write $\lim_{n\to\infty} a_n = L$ if for every $\varepsilon > 0$ there exists $N \in \mathbb{N}$ such that
\[ |a_n - L| < \varepsilon \quad \text{for all } n \ge N. \]
\end{definition}

Notice the order of the quantifiers: \textbf{for every} $\varepsilon$, \textbf{there exists} an $N$. The challenger picks $\varepsilon$ first; you must respond with an $N$ that works for \emph{all} later terms at once.

\begin{example}
Show that $\lim_{n\to\infty} \frac{n}{n+1} = 1$. Given $\varepsilon > 0$,
\[ \left| \frac{n}{n+1} - 1 \right| = \frac{1}{n+1} < \frac{1}{n}. \]
Choosing $N = \lceil 1/\varepsilon \rceil$ forces $\frac{1}{n} < \varepsilon$ for every $n \ge N$.
\end{example}

\begin{theorem}[Uniqueness of limits]
If $\lim a_n = L$ and $\lim a_n = M$, then $L = M$.
\end{theorem}

\subsection{Why the quantifiers matter}
The sequence $a_n = (-1)^n$ fails the definition for \emph{any} proposed limit: take $\varepsilon = 1/2$ and no $N$ can keep both $+1$ and $-1$ terms within $\varepsilon$ of a single point.
`;

const L2 = String.raw`
\section{Continuity in the $\varepsilon$--$\delta$ Language}
A function is continuous when \textbf{small changes in input force small changes in output} — and "$\text{small}$" must be quantified.

\begin{definition}[$\varepsilon$--$\delta$ continuity]
$f : \mathbb{R} \to \mathbb{R}$ is continuous at $c$ if for every $\varepsilon > 0$ there exists $\delta > 0$ such that
\[ |x - c| < \delta \implies |f(x) - f(c)| < \varepsilon. \]
\end{definition}

\begin{example}
For $f(x) = x^2$ at $c = 3$: if $|x - 3| < \delta \le 1$, then $|x + 3| < 7$, so
\[ |x^2 - 9| = |x - 3|\,|x + 3| < 7\delta. \]
Choose $\delta = \min\{1,\, \varepsilon/7\}$.
\end{example}

\begin{theorem}[Intermediate Value Theorem]
If $f$ is continuous on $[a,b]$ and $f(a) < 0 < f(b)$, then there exists $c \in (a,b)$ with $f(c) = 0$.
\end{theorem}

\begin{remark}
The IVT is why $\sqrt{2}$ \emph{must exist}: apply it to $f(x) = x^2 - 2$ on $[1,2]$. Completeness of $\mathbb{R}$ does the real work.
\end{remark}
`;

const L3 = String.raw`
\section{Differentiation and the Mean Value Theorem}
The derivative is a limit — so everything from Module 01 applies.

\begin{definition}
$f$ is differentiable at $c$ when the limit
\[ f'(c) = \lim_{h \to 0} \frac{f(c+h) - f(c)}{h} \]
exists. Differentiability always implies continuity; the converse fails at $f(x) = |x|$, $c = 0$.
\end{definition}

\begin{theorem}[Rolle's Theorem]
If $f$ is continuous on $[a,b]$, differentiable on $(a,b)$, and $f(a) = f(b)$, then some $c \in (a,b)$ satisfies $f'(c) = 0$.
\end{theorem}

\begin{theorem}[Mean Value Theorem]
Under the same hypotheses, there exists $c \in (a,b)$ with
\[ f'(c) = \frac{f(b) - f(a)}{b - a}. \]
\end{theorem}

\begin{corollary}
If $f' = 0$ on an interval, then $f$ is constant there. This innocent statement is the engine behind the Fundamental Theorem of Calculus.
\end{corollary}

\begin{example}
For any $x > 0$, apply the MVT to $\ln(1+x)$ on $[0,x]$: since $\frac{1}{1+x} \le \frac{1}{1+t} \le 1$ on the interval,
\[ \frac{x}{1+x} \le \ln(1+x) \le x. \]
\end{example}
`;

const L4 = String.raw`
\section{The Riemann Integral}
Area, made rigorous: slice, bound, refine.

\begin{definition}[Riemann integrability]
For a partition $P = \{x_0, \dots, x_n\}$ of $[a,b]$, let $U(f,P)$ and $L(f,P)$ be the upper and lower sums. Then $f$ is integrable when
\[ \inf_P U(f,P) = \sup_P L(f,P), \]
and the common value is $\int_a^b f$.
\end{definition}

\begin{theorem}[Fundamental Theorem of Calculus]
If $f$ is continuous on $[a,b]$ and $F(x) = \int_a^x f(t)\,dt$, then $F'(x) = f(x)$ for every $x \in (a,b)$.
\end{theorem}

\subsection{Computing Riemann sums numerically}
Midpoint sums converge surprisingly fast for smooth integrands:

\begin{lstlisting}[language=Python]
def riemann_midpoint(f, a, b, n=1000):
    # midpoint rule: exact for linear f, O(1/n^2) error otherwise
    h = (b - a) / n
    total = 0.0
    for i in range(n):
        x = a + (i + 0.5) * h
        total += f(x)
    return h * total

import math
print(riemann_midpoint(math.sin, 0, math.pi))  # ~2.0000004
\end{lstlisting}

\begin{remark}
Not every bounded function is Riemann integrable: the Dirichlet function $\mathbf{1}_{\mathbb{Q}}$ has $U = 1$ and $L = 0$ on \emph{every} subinterval. This failure motivates Module 08.
\end{remark}
`;

const L5 = String.raw`
\section{Sequences and Series of Functions}
Pointwise convergence is too weak for analysis; \textbf{uniform} convergence is the right notion.

\begin{definition}[Uniform convergence]
$f_n \to f$ uniformly on $S$ if
\[ \forall \varepsilon > 0\ \exists N\ \forall n \ge N\ \forall x \in S:\quad |f_n(x) - f(x)| < \varepsilon. \]
The crucial difference: one $N$ serves every $x$ simultaneously.
\end{definition}

\begin{theorem}[Weierstrass M-test]
If $|g_k(x)| \le M_k$ on $S$ and $\sum M_k < \infty$, then $\sum g_k$ converges uniformly (and absolutely) on $S$.
\end{theorem}

\begin{example}
The series $\sum_{k=1}^{\infty} \frac{\sin(kx)}{k^2}$ converges uniformly on $\mathbb{R}$ by the M-test with $M_k = 1/k^2$, since $\sum 1/k^2 = \pi^2/6$.
\end{example}

\begin{corollary}
Uniform limits of continuous functions are continuous. The classic counterexample $f_n(x) = x^n$ on $[0,1]$ converges pointwise to a discontinuous limit — and indeed the convergence is not uniform.
\end{corollary}
`;

const L6 = String.raw`
\section{Power Series and Taylor's Theorem}
When can a function be \emph{reconstructed} from its derivatives at one point?

\begin{theorem}[Taylor with Lagrange remainder]
If $f$ is $(n+1)$-times differentiable on an interval about $a$, then
\[ f(x) = \sum_{k=0}^{n} \frac{f^{(k)}(a)}{k!}(x-a)^k + R_n(x), \qquad R_n(x) = \frac{f^{(n+1)}(\xi)}{(n+1)!}(x-a)^{n+1} \]
for some $\xi$ between $a$ and $x$.
\end{theorem}

\begin{example}
For $e^x$ at $a = 0$, every derivative is $e^x \le e$ on $[0,1]$, so
\[ e = \sum_{k=0}^{n} \frac{1}{k!} + R_n, \qquad |R_n| \le \frac{e}{(n+1)!} \to 0. \]
Hence $e^x = \sum_{n=0}^{\infty} \frac{x^n}{n!}$ on all of $\mathbb{R}$.
\end{example}

\begin{definition}[Radius of convergence]
For $\sum c_n x^n$, the number $R = 1/\limsup_{n\to\infty} |c_n|^{1/n}$ (possibly $0$ or $\infty$) such that the series converges absolutely for $|x| < R$ and diverges for $|x| > R$.
\end{definition}

\begin{remark}
Inside its radius of convergence, a power series may be differentiated and integrated term by term — uniform convergence on compact subintervals justifies both.
\end{remark}
`;

const L7 = String.raw`
\section{Fourier Series}
Periodic functions as superpositions of pure tones.

\begin{definition}
For $f$ of period $2\pi$, the Fourier coefficients are
\[ c_n = \frac{1}{2\pi} \int_{-\pi}^{\pi} f(x)\, e^{-inx}\, dx, \qquad n \in \mathbb{Z}, \]
and the formal series is $\sum_{n \in \mathbb{Z}} c_n e^{inx}$.
\end{definition}

\begin{example}[Square wave]
For the odd square wave $f(x) = \mathrm{sgn}(\sin x)$, symmetry kills every cosine term and
\[ f(x) \sim \frac{4}{\pi} \sum_{k=0}^{\infty} \frac{\sin\big((2k+1)x\big)}{2k+1}. \]
\end{example}

\begin{theorem}[Parseval's identity]
For square-integrable $f$,
\[ \frac{1}{2\pi}\int_{-\pi}^{\pi} |f(x)|^2\, dx = \sum_{n \in \mathbb{Z}} |c_n|^2. \]
Energy in time equals energy in frequency.
\end{theorem}

\begin{remark}
Parseval applied to the square wave evaluates $\sum_{k=0}^{\infty} \frac{1}{(2k+1)^2} = \frac{\pi^2}{8}$ — a result that is painful to obtain any other way.
\end{remark}
`;

const L8 = String.raw`
\section{Measure and the Lebesgue Integral}
The Riemann integral slices the \emph{domain}; Lebesgue slices the \emph{range}.

\begin{definition}[Lebesgue measure, informally]
A set function $\mu$ on "reasonable" subsets of $\mathbb{R}$ with $\mu([a,b]) = b - a$, countable additivity
\[ \mu\!\left(\bigcup_{k=1}^{\infty} E_k\right) = \sum_{k=1}^{\infty} \mu(E_k) \quad \text{for disjoint } E_k, \]
and $\mu(\mathbb{Q}) = 0$.
\end{definition}

\begin{example}
The Dirichlet function $\mathbf{1}_{\mathbb{Q}}$ has Lebesgue integral $0$ on $[0,1]$ — the rationals simply carry no measure. Here Lebesgue succeeds where Riemann fails.
\end{example}

\begin{theorem}[Dominated Convergence]
If $f_n \to f$ pointwise and $|f_n| \le g$ with $\int g < \infty$, then
\[ \lim_{n \to \infty} \int f_n \, d\mu = \int f \, d\mu. \]
\end{theorem}

\begin{remark}
This single theorem is the workhorse of modern probability and PDE theory: it says exactly when limits may pass through integrals.
\end{remark}
`;

const LA1 = String.raw`
\section{Vector Spaces}
Strip away coordinates and keep only structure.

\begin{definition}[Vector space]
A set $V$ with operations $+ : V \times V \to V$ and $\cdot : \mathbb{F} \times V \to V$ satisfying the eight axioms: for all $u, v, w \in V$ and $a, b \in \mathbb{F}$,
\begin{itemize}
\item $u + (v + w) = (u + v) + w$ and $u + v = v + u$,
\item there exists $0 \in V$ with $v + 0 = v$, and every $v$ has $-v$,
\item $a(bv) = (ab)v$ and $1v = v$,
\item $a(u + v) = au + av$ and $(a + b)v = av + bv$.
\end{itemize}
\end{definition}

\begin{example}
Beyond $\mathbb{R}^n$: the space $\mathcal{P}$ of polynomials, $C[0,1]$ of continuous functions, and the solution set of $y'' + y = 0$ are all vector spaces. Linearity is everywhere.
\end{example}

\begin{theorem}
Every vector space with $n$ linearly independent vectors and no $n+1$ independent ones has dimension $n$; any $n$ independent vectors form a basis.
\end{theorem}
`;

const LA2 = String.raw`
\section{Linear Maps and Matrices}
Matrices are what linear maps look like once you choose coordinates.

\begin{definition}
$T : V \to W$ is linear when $T(au + bv) = aT(u) + bT(v)$ for all scalars $a, b$ and vectors $u, v$.
\end{definition}

\begin{theorem}[Rank–nullity]
For $T : V \to W$ with $\dim V = n$,
\[ \dim \ker T + \dim \mathrm{im}\, T = n. \]
\end{theorem}

\begin{example}
For $T : \mathcal{P}_2 \to \mathcal{P}_2$ given by $T(p) = p'$, the kernel is the constants (dimension $1$) and the image is $\mathcal{P}_1$ (dimension $2$): $1 + 2 = 3$.
\end{example}
`;

const LA3 = String.raw`
\section{Eigenvalues and Diagonalization}
Find the directions a map merely stretches.

\begin{definition}
$\lambda$ is an eigenvalue of $A \in \mathbb{R}^{n \times n}$ if some $v \ne 0$ satisfies $Av = \lambda v$; equivalently,
\[ \det(A - \lambda I) = 0. \]
\end{definition}

\begin{example}
For $A = \begin{pmatrix} 4 & 1 \\ 2 & 3 \end{pmatrix}$, the characteristic polynomial is $\lambda^2 - 7\lambda + 10 = (\lambda - 5)(\lambda - 2)$, so $\lambda_1 = 5$, $\lambda_2 = 2$ and $A$ is diagonalizable.
\end{example}

\begin{theorem}[Spectral theorem, real symmetric case]
If $A = A^{\mathsf{T}}$, then $\mathbb{R}^n$ has an orthonormal basis of eigenvectors of $A$, and all eigenvalues are real.
\end{theorem}
`;

const LA4 = String.raw`
\section{Inner Product Spaces}
Geometry returns: lengths, angles, orthogonality.

\begin{definition}
An inner product on $V$ is a map $\langle \cdot, \cdot \rangle : V \times V \to \mathbb{F}$ that is linear in the first argument, conjugate symmetric, and positive definite.
\end{definition}

\begin{theorem}[Cauchy–Schwarz]
For all $u, v \in V$,
\[ |\langle u, v \rangle| \le \|u\| \, \|v\|, \]
with equality exactly when $u, v$ are linearly dependent.
\end{theorem}

\begin{remark}
This module is still being typeset — check back after the next compile run.
\end{remark}
`;

/* ------------------------------------------------------------------ */
/*  Modules                                                            */
/* ------------------------------------------------------------------ */

interface ModSeed {
  id: string;
  courseId: string;
  order: number;
  title: string;
  description: string;
  estimatedMinutes: number;
  latex: string;
  draft?: boolean;
  compile?: boolean;
  quiz: Array<{ q: string; opts: string[]; correct: number; explain: string }>;
}

const quiz = (q: string, opts: string[], correct: number, explain: string) => ({ q, opts, correct, explain });

const moduleSeeds: ModSeed[] = [
  {
    id: "mod_c1", courseId: "crs_calc", order: 1, title: "Sequences & Limits",
    description: "The ε–N definition, uniqueness of limits, and the quantifier discipline that powers all of analysis.",
    estimatedMinutes: 55, latex: L1, compile: true,
    quiz: [
      quiz(String.raw`What does $\lim_{n\to\infty} \frac{n}{n+1}$ equal?`, ["$0$", "$1$", "$\\infty$", "Does not exist"], 1, String.raw`Rewrite $\frac{n}{n+1} = 1 - \frac{1}{n+1}$; the correction term vanishes.`),
      quiz("In the ε–N definition, who moves first?", ["You pick N, then ε is revealed", "ε is given first, then you find N", "Both are chosen simultaneously", "It depends on the sequence"], 1, "The definition is a game: for every ε > 0 the challenger chooses, you must produce a working N."),
      quiz(String.raw`Why does $a_n = (-1)^n$ diverge?`, ["It is unbounded", "Terms stay distance 2 apart, so no ε < 1 works", "It has no subsequence", "It is not monotone"], 1, "For ε = 1/2, consecutive terms 1 and −1 can never both lie within ε of a single limit."),
    ],
  },
  {
    id: "mod_c2", courseId: "crs_calc", order: 2, title: "Continuity & ε–δ",
    description: "δ as a function of ε, the Intermediate Value Theorem, and why completeness of ℝ is doing the work.",
    estimatedMinutes: 60, latex: L2, compile: true,
    quiz: [
      quiz(String.raw`In the ε–δ definition of continuity at $c$, δ may depend on…`, ["ε only", "ε and the point c", "x", "nothing"], 1, "δ generally depends on both ε and the base point c — uniform continuity is the upgrade where δ depends on ε alone."),
      quiz("The IVT requires which hypotheses on [a, b]?", ["Differentiability", "Continuity of f and a sign change", "Monotonicity", "Boundedness of f′"], 1, "Continuity on the closed interval plus f(a) < 0 < f(b) guarantees a root in (a, b)."),
      quiz(String.raw`Why does $\sqrt{2}$ exist?`, ["By definition of rationals", "IVT applied to $x^2 - 2$ plus completeness of ℝ", "Because 1.414² ≈ 2", "By the Archimedean property"], 1, "x² − 2 goes from −1 to 2 on [1, 2]; the IVT needs ℝ to have no gaps."),
    ],
  },
  {
    id: "mod_c3", courseId: "crs_calc", order: 3, title: "Differentiation & the MVT",
    description: "Rolle's theorem, the Mean Value Theorem, and the corollaries that quietly run calculus.",
    estimatedMinutes: 65, latex: L3, compile: true,
    quiz: [
      quiz("Which statement is true?", ["Continuous ⇒ differentiable", "Differentiable ⇒ continuous", "Neither implies the other", "They are equivalent"], 1, String.raw`$f(x) = |x|$ is continuous at 0 but not differentiable there; differentiability is strictly stronger.`),
      quiz("Rolle's theorem concludes…", [String.raw`$f'(c) = 0$ for some interior $c$`, "f has a maximum", "f is constant", "f′ exists everywhere"], 0, "With f(a) = f(b), the graph must turn around somewhere inside, giving a horizontal tangent."),
      quiz(String.raw`The MVT gives $f'(c) = $…`, [String.raw`$\frac{f(b)-f(a)}{b-a}$`, String.raw`$\frac{f(a)-f(b)}{a+b}$`, String.raw`$\int_a^b f$`, "0"], 0, "Some tangent is parallel to the secant — the average rate of change is achieved instantaneously somewhere."),
    ],
  },
  {
    id: "mod_c4", courseId: "crs_calc", order: 4, title: "The Riemann Integral",
    description: "Upper and lower sums, the Fundamental Theorem, and a Python midpoint-rule lab.",
    estimatedMinutes: 75, latex: L4, compile: true,
    quiz: [
      quiz("A bounded f is Riemann integrable when…", ["f is continuous", "inf U(f, P) = sup L(f, P) over partitions", "f is monotone", "f has finitely many jumps"], 1, "That equality is the definition; continuity or monotonicity are sufficient conditions, not the definition."),
      quiz("Why is the Dirichlet function not Riemann integrable on [0, 1]?", ["It is unbounded", "Every subinterval has sup 1 and inf 0, so U = 1, L = 0", "It is discontinuous at 0", "It is not periodic"], 1, "Rationals and irrationals are both dense, so every Riemann sum is trapped between 0 and 1."),
      quiz("The midpoint rule with n subintervals has error…", [String.raw`$O(1/n)$`, String.raw`$O(1/n^2)$`, String.raw`$O(1/\sqrt{n})$`, "Exact for all f"], 1, "Midpoint (like trapezoid) is second-order for smooth integrands — doubling n quarters the error."),
    ],
  },
  {
    id: "mod_c5", courseId: "crs_calc", order: 5, title: "Uniform Convergence",
    description: "Pointwise vs uniform, the Weierstrass M-test, and which properties survive limits.",
    estimatedMinutes: 60, latex: L5, compile: true,
    quiz: [
      quiz(String.raw`$f_n(x) = x^n$ on $[0,1]$ converges…`, ["uniformly to 0", "pointwise, not uniformly, to a discontinuous limit", "not at all", "uniformly to 1"], 1, "The pointwise limit is 0 on [0, 1) and 1 at x = 1 — discontinuous, so convergence cannot be uniform."),
      quiz("The M-test requires…", [String.raw`$|g_k| \le M_k$ with $\sum M_k < \infty$`, "Differentiability of each gₖ", "Monotone terms", "Compact domain only"], 0, "Comparison against a convergent numerical series forces uniform (and absolute) convergence."),
      quiz("Uniform limits of continuous functions are…", ["Continuous", "Differentiable", "Bounded only", "Constant"], 0, "Continuity passes through uniform limits; differentiability does not — that needs uniform convergence of derivatives."),
    ],
  },
  {
    id: "mod_c6", courseId: "crs_calc", order: 6, title: "Power Series & Taylor",
    description: "Taylor's theorem with remainder, radii of convergence, and term-by-term calculus.",
    estimatedMinutes: 70, latex: L6, compile: true,
    quiz: [
      quiz(String.raw`The radius of convergence of $\sum \frac{x^n}{n!}$ is…`, ["1", "e", String.raw`$\infty$`, "0"], 2, String.raw`Ratio test: $\frac{1/(n+1)!}{1/n!} = \frac{1}{n+1} \to 0$, so the series converges for every x.`),
      quiz("Inside its radius of convergence a power series may be…", ["Only evaluated", "Differentiated and integrated term by term", "Differentiated but not integrated", "Neither"], 1, "Uniform convergence on compact subintervals justifies both operations — and the radius stays the same."),
      quiz(String.raw`The Lagrange remainder $R_n(x)$ involves…`, [String.raw`$f^{(n+1)}(\xi)$ for some $\xi$ between a and x`, String.raw`$f^{(n)}(a)$ only`, "an integral of f", "the radius of convergence"], 0, "Taylor's theorem pins the error to one unknown intermediate point ξ, exactly like the MVT."),
    ],
  },
  {
    id: "mod_c7", courseId: "crs_calc", order: 7, title: "Fourier Series",
    description: "Fourier coefficients, the square wave, and Parseval's identity as an energy balance.",
    estimatedMinutes: 70, latex: L7, compile: true,
    quiz: [
      quiz(String.raw`For real, odd $f$, the Fourier series contains…`, ["cosines only", "sines only", "both", "neither"], 1, "Odd × even (cosine) integrates to zero over a symmetric interval, killing every cosine coefficient."),
      quiz("Parseval's identity equates…", ["∫|f|² with Σ|cₙ|²", "∫f with Σcₙ", "f(0) with Σcₙ", "‖f‖₁ with ‖c‖₁"], 0, "L² energy in the time domain equals ℓ² energy in the frequency domain — the Fourier transform is an isometry."),
      quiz(String.raw`$\sum_{k=0}^{\infty} \frac{1}{(2k+1)^2}$ evaluates to…`, [String.raw`$\frac{\pi^2}{6}$`, String.raw`$\frac{\pi^2}{8}$`, String.raw`$\frac{\pi^2}{12}$`, String.raw`$\frac{\pi^2}{4}$`], 1, "Apply Parseval to the square wave: its coefficients are 4/(π(2k+1)), and the identity does the rest."),
    ],
  },
  {
    id: "mod_c8", courseId: "crs_calc", order: 8, title: "Toward Lebesgue",
    description: "Why Riemann is not enough: measure zero, the Dirichlet function, and dominated convergence.",
    estimatedMinutes: 50, latex: L8, compile: true,
    quiz: [
      quiz(String.raw`The Lebesgue integral of $\mathbf{1}_{\mathbb{Q}}$ on $[0,1]$ is…`, ["1", "0", "undefined", "1/2"], 1, "ℚ ∩ [0, 1] is countable, hence has measure zero — the function is 0 almost everywhere."),
      quiz("Dominated convergence requires…", ["Uniform convergence", "Pointwise convergence plus an integrable dominating g", "Monotone convergence", "Continuity of the limit"], 1, String.raw`$|f_n| \le g$ with $\int g < \infty$ is the hypothesis that lets limits pass through the integral.`),
      quiz("Lebesgue integration slices the…", ["Domain into intervals", "Range into level sets", "Boundary", "Graph into squares"], 1, "Measuring where f lands near each height — instead of where x lives — is what tames pathological functions."),
    ],
  },
  {
    id: "mod_la1", courseId: "crs_linalg", order: 1, title: "Vector Spaces",
    description: "The eight axioms, examples beyond ℝⁿ, and why dimension is well-defined.",
    estimatedMinutes: 50, latex: LA1, compile: true,
    quiz: [
      quiz("Which is NOT a vector space axiom?", ["Commutativity of +", "Existence of an inner product", "Distributivity of scalar multiplication", "Existence of additive inverses"], 1, "Inner products are extra geometric structure — a vector space needs only the eight linear axioms."),
      quiz(String.raw`$\mathcal{P}_2$, polynomials of degree ≤ 2, has dimension…`, ["2", "3", "∞", "1"], 1, String.raw`$\{1, x, x^2\}$ is a basis — three vectors.`),
      quiz("Any two bases of a finite-dimensional space…", ["Have different lengths", "Have the same number of elements", "Are orthogonal", "Span different sets"], 1, "That invariance is exactly what makes dimension well-defined."),
    ],
  },
  {
    id: "mod_la2", courseId: "crs_linalg", order: 2, title: "Linear Maps & Rank–Nullity",
    description: "Kernels, images, and the dimension count that organizes every linear system.",
    estimatedMinutes: 55, latex: LA2, compile: true,
    quiz: [
      quiz("Rank–nullity says…", [String.raw`$\dim\ker T + \dim\,\mathrm{im}\,T = \dim V$`, "rank = nullity", String.raw`$\det T = 0$`, "T is invertible"], 0, "Dimensions of kernel and image partition the dimension of the domain."),
      quiz(String.raw`The kernel of $T(p) = p'$ on $\mathcal{P}_2$ is…`, ["All of P₂", "The constant polynomials", "{0}", "The linear polynomials"], 1, "Exactly the polynomials with zero derivative — the constants, a 1-dimensional kernel."),
      quiz("A linear map is injective iff…", ["It is surjective", "Its kernel is {0}", "It has an eigenvalue", "Its matrix is square"], 1, "T(u) = T(v) implies T(u − v) = 0, so injectivity is precisely trivial kernel."),
    ],
  },
  {
    id: "mod_la3", courseId: "crs_linalg", order: 3, title: "Eigenvalues & Spectral Theory",
    description: "Characteristic polynomials, diagonalization, and the real symmetric spectral theorem.",
    estimatedMinutes: 65, latex: LA3, compile: true,
    quiz: [
      quiz(String.raw`λ is an eigenvalue of A exactly when…`, [String.raw`$\det(A - \lambda I) = 0$`, String.raw`$\det A = \lambda$`, String.raw`$A - \lambda I$ is invertible`, String.raw`$\mathrm{tr}\,A = \lambda$`], 0, String.raw`$Av = \lambda v$ has a nonzero solution iff $A - \lambda I$ is singular.`),
      quiz("The spectral theorem applies to…", ["All square matrices", "Real symmetric matrices", "Invertible matrices", "Upper-triangular matrices"], 1, "Symmetry guarantees real eigenvalues and an orthonormal eigenbasis."),
      quiz(String.raw`For $A = \begin{pmatrix} 4 & 1 \\ 2 & 3 \end{pmatrix}$, the eigenvalues are…`, ["5 and 2", "4 and 3", "7 and −2", "1 and 6"], 0, String.raw`$\lambda^2 - 7\lambda + 10$ factors as $(\lambda - 5)(\lambda - 2)$.`),
    ],
  },
  {
    id: "mod_la4", courseId: "crs_linalg", order: 4, title: "Inner Product Spaces",
    description: "Cauchy–Schwarz, orthogonality, and Gram–Schmidt. Currently being typeset.",
    estimatedMinutes: 60, latex: LA4, draft: true, compile: false,
    quiz: [
      quiz("Cauchy–Schwarz bounds…", ["|⟨u, v⟩| by ‖u‖‖v‖", "‖u + v‖ by ‖u‖ + ‖v‖", "‖u‖ by ⟨u, u⟩", "nothing"], 0, "It is the statement that makes angles between abstract vectors well-defined."),
      quiz("Equality in Cauchy–Schwarz holds iff…", ["u = v", "u and v are linearly dependent", "u ⊥ v", "‖u‖ = ‖v‖"], 1, "One vector being a scalar multiple of the other is the equality case."),
      quiz("Gram–Schmidt produces…", ["Eigenvalues", "An orthonormal basis of the same span", "A diagonal matrix", "The determinant"], 1, "It orthogonalizes any basis step by step without changing the space spanned."),
    ],
  },
];

function buildModule(s: ModSeed): CourseModule {
  const compiled = s.compile ? latexToHtml(s.latex) : null;
  return {
    _id: s.id,
    courseId: s.courseId,
    order: s.order,
    title: s.title,
    description: s.description,
    contentType: "lesson",
    content: compiled
      ? {
          latexSource: s.latex.trim(),
          compiledHtml: compiled.html,
          compiledAt: iso(-3),
          status: "compiled",
          warnings: compiled.warnings,
        }
      : { latexSource: s.latex.trim(), compiledHtml: "", compiledAt: null, status: "uncompiled", warnings: [] },
    isDraft: !!s.draft,
    estimatedMinutes: s.estimatedMinutes,
    quiz: s.quiz,
  };
}

const modules: CourseModule[] = moduleSeeds.map(buildModule);

/* ------------------------------------------------------------------ */
/*  Students, payments, live classes                                   */
/* ------------------------------------------------------------------ */

const students: StudentRec[] = [
  { _id: "stu_priya", name: "Priya Sharma", email: "priya@example.com", courseId: "crs_calc", enrollmentDate: iso(0, 7), status: "trial", trialStart: iso(0, 7), trialEnd: new Date(now + 43 * 3600000).toISOString(), paymentStatus: "pending", progress: { completed: ["mod_c1"], quizScores: { mod_c1: 100 } }, moduleVisibility: {}, lastActive: iso(0, 9) },
  { _id: "stu_amara", name: "Amara Okafor", email: "amara@example.com", courseId: "crs_calc", enrollmentDate: iso(-1, 6), status: "trial", trialStart: new Date(now - 30 * 3600000).toISOString(), trialEnd: new Date(now + 18 * 3600000).toISOString(), paymentStatus: "pending", progress: { completed: ["mod_c1", "mod_c2"], quizScores: { mod_c1: 100, mod_c2: 67 } }, moduleVisibility: {}, lastActive: iso(0, 8) },
  { _id: "stu_arjun", name: "Arjun Mehta", email: "arjun@example.com", courseId: "crs_calc", enrollmentDate: iso(-55), status: "active", trialStart: iso(-55), trialEnd: iso(-53), paymentStatus: "completed", progress: { completed: ["mod_c1", "mod_c2", "mod_c3", "mod_c4", "mod_c5", "mod_c6"], quizScores: { mod_c1: 100, mod_c2: 100, mod_c3: 67, mod_c4: 100, mod_c5: 67, mod_c6: 100 } }, moduleVisibility: {}, lastActive: iso(-1) },
  { _id: "stu_sofia", name: "Sofia Reyes", email: "sofia@example.com", courseId: "crs_calc", enrollmentDate: iso(-38), status: "active", trialStart: iso(-38), trialEnd: iso(-36), paymentStatus: "completed", progress: { completed: ["mod_c1", "mod_c2", "mod_c3"], quizScores: { mod_c1: 67, mod_c2: 100, mod_c3: 100 } }, moduleVisibility: { mod_c7: false }, lastActive: iso(0, 6) },
  { _id: "stu_chen", name: "Chen Wei", email: "chen@example.com", courseId: "crs_calc", enrollmentDate: iso(-9), status: "expired", trialStart: iso(-9), trialEnd: iso(-7), paymentStatus: "pending", progress: { completed: ["mod_c1", "mod_c2"], quizScores: { mod_c1: 100, mod_c2: 67 } }, moduleVisibility: {}, lastActive: iso(-6) },
  { _id: "stu_dmitri", name: "Dmitri Volkov", email: "dmitri@example.com", courseId: "crs_calc", enrollmentDate: iso(-20), status: "blocked", trialStart: iso(-20), trialEnd: iso(-18), paymentStatus: "failed", progress: { completed: ["mod_c1"], quizScores: { mod_c1: 33 } }, moduleVisibility: {}, lastActive: iso(-12) },
  { _id: "stu_ravi", name: "Ravi Patel", email: "ravi@example.com", courseId: "crs_calc", enrollmentDate: iso(-130), status: "active", trialStart: iso(-130), trialEnd: iso(-128), paymentStatus: "completed", progress: { completed: ["mod_c1", "mod_c2", "mod_c3", "mod_c4", "mod_c5", "mod_c6", "mod_c7", "mod_c8"], quizScores: { mod_c1: 100, mod_c2: 100, mod_c3: 100, mod_c4: 67, mod_c5: 100, mod_c6: 100, mod_c7: 67, mod_c8: 100 } }, moduleVisibility: {}, lastActive: iso(-4) },
  { _id: "stu_meera", name: "Meera Iyer", email: "meera@example.com", courseId: "crs_calc", enrollmentDate: iso(-92), status: "active", trialStart: iso(-92), trialEnd: iso(-90), paymentStatus: "completed", progress: { completed: ["mod_c1", "mod_c2", "mod_c3", "mod_c4", "mod_c5"], quizScores: { mod_c1: 100, mod_c2: 67, mod_c3: 100, mod_c4: 100, mod_c5: 100 } }, moduleVisibility: {}, lastActive: iso(-2) },
  { _id: "stu_lena", name: "Lena Fischer", email: "lena@example.com", courseId: "crs_linalg", enrollmentDate: iso(-21), status: "active", trialStart: iso(-21), trialEnd: iso(-19), paymentStatus: "completed", progress: { completed: ["mod_la1", "mod_la2"], quizScores: { mod_la1: 100, mod_la2: 100 } }, moduleVisibility: {}, lastActive: iso(-1) },
  { _id: "stu_tomas", name: "Tomás Silva", email: "tomas@example.com", courseId: "crs_linalg", enrollmentDate: iso(-6), status: "expired", trialStart: iso(-6), trialEnd: iso(-4), paymentStatus: "pending", progress: { completed: ["mod_la1"], quizScores: { mod_la1: 67 } }, moduleVisibility: {}, lastActive: iso(-5) },
];

const payments: Payment[] = [
  { _id: "pay_1", studentId: "stu_ravi", courseId: "crs_calc", amount: 4999, currency: "INR", gateway: "razorpay", orderId: "order_MzK2a8Rt", paymentId: "pay_MzK2bQ91", status: "completed", method: "card", createdAt: iso(-128) },
  { _id: "pay_2", studentId: "stu_meera", courseId: "crs_calc", amount: 2999, currency: "INR", gateway: "razorpay", orderId: "order_NaX4c2Lp", paymentId: "pay_NaX4d7Ws", status: "completed", method: "upi", createdAt: iso(-90) },
  { _id: "pay_3", studentId: "stu_arjun", courseId: "crs_calc", amount: 2999, currency: "INR", gateway: "razorpay", orderId: "order_ObQ9e5Tv", paymentId: "pay_ObQ9f1Jm", status: "completed", method: "upi", createdAt: iso(-53) },
  { _id: "pay_4", studentId: "stu_sofia", courseId: "crs_calc", amount: 2999, currency: "INR", gateway: "razorpay", orderId: "order_PcW7g3Rd", paymentId: "pay_PcW7h8Kb", status: "completed", method: "card", createdAt: iso(-36) },
  { _id: "pay_5", studentId: "stu_lena", courseId: "crs_linalg", amount: 1999, currency: "INR", gateway: "razorpay", orderId: "order_QdY1j6Nc", paymentId: "pay_QdY1k2Xf", status: "completed", method: "card", createdAt: iso(-19) },
  { _id: "pay_6", studentId: "stu_dmitri", courseId: "crs_calc", amount: 2999, currency: "INR", gateway: "razorpay", orderId: "order_ReZ8m4Hv", paymentId: "", status: "failed", method: "card", createdAt: iso(-17) },
];

const liveClasses: LiveClass[] = [
  { _id: "lc_1", courseId: "crs_calc", title: "Office Hours: the ε–δ Clinic", description: "Bring your stuck proofs. We untangle quantifier order together, live.", date: dateOnly(0), time: "19:00", durationMin: 90, provider: "jitsi", meetingLink: "https://meet.jit.si/EduLaunch-EpsilonDeltaClinic", meetingId: "EduLaunch-EpsilonDeltaClinic", status: "ongoing" },
  { _id: "lc_2", courseId: "crs_calc", title: "Fourier Series, Derived Live", description: "From sines and cosines to Parseval — the full derivation on one blackboard.", date: dateOnly(2), time: "18:30", durationMin: 75, provider: "gmeet", meetingLink: "https://meet.google.com/xfk-zqwt-mde", meetingId: "xfk-zqwt-mde", status: "scheduled" },
  { _id: "lc_3", courseId: "crs_calc", title: "Problem Set 3 Walkthrough", description: "MVT and integral inequalities, solved step by step with the cohort.", date: dateOnly(6), time: "20:00", durationMin: 60, provider: "jitsi", meetingLink: "https://meet.jit.si/EduLaunch-ProblemSet3", meetingId: "EduLaunch-ProblemSet3", status: "scheduled" },
  { _id: "lc_4", courseId: "crs_calc", title: "Riemann Sums in Practice", description: "Numerical integration lab: midpoint vs trapezoid error, live-coded.", date: dateOnly(-3), time: "19:30", durationMin: 90, provider: "jitsi", meetingLink: "https://meet.jit.si/EduLaunch-RiemannLab", meetingId: "EduLaunch-RiemannLab", status: "completed", recordingUrl: "https://drive.google.com/file/d/riemann-lab-rec" },
  { _id: "lc_5", courseId: "crs_linalg", title: "Metric Spaces Teaser (Optional)", description: "A taste of where analysis goes next.", date: dateOnly(1), time: "21:00", durationMin: 45, provider: "gmeet", meetingLink: "https://meet.google.com/qbr-vnkh-pzx", meetingId: "qbr-vnkh-pzx", status: "cancelled" },
];

export const TESTIMONIALS = [
  {
    name: "Ishita Nair",
    role: "ISI Kolkata, M.Stat aspirant",
    text: "I had read ε–δ four times in standard textbooks. The compiled lessons here argued it in the right order — challenger picks ε, you answer with N — and it finally clicked in one sitting.",
    rating: 5,
  },
  {
    name: "Marcus Bell",
    role: "Self-taught → ML engineer",
    text: "Every ML course says 'you need analysis' and waves at a 700-page PDF. This is the first place the math actually rendered properly on my phone, with quizzes that check real understanding.",
    rating: 5,
  },
  {
    name: "Fatima Zahra",
    role: "B.Sc. Mathematics, 2nd year",
    text: "The 2-day trial convinced me before I paid a rupee. I finished Module 04's Riemann lab, saw the midpoint rule converge on screen, and enrolled the same evening.",
    rating: 5,
  },
];

export const FAQS = [
  {
    q: "What exactly is the 2-day free trial?",
    a: "Full access to every published module — lessons, quizzes, and labs — for 48 hours after registration. No card required. When the clock runs out, content locks until you pay the one-time fee.",
  },
  {
    q: "What do I get after paying?",
    a: "Permanent access to the course as it exists, every future re-typeset of the lessons, all scheduled live classes, and their recordings. The fee is one-time — there is no subscription.",
  },
  {
    q: "Why is LaTeX a feature and not a footnote?",
    a: "Because mathematics is its notation. Lessons are authored in LaTeX, compiled on our servers, and rendered with publication-grade typesetting (KaTeX) on every device — not screenshots, not approximations.",
  },
  {
    q: "How do live classes work?",
    a: "Sessions are scheduled inside the platform and meeting rooms (Jitsi or Google Meet) are generated automatically. You join from your dashboard; recordings appear on the schedule after class.",
  },
  {
    q: "Can the instructor restrict my access to specific modules?",
    a: "Yes — access control is per student and per module. If a module is restricted for you, it shows a lock with a note from the instructor; everything else remains untouched.",
  },
];

export function seedDB(): DB {
  return {
    courses,
    modules,
    students,
    liveClasses,
    payments,
    trainers,
  };
}
