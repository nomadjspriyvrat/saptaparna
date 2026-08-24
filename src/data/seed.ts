import type { DB, LiveClass, ModuleDoc, ProgressRow, QuizQ, StudentRec, Subject } from "../types";

let seq = 0;
const uid = (p: string) => `${p}${(++seq).toString(36).padStart(3, "0")}${Math.random().toString(36).slice(2, 7)}`;

const dPlus = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

/* ------------------------------------------------------------------ */
/* Subjects                                                            */
/* ------------------------------------------------------------------ */

const SUBJECTS: Array<{ name: string; slug: string }> = [
  { name: "Full-Stack Web Development (MERN)", slug: "mern" },
  { name: "Data Science with Python", slug: "data-science" },
  { name: "Machine Learning", slug: "machine-learning" },
  { name: "Java Programming", slug: "java" },
  { name: "Agentic AI", slug: "agentic-ai" },
  { name: "Generative AI", slug: "generative-ai" },
  { name: "Python Programming", slug: "python" },
  { name: "C & C++", slug: "c-cpp" },
  { name: "Data Structures & Algorithms (DSA)", slug: "dsa" },
];

/* ------------------------------------------------------------------ */
/* MERN curriculum — full content                                      */
/* ------------------------------------------------------------------ */

const mernModules = (subjectId: string): ModuleDoc[] => [
  {
    _id: "mod_mern_1",
    subject: subjectId,
    order: 1,
    title: "HTML & CSS Foundations",
    desc: "Structure and style the web: semantic markup, the box model, Flexbox and Grid.",
    lesson: `
<p>Every app you will ever ship renders through two languages: <strong>HTML decides what things are</strong>, CSS decides <strong>how they look and where they live</strong>. This module builds the mental model you will reuse for the rest of the track.</p>

<h3>1 · Semantic HTML is a contract</h3>
<p>Screen readers, search engines and future-you all read your markup. Use elements that describe meaning, not appearance:</p>
<pre><code>&lt;header&gt;
  &lt;nav&gt; ... primary links ... &lt;/nav&gt;
&lt;/header&gt;

&lt;main&gt;
  &lt;article&gt; ... the actual content ... &lt;/article&gt;
  &lt;aside&gt; ... supporting content ... &lt;/aside&gt;
&lt;/main&gt;

&lt;footer&gt; ... &lt;/footer&gt;</code></pre>
<ul>
  <li><strong>&lt;div&gt; and &lt;span&gt;</strong> carry zero meaning — reach for them last, not first.</li>
  <li>One <code>&lt;main&gt;</code> per page. Headings in order, no skipping levels.</li>
  <li>Forms get <code>&lt;label for="..."&gt;</code> — always.</li>
</ul>

<h3>2 · Selectors &amp; specificity</h3>
<p>When two rules fight, the browser computes a score: <strong>inline &gt; #id &gt; .class &gt; element</strong>.</p>
<pre><code>nav a            /* 0-0-2  */
.nav .link       /* 0-2-0  */
#nav a           /* 1-0-1  ← wins */</code></pre>
<p>Write selectors as flat as you can. If you need <code>!important</code>, treat it as a smoke alarm: it means something is burning elsewhere.</p>

<h3>3 · The box model, settled once</h3>
<p>Every element is a box of <strong>content + padding + border + margin</strong>. Put this at the top of every stylesheet and layout math becomes sane:</p>
<pre><code>*, *::before, *::after {
  box-sizing: border-box; /* width now includes padding + border */
}</code></pre>

<h3>4 · Flexbox &amp; Grid in one breath</h3>
<ul>
  <li><strong>Flexbox</strong> = one dimension. Toolbars, nav rows, card innards.</li>
  <li><strong>Grid</strong> = two dimensions. Page scaffolding, card galleries.</li>
</ul>
<pre><code>.toolbar { display: flex; gap: 12px; align-items: center; }

.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}</code></pre>

<h3>5 · Responsive by default</h3>
<p>Design mobile-first, then add complexity upwards with <code>min-width</code> queries. If a layout needs more than two breakpoints, the layout is the bug.</p>
<pre><code>@media (min-width: 720px) {
  .layout { grid-template-columns: 2fr 1fr; }
}</code></pre>`,
    quiz: [
      {
        q: "Which element is the most semantic choice for a page's primary navigation links?",
        opts: ["<div class=\"nav\">", "<nav>", "<section>", "<menu-links>"],
        correct: 1,
        explain: "<nav> tells browsers, screen readers and crawlers 'this is a navigation block', unlocking keyboard landmarks and SEO meaning that a styled <div> never gets.",
      },
      {
        q: "With box-sizing: border-box, an element's declared width includes…",
        opts: ["content only", "content + padding", "content + padding + border", "content + padding + border + margin"],
        correct: 2,
        explain: "border-box folds padding and border into the declared width, so a 300px card stays 300px no matter the padding. Margin is always outside the box.",
      },
      {
        q: "Which layout system is one-dimensional — it works along a row OR a column?",
        opts: ["CSS Grid", "Flexbox", "Floats", "Tables"],
        correct: 1,
        explain: "Flexbox distributes space along a single axis. Grid handles rows and columns simultaneously, which is why Grid suits page scaffolding.",
      },
      {
        q: "Which selector has the HIGHEST specificity?",
        opts: ["nav a", ".nav .link", "#nav a", "nav > a"],
        correct: 2,
        explain: "An #id (1-0-1) outranks any number of classes (0-2-0) or element selectors. Specificity compares inline, then ids, then classes, then elements.",
      },
    ],
    task:
      "Rebuild the layout we sketched in the live class: a sticky header with nav, a two-column main area (article + aside), and a footer. Rules: semantic tags for structure (no div-soup), one media query that stacks the columns below 720px, and border-box set globally. Paste your full HTML + CSS below, or a link to a live page.",
    project: {
      title: "Project 01 — Personal Profile Page",
      description:
        "Ship a polished single page about you: header with name + role, an About section, skills rendered as styled chips, a projects section with three cards laid out by CSS Grid, and a footer with links. Constraints: valid semantic HTML, zero frameworks, one breakpoint, readable contrast. Submit your code, or a hosted URL plus a 3-line note on the hardest layout decision you made.",
    },
  },
  {
    _id: "mod_mern_2",
    subject: subjectId,
    order: 2,
    title: "JavaScript, From Zero to DOM",
    desc: "The language under everything: scope, closures, arrays, and driving the page with events.",
    lesson: `
<p>HTML is the skeleton, CSS the skin — <strong>JavaScript is the nervous system</strong>. You do not need to know all of it; you need the 20% that shows up every single day.</p>

<h3>1 · let, const and scope</h3>
<p>Use <code>const</code> by default and <code>let</code> when reassignment is genuine. Both are <strong>block-scoped</strong>, unlike the old <code>var</code>:</p>
<pre><code>const cohort = "Cohort 6";
let score = 0;
score = score + 10;   // reassignment fine
// cohort = "X";      // TypeError — binding is fixed</code></pre>

<h3>2 · Functions &amp; closures</h3>
<p>A closure is a function that <strong>remembers the variables from where it was born</strong>, even after that outer function has returned:</p>
<pre><code>function counter() {
  let n = 0;
  return function () {
    n = n + 1;
    return n;
  };
}
const tick = counter();
tick(); // 1
tick(); // 2  — n survived inside the closure</code></pre>
<p>Closures power callbacks, event handlers, and every React hook you will meet later.</p>

<h3>3 · Arrays: the big three</h3>
<ul>
  <li><code>map</code> — transform every item into a <strong>new array</strong>.</li>
  <li><code>filter</code> — keep items that pass a test, <strong>new array</strong>.</li>
  <li><code>reduce</code> — fold the array into <strong>one value</strong>.</li>
</ul>
<pre><code>const prices = [120, 40, 300];
const withVat  = prices.map(p => p * 1.075);
const big      = prices.filter(p => p > 100);
const total    = prices.reduce((sum, p) => sum + p, 0);</code></pre>
<p>All three leave the original array untouched. <code>push</code>, <code>sort</code> and <code>splice</code> mutate — know the difference.</p>

<h3>4 · The DOM &amp; event delegation</h3>
<pre><code>const list = document.querySelector("#list");

list.addEventListener("click", (e) => {
  const item = e.target.closest("li");
  if (!item) return;
  item.classList.toggle("done");
});</code></pre>
<p>One listener on the parent handles every child — even ones added later. That is <strong>event delegation</strong>, and it works because events <strong>bubble</strong> up the tree.</p>`,
    quiz: [
      {
        q: "function outer() { let n = 10; return function () { return n + 5; }; } — what does outer()() log?",
        opts: ["undefined", "10", "15", "ReferenceError"],
        correct: 2,
        explain: "The inner function closes over n. When it is finally called, n is still alive inside the closure, so 10 + 5 = 15.",
      },
      {
        q: "Which array method returns a NEW array without mutating the original?",
        opts: ["push()", "map()", "sort()", "splice()"],
        correct: 1,
        explain: "map builds and returns a fresh array. push, sort and splice all modify the array they are called on.",
      },
      {
        q: "What is true about const?",
        opts: [
          "It creates a block-scoped binding that cannot be reassigned",
          "It is function-scoped like var",
          "It makes objects deeply immutable",
          "There is no difference vs let",
        ],
        correct: 0,
        explain: "const fixes the binding, not the value: a const object can still have its properties changed. It is block-scoped, like let.",
      },
      {
        q: "Event delegation works because…",
        opts: [
          "events bubble up the DOM tree",
          "listeners are cached by the engine",
          "the DOM is a linked list",
          "browsers batch timers",
        ],
        correct: 0,
        explain: "A click on a child bubbles through every ancestor, so one ancestor listener can handle all descendants — including future ones.",
      },
    ],
    task:
      "Write two functions: rangeSum(start, end) that returns the sum of all integers between start and end inclusive, and debounce(fn, ms) that delays invoking fn until ms milliseconds of silence. Paste your code plus one example call and its output for each.",
    project: {
      title: "Project 02 — Kanban-lite Task Board (vanilla JS)",
      description:
        "Build a board with three columns (Todo / Doing / Done). Users add tasks from an input, move them between columns with buttons (no drag library), delete them, and everything persists in localStorage across reloads. Vanilla JS only — no frameworks. Submit a link or the full JS file, and note which array method did the most work for you.",
    },
  },
  {
    _id: "mod_mern_3",
    subject: subjectId,
    order: 3,
    title: "REST APIs with Node & Express",
    desc: "Servers, routes, middleware and status codes — the API layer every MERN app hangs on.",
    lesson: `
<p>The <strong>N</strong> and the <strong>E</strong> of MERN. Node runs JavaScript outside the browser; Express gives it a minimal routing layer. Together they turn a laptop into an API server in about twenty lines.</p>

<h3>1 · The smallest real server</h3>
<pre><code>const express = require("express");
const app = express();

app.use(express.json()); // middleware: parse JSON bodies

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.listen(process.env.PORT || 5000);</code></pre>

<h3>2 · Routes, params, query</h3>
<pre><code>GET /api/students/42?full=true

// inside the handler:
req.params.id    // "42"    — path segment, identifies ONE resource
req.query.full   // "true"  — filters and options</code></pre>
<ul>
  <li><code>:id</code> segments → <strong>which</strong> resource.</li>
  <li>Query strings → <strong>how</strong> to shape the response.</li>
</ul>

<h3>3 · Middleware runs top-to-bottom</h3>
<p>Every <code>app.use(fn)</code> joins a pipeline. Order matters — <code>express.json()</code> must run <strong>before</strong> any route that reads <code>req.body</code>.</p>
<pre><code>// tiny logger middleware
app.use((req, res, next) => {
  console.log(req.method, req.path);
  next(); // hand control to the next in line
});</code></pre>

<h3>4 · Status codes you will actually use</h3>
<ul>
  <li><code>200</code> OK · <code>201</code> Created · <code>204</code> No Content (delete)</li>
  <li><code>400</code> Bad Request (validation) · <code>404</code> Not Found</li>
  <li><code>500</code> Server Error — the bug is yours, not the client's</li>
</ul>
<p>A good API answers every request with a truthful code and a JSON body. That contract is what lets a React front end trust it blindly.</p>`,
    quiz: [
      {
        q: "Which middleware parses incoming JSON request bodies?",
        opts: ["express.urlencoded()", "express.json()", "cors()", "app.static()"],
        correct: 1,
        explain: "express.json() reads the raw body and populates req.body with parsed JSON. Register it before routes that need req.body.",
      },
      {
        q: "In the route /api/students/:id, req.params.id holds…",
        opts: ["the query string", "the URL path segment after /students/", "a field from the body", "a request header"],
        correct: 1,
        explain: "Named :segments in the path land in req.params. The query string lives in req.query, body in req.body.",
      },
      {
        q: "The most correct status for 'resource created successfully' is…",
        opts: ["200", "201", "204", "301"],
        correct: 1,
        explain: "201 Created signals a new resource came into existence, usually with the created document in the body. 204 is for operations with nothing to return.",
      },
      {
        q: "Express middleware runs…",
        opts: [
          "in registration order, top to bottom",
          "alphabetically by name",
          "in random order per request",
          "only on error",
        ],
        correct: 0,
        explain: "The pipeline executes in the order you registered it, which is why body parsers and loggers must be app.use'd before your routes.",
      },
    ],
    task:
      "Spin up an Express server exposing GET /api/quotes (list), GET /api/quotes/:id and POST /api/quotes against an in-memory array. Paste your server.js and the three curl commands (or fetch snippets) you used to test it, plus one 404 response you triggered on purpose.",
    project: {
      title: "Project 03 — Notes API",
      description:
        "Full CRUD on /api/notes backed by an in-memory array: list, read one, create (title required → else 400), update, delete (204). Every response is JSON; unknown ids return 404 with a message. Submit server.js plus a table of the endpoints you implemented with one sample request/response pair each.",
    },
  },
  {
    _id: "mod_mern_4",
    subject: subjectId,
    order: 4,
    title: "MongoDB & Mongoose",
    desc: "Documents, ObjectIds, schemas and queries — persistence that scales with your API.",
    lesson: `
<p>The <strong>M</strong> in MERN. MongoDB stores <strong>JSON-like documents</strong> in collections — no tables, no fixed columns. Mongoose layers schemas, validation and relations on top.</p>

<h3>1 · Documents, not rows</h3>
<pre><code>{
  "_id": "65f2b1c9d8e7a6b5c4d3e2f1",
  "name": "Aisha",
  "subject": "65f2a0...",   // reference to another document
  "scores": [88, 91, 76]     // arrays live INSIDE the document
}</code></pre>
<ul>
  <li><strong>_id</strong> is an ObjectId: it embeds a <strong>timestamp</strong> plus randomness — sortable by creation time.</li>
  <li>Embed what you read together; reference what grows without bound.</li>
</ul>

<h3>2 · Schemas are enforced by your app</h3>
<p>MongoDB itself is schemaless — <strong>Mongoose</strong> is what gives you shape and validation:</p>
<pre><code>const StudentSchema = new Schema({
  name:    { type: String, required: true, trim: true },
  subject: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
});
const Student = model("Student", StudentSchema);</code></pre>

<h3>3 · Queries read like JSON</h3>
<pre><code>await Student.find({ score: { $gte: 80 } });
await Student.findOne({ name: "Aisha" });
await Student.findByIdAndUpdate(id, { score: 92 }, { new: true });</code></pre>

<h3>4 · Relations with populate()</h3>
<pre><code>const s = await Student.findById(id).populate("subject");
// s.subject is now the FULL Subject document,
// not just the ObjectId</code></pre>
<p>Add a <strong>compound unique index</strong> when a pair must be unique — like <code>(name, subject)</code> in this very app — so duplicates fail at the database level, not in your code.</p>`,
    quiz: [
      {
        q: "A Mongoose Schema is best described as…",
        opts: [
          "a law enforced inside the database engine",
          "a shape + validation layer enforced by your app's model layer",
          "an index definition",
          "a transaction boundary",
        ],
        correct: 1,
        explain: "MongoDB itself will happily store any document. Mongoose validates against the schema in your application before anything touches the database.",
      },
      {
        q: "An ObjectId embeds…",
        opts: [
          "a timestamp plus randomness",
          "a UUID v4",
          "an auto-increment integer",
          "a hash of the document contents",
        ],
        correct: 0,
        explain: "The first bytes of an ObjectId are a creation timestamp, which is why sorting by _id sorts by insertion time.",
      },
      {
        q: "Which query finds all students with score >= 80?",
        opts: [
          "find({ score: { $gte: 80 } })",
          "find({ score: \">=80\" })",
          "where(\"score>=80\")",
          "filter(score > 80)",
        ],
        correct: 0,
        explain: "Mongo query operators are $-prefixed keys inside the filter object: $gte, $lte, $in, $ne and friends.",
      },
      {
        q: "populate(\"subject\") on a query result…",
        opts: [
          "replaces the stored ObjectId with the full referenced document",
          "creates the Subject collection",
          "deletes orphaned references",
          "caches the query in memory",
        ],
        correct: 0,
        explain: "populate performs the join at query time: your Student comes back carrying the actual Subject document where the id used to be.",
      },
    ],
    task:
      "Design two Mongoose schemas for a tiny Library: Book (title, author, year, tags[]) and Loan (book ref, student ref, borrowedOn, returnedOn). Paste both schema files, then write one query: all books tagged 'dsa', sorted by year descending.",
    project: {
      title: "Project 04 — Notes API, Wired to MongoDB",
      description:
        "Take your Project 03 Notes API and replace the in-memory array with a Mongoose Note model. Connect via MONGODB_URI from .env, add required + trim validation, and return proper 400/404s. Submit your schema file, a .env.example, and the updated route handlers — plus the line of code you are most proud of and why.",
    },
  },
  {
    _id: "mod_mern_5",
    subject: subjectId,
    order: 5,
    title: "Ship It — Deploy & Go Live",
    desc: "Env vars, CORS, build pipelines and the checklist that turns a localhost app into a live product.",
    lesson: `
<p>An app on localhost is a prototype. This module is the bridge to <strong>a URL you can send someone</strong> — the exact pipeline this training hub runs on.</p>

<h3>1 · Two worlds: dev vs build</h3>
<ul>
  <li><strong>Frontend:</strong> <code>npm run build</code> produces a static <code>dist/</code> folder — HTML, JS, CSS. Host it anywhere static (Vercel, Netlify).</li>
  <li><strong>Backend:</strong> a Node process. Host it where a process can stay alive (Render, Railway) and give it a real database (MongoDB Atlas).</li>
</ul>

<h3>2 · Secrets live in env vars</h3>
<pre><code># .env — NEVER committed to git
MONGODB_URI=mongodb+srv://...
TRAINER_PASSCODE=...
CLIENT_ORIGIN=https://my-app.vercel.app</code></pre>
<p>Code reads <code>process.env.X</code>. Commit a <code>.env.example</code> with empty values instead.</p>

<h3>3 · CORS is the browser's bouncer</h3>
<p>Browsers block cross-origin requests unless the server opts in. Restrict the allowed origin to your deployed frontend only:</p>
<pre><code>app.use(cors({ origin: process.env.CLIENT_ORIGIN }));</code></pre>

<h3>4 · The go-live checklist</h3>
<ul>
  <li>Add <code>GET /api/health</code> → <code>{ ok: true }</code> so the host can probe liveness.</li>
  <li>Listen on <code>process.env.PORT</code> — the host chooses the port, not you.</li>
  <li>Smoke-test every endpoint against the live URL, not localhost.</li>
  <li>Watch the logs for the first hour. Something always surprises you.</li>
  <li>Open the app on a phone. Fix whatever breaks. Something will.</li>
</ul>`,
    quiz: [
      {
        q: "Which file must NEVER be committed to git?",
        opts: [".env", ".gitignore", "package.json", "README.md"],
        correct: 0,
        explain: ".env holds secrets (DB URI, passcodes). Commit a .env.example with the keys and empty values so teammates know what to fill in.",
      },
      {
        q: "CORS exists so that…",
        opts: [
          "browsers restrict cross-origin requests by default",
          "servers respond faster",
          "URLs stay short and clean",
          "cookies are encrypted",
        ],
        correct: 0,
        explain: "Same-origin policy is the browser's default: a page can't call a different origin unless that origin explicitly allows it via CORS headers.",
      },
      {
        q: "process.env.PORT is…",
        opts: [
          "always 3000",
          "provided by the hosting environment",
          "required by Express",
          "the frontend's dev port",
        ],
        correct: 1,
        explain: "Platforms like Render assign a port and pass it in PORT. app.listen(process.env.PORT || 5000) works on the host and on your laptop.",
      },
      {
        q: "A /health endpoint is there to…",
        opts: [
          "let the hosting platform probe that the app is alive",
          "store application logs",
          "reset the database safely",
          "serve the frontend bundle",
        ],
        correct: 0,
        explain: "Orchestrators poll a cheap endpoint to decide if your instance is healthy enough to receive traffic. Keep it dependency-light.",
      },
    ],
    task:
      "Write the deploy checklist you would run for this very app — at least 10 items, grouped into before-you-push, while-deploying, and after-going-live. Be specific enough that a stranger could execute it.",
    project: {
      title: "Capstone — A Deployed MERN App",
      description:
        "Ship a complete stack: React frontend + Express API + MongoDB Atlas, live at a public URL. Build the notes app end-to-end or propose your own idea in one sentence first. Both sides configured via env vars, CORS locked to your frontend origin, health endpoint included. Submit the live URL + repo link, and a short write-up of what broke during deploy and exactly how you fixed it.",
    },
  },
];

/* ------------------------------------------------------------------ */
/* Placeholder tracks                                                  */
/* ------------------------------------------------------------------ */

interface PlaceholderTrack {
  name: string;
  slug: string;
  mods: Array<{ t: string; d: string }>;
  bank: QuizQ[];
}

const TRACKS: PlaceholderTrack[] = [
  {
    name: "Data Science with Python",
    slug: "data-science",
    mods: [
      { t: "NumPy & Pandas Foundations", d: "Arrays, Series and DataFrames — the tables under every analysis." },
      { t: "Data Cleaning & Wrangling", d: "Missing values, duplicates, merges and reshaping messy reality." },
      { t: "Visualization & Storytelling", d: "Matplotlib, Seaborn and choosing the honest chart." },
    ],
    bank: [
      { q: "Which library is purpose-built for labelled, tabular data?", opts: ["NumPy", "Pandas", "Matplotlib", "SciPy"], correct: 1, explain: "Pandas' DataFrame is a labelled table with column names and an index — the default home for CSVs and SQL results." },
      { q: "df.dropna() returns…", opts: ["a new object with missing values removed", "nothing — it errors", "a sorted DataFrame", "the DataFrame schema"], correct: 0, explain: "By default dropna returns a new object with NaN rows dropped; pass inplace=True to mutate instead." },
      { q: "Best chart to show the distribution of one numeric column?", opts: ["Pie chart", "Histogram", "Line chart", "Heatmap"], correct: 1, explain: "A histogram buckets one numeric variable so you can see shape, skew and outliers at a glance." },
      { q: "np.array differs from a Python list because it is…", opts: ["fixed-type and vectorized", "always slower", "unable to hold numbers", "immutable in every case"], correct: 0, explain: "NumPy arrays store one dtype contiguously, so whole-array math runs in C without Python loops." },
    ],
  },
  {
    name: "Machine Learning",
    slug: "machine-learning",
    mods: [
      { t: "ML Thinking & Scikit-Learn", d: "Frames, pipelines and the fit/predict contract." },
      { t: "Supervised Learning Models", d: "Regression, classification, trees and neighbours." },
      { t: "Evaluation & Tuning", d: "Metrics that tell the truth, and search that finds the knobs." },
    ],
    bank: [
      { q: "Great on training data, poor on unseen data. This is…", opts: ["underfitting", "overfitting", "regularization", "data leakage"], correct: 1, explain: "The model memorized the training set instead of learning the pattern — holdout data exposes it." },
      { q: "Which of these is a supervised task?", opts: ["Clustering", "Classification", "Dimensionality reduction", "Market-basket mining"], correct: 1, explain: "Supervised learning maps inputs to known labels; classification predicts a category label." },
      { q: "Why split into train and test sets?", opts: ["to estimate generalization to unseen data", "to make training faster", "to reduce the number of features", "to remove NaNs"], correct: 0, explain: "The test set is never seen during training, so its score is an honest estimate of real-world performance." },
      { q: "A loss function…", opts: ["scores how wrong predictions are so training can minimize it", "compresses the dataset", "selects features automatically", "prevents overfitting by itself"], correct: 0, explain: "Training is optimization: the loss quantifies error and gradient descent walks it downhill." },
    ],
  },
  {
    name: "Java Programming",
    slug: "java",
    mods: [
      { t: "Java Syntax & OOP", d: "Classes, objects, inheritance and the JVM contract." },
      { t: "Collections & Generics", d: "List, Map, Set and type-safe containers." },
      { t: "Streams, Files & Exceptions", d: "Modern data pipelines and failing gracefully." },
    ],
    bank: [
      { q: "Java source code compiles to…", opts: ["machine code directly", "bytecode executed by the JVM", "JavaScript", "CIL for .NET only"], correct: 1, explain: "javac emits bytecode; the JVM interprets/JITs it — which is what makes Java portable across platforms." },
      { q: "Which keyword stops a class from being extended?", opts: ["static", "final", "private", "abstract"], correct: 1, explain: "A final class cannot be subclassed; final methods cannot be overridden; final variables cannot be reassigned." },
      { q: "ArrayList vs LinkedList: the practical difference is…", opts: ["ArrayList is array-backed with O(1) index access", "LinkedList is faster for reads by index", "they are interchangeable", "ArrayList cannot grow"], correct: 0, explain: "ArrayList gives constant-time positional reads; LinkedList pays O(n) to index but inserts cheaply mid-list." },
      { q: "Which of these is NOT a primitive type?", opts: ["int", "boolean", "String", "double"], correct: 2, explain: "String is a full class in java.lang; int, boolean and double are the eight primitives." },
    ],
  },
  {
    name: "Agentic AI",
    slug: "agentic-ai",
    mods: [
      { t: "LLM Primitives & Prompting", d: "Tokens, context windows and instructions that stick." },
      { t: "Tools, Memory & Planning", d: "Giving a model hands: function calls, stores and plans." },
      { t: "Building Agent Loops", d: "Observe → think → act, safely, until the job is done." },
    ],
    bank: [
      { q: "What separates an agent from a single chat completion?", opts: ["a loop of plan → act → observe with tools", "a bigger model", "streaming responses", "temperature set to zero"], correct: 0, explain: "Agency is the loop: the model acts on the world, observes results, and decides the next step." },
      { q: "The ReAct pattern interleaves…", opts: ["reasoning and acting", "reads and writes", "requests and caching", "ranking and filtering"], correct: 0, explain: "ReAct alternates chain-of-thought reasoning with tool actions, letting each inform the other." },
      { q: "Tool-calling means…", opts: ["the model emits structured calls your code executes", "the model runs Python by itself", "tools run the model", "the API caches results"], correct: 0, explain: "The model outputs a JSON call signature; YOUR runtime executes the function and feeds the result back." },
      { q: "The context window is…", opts: ["the token budget covering prompt plus output", "the server's RAM", "the vector database", "GPU memory"], correct: 0, explain: "Everything — system prompt, history, tool results, reply — must fit inside the window, so agents need memory strategies." },
    ],
  },
  {
    name: "Generative AI",
    slug: "generative-ai",
    mods: [
      { t: "How Generative Models Work", d: "Tokens, probabilities and why next-word prediction gets smart." },
      { t: "Prompt Engineering & RAG", d: "Instructions, few-shots and grounding answers in your data." },
      { t: "Shipping GenAI Features", d: "Latency, cost, evals and guardrails in production." },
    ],
    bank: [
      { q: "Temperature controls…", opts: ["the randomness of sampled output", "response speed", "API cost", "context length"], correct: 0, explain: "Higher temperature flattens the probability curve and yields more surprising tokens; near zero is near-deterministic." },
      { q: "RAG stands for…", opts: ["Retrieval-Augmented Generation", "Rapid Agent Graphs", "Recursive Alignment Gradients", "Real-time API Gateway"], correct: 0, explain: "RAG retrieves relevant documents and injects them into the prompt, grounding answers in your own data." },
      { q: "A token is roughly…", opts: ["a chunk of text the model processes as one unit", "always exactly one word", "one byte", "one sentence"], correct: 0, explain: "Common words map to one token; long or rare words split into several. Pricing and limits are measured in tokens." },
      { q: "'Hallucination' means the model…", opts: ["produces confident but unsupported or incorrect output", "renders GPU artifacts", "is being prompt-injected", "hit a rate limit"], correct: 0, explain: "Fluent ≠ true. Grounding (RAG), citations and evals are the engineering answers to hallucination." },
    ],
  },
  {
    name: "Python Programming",
    slug: "python",
    mods: [
      { t: "Python Basics & Control Flow", d: "Types, conditions, loops and the Pythonic style." },
      { t: "Functions, Modules & Files", d: "Small reusable pieces and reading/writing the real world." },
      { t: "OOP & Mini Projects", d: "Classes that earn their keep, glued into real scripts." },
    ],
    bank: [
      { q: "Which of these types is immutable?", opts: ["list", "dict", "tuple", "set"], correct: 2, explain: "A tuple can't be changed after creation — handy for fixed records and dictionary keys." },
      { q: "In def f(x=3), the x=3 part is…", opts: ["a default parameter value", "a keyword-only marker", "a global variable", "a type hint"], correct: 0, explain: "Callers may omit x and get 3. Default values are evaluated once, at definition time — a classic Python gotcha." },
      { q: "d['k'] differs from d.get('k') because…", opts: ["d['k'] raises KeyError when missing; .get returns None", "they are identical", ".get is always faster", "d['k'] creates the key"], correct: 0, explain: ".get softens the miss — and accepts a fallback: d.get('k', 0)." },
      { q: "Which of these values is falsy?", opts: ["0", "\"0\"", "[0]", "\"None\""], correct: 0, explain: "Zero, empty containers, None and empty strings are falsy. The string \"0\" and a list holding zero are both truthy." },
    ],
  },
  {
    name: "C & C++",
    slug: "c-cpp",
    mods: [
      { t: "Memory, Pointers & C Basics", d: "The machine under the languages: stack, heap, addresses." },
      { t: "C++ Classes & the STL", d: "RAII, containers, iterators and algorithms that compose." },
      { t: "Build Systems & Debugging", d: "Make/CMake, sanitizers and reading a segfault calmly." },
    ],
    bank: [
      { q: "A pointer stores…", opts: ["a memory address", "a copy of a value", "a CPU register", "a file handle"], correct: 0, explain: "A pointer's value IS an address; dereferencing (*) follows that address to the data living there." },
      { q: "Stack vs heap, in one line:", opts: ["stack is automatic scoped memory; heap is manually managed", "stack is slower", "heap is automatic", "there is no difference"], correct: 0, explain: "Stack frames vanish when functions return; heap allocations live until you (or a smart pointer) release them." },
      { q: "RAII ties…", opts: ["resource lifetime to object scope", "RAM directly to I/O", "pointers to arrays", "templates to macros"], correct: 0, explain: "Constructors acquire, destructors release — so resources free automatically when objects go out of scope." },
      { q: "#include <vector> gives you…", opts: ["a dynamic array container", "a linked list", "a preprocessor macro", "a thread pool"], correct: 0, explain: "std::vector is a growable contiguous array — the default container for 'I need a list of things' in C++." },
    ],
  },
  {
    name: "Data Structures & Algorithms (DSA)",
    slug: "dsa",
    mods: [
      { t: "Complexity & Core Structures", d: "Big-O, arrays, linked lists, stacks and queues." },
      { t: "Trees, Graphs & Traversals", d: "BFS, DFS and the shapes problems secretly have." },
      { t: "Dynamic Programming Patterns", d: "Memoization, tabulation and recognizing the setup." },
    ],
    bank: [
      { q: "Binary search on a sorted array runs in…", opts: ["O(log n)", "O(n)", "O(1)", "O(n log n)"], correct: 0, explain: "Each comparison halves the search space — a million items take ~20 steps." },
      { q: "Which structure is FIFO?", opts: ["Stack", "Queue", "Binary tree", "Hash map"], correct: 1, explain: "A queue serves elements first-in-first-out; a stack is LIFO." },
      { q: "Average-case hash map lookup is…", opts: ["O(1)", "O(log n)", "O(n)", "O(n²)"], correct: 0, explain: "A good hash scatters keys uniformly, so a lookup touches one bucket on average — worst case degrades to O(n)." },
      { q: "Breadth-first search naturally uses a…", opts: ["queue", "stack", "heap", "skip list"], correct: 0, explain: "BFS explores level by level: enqueue a node's neighbours, dequeue the next frontier — FIFO order." },
    ],
  },
];

function placeholderLesson(subjectName: string, title: string): string {
  return `
<div class="ph-badge">Placeholder curriculum</div>
<h3>${title}</h3>
<p>The full written lesson for this module is being authored by the training team and ships to the live cohort before this module opens on the dashboard. Until then, use this page as your working brief: the quiz, task and checkpoint below are live and reviewed by your trainer like any other submission.</p>

<h3>What this module covers</h3>
<ul>
  <li>The core mental model behind <strong>${title}</strong> — and the one diagram that makes it click.</li>
  <li>The 20% of syntax and API that does 80% of the day-to-day work in ${subjectName}.</li>
  <li>How this module hands off to the next stop on the track, so nothing you learn here is an island.</li>
</ul>

<h3>How to proceed</h3>
<p>Skim your existing notes on the topic, take the quiz to find your gaps, then attempt the task and the checkpoint project. Drafts save automatically — submit when your trainer can review real work, not a blank page.</p>

<pre><code>// backend/seed.js
// replace this placeholder lesson with full
// subject-specific material before the next cohort</code></pre>`;
}

function placeholderModules(subjectId: string, track: PlaceholderTrack): ModuleDoc[] {
  return track.mods.map((m, i) => {
    const q0 = track.bank[i % track.bank.length];
    const q1 = track.bank[(i + 1) % track.bank.length];
    return {
      _id: `mod_${track.slug}_${i + 1}`,
      subject: subjectId,
      order: i + 1,
      title: m.t,
      desc: m.d,
      lesson: placeholderLesson(track.name, m.t),
      quiz: [q0, q1],
      task: `Warm-up for "${m.t}": in roughly 150 words plus a small code sketch, explain the core idea of this module and one real project where you would reach for it. Drafts save as you type — submit when it says something you'd defend in a live class.`,
      project: {
        title: `${track.name} Checkpoint — ${m.t}`,
        description: `Placeholder build brief (will be replaced with the full project spec). Deliver: a small working artifact demonstrating "${m.t}" — code paste or link — plus three short notes: what you built, the hardest bug you hit, and the next step you'd take if you had one more week.`,
      },
      placeholder: true,
    };
  });
}

/* ------------------------------------------------------------------ */
/* Demo students + progress                                            */
/* ------------------------------------------------------------------ */

interface DemoStudent {
  id: string;
  name: string;
  subjectSlug: string;
  joinedDaysAgo: number;
  rows: Record<string, Partial<ProgressRow>>;
}

const DEMO_STUDENTS: DemoStudent[] = [
  {
    id: "stu_aisha",
    name: "Aisha Bello",
    subjectSlug: "mern",
    joinedDaysAgo: 24,
    rows: {
      mod_mern_1: {
        lessonDone: true,
        quizScore: 100,
        quizAttempts: 1,
        taskText: "Semantic layout rebuilt: <header> + <nav>, <main> with <article>/<aside>, <footer>. border-box on *, one @media (max-width: 720px) that stacks the grid. Live at aisha-profile.netlify.app",
        taskSubmitted: true,
        projectText: "https://github.com/aishab/profile-page\n\nHardest call: chips as inline-flex vs grid — went with flex-wrap so they reflow naturally on narrow screens.",
        projectSubmitted: true,
      },
      mod_mern_2: {
        lessonDone: true,
        quizScore: 75,
        quizAttempts: 2,
        taskText: "function rangeSum(a, b) { let s = 0; for (let i = a; i <= b; i++) s += i; return s; }\nrangeSum(1, 100) // 5050\n\nfunction debounce(fn, ms) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); }; }",
        taskSubmitted: true,
        projectText: "https://aisha-kanban.netlify.app — three columns, localStorage persistence, move/delete buttons. map() did the heavy lifting for rendering columns from state.",
        projectSubmitted: true,
      },
      mod_mern_3: {
        lessonDone: true,
        quizScore: 75,
        quizAttempts: 1,
        taskText: "server.js with express.json() before routes. Tested: curl localhost:5000/api/quotes, curl .../api/quotes/2, curl -X POST with JSON body. 404 confirmed on /api/quotes/99.",
        taskSubmitted: true,
        projectText: "",
        projectSubmitted: false,
      },
    },
  },
  {
    id: "stu_daniel",
    name: "Daniel Okafor",
    subjectSlug: "mern",
    joinedDaysAgo: 18,
    rows: {
      mod_mern_1: {
        lessonDone: true,
        quizScore: 75,
        quizAttempts: 2,
        taskText: "Done — header/nav/main(article+aside)/footer, stacks under 720px. Link: dokafor.github.io/layout-drill",
        taskSubmitted: true,
        projectText: "https://github.com/dokafor/profile-page — cards via grid auto-fill minmax(240px, 1fr).",
        projectSubmitted: true,
      },
      mod_mern_2: {
        lessonDone: true,
        quizScore: null,
        quizAttempts: 0,
        taskText: "rangeSum done, still thinking about debounce — draft.",
        taskSubmitted: false,
        projectText: "",
        projectSubmitted: false,
      },
    },
  },
  {
    id: "stu_priya",
    name: "Priya Nair",
    subjectSlug: "dsa",
    joinedDaysAgo: 12,
    rows: {
      mod_dsa_1: {
        lessonDone: true,
        quizScore: 100,
        quizAttempts: 1,
        taskText: "Big-O cheat sheet in my own words + linked list vs array table. Code sketch: Stack with push/pop/peek on an array, with the amortized-cost argument written out.",
        taskSubmitted: true,
        projectText: "Bracket balancer + LRU sketch: https://github.com/priyan/dsa-checkpoint-1",
        projectSubmitted: true,
      },
      mod_dsa_2: {
        lessonDone: true,
        quizScore: 50,
        quizAttempts: 1,
        taskText: "",
        taskSubmitted: false,
        projectText: "",
        projectSubmitted: false,
      },
    },
  },
  {
    id: "stu_marco",
    name: "Marco Silva",
    subjectSlug: "python",
    joinedDaysAgo: 9,
    rows: {
      mod_python_1: {
        lessonDone: true,
        quizScore: 100,
        quizAttempts: 1,
        taskText: "FizzBuzz with match statement, plus a number-guessing loop using while/else. Paste in repo README.",
        taskSubmitted: true,
        projectText: "https://github.com/marcosilva/py-basics — CLI quiz game, score tracking, input validation.",
        projectSubmitted: true,
      },
    },
  },
  {
    id: "stu_yuki",
    name: "Yuki Tanaka",
    subjectSlug: "generative-ai",
    joinedDaysAgo: 6,
    rows: {
      mod_generative_ai_1: {
        lessonDone: true,
        quizScore: null,
        quizAttempts: 0,
        taskText: "",
        taskSubmitted: false,
        projectText: "",
        projectSubmitted: false,
      },
    },
  },
  {
    id: "stu_fatima",
    name: "Fatima Zahra",
    subjectSlug: "machine-learning",
    joinedDaysAgo: 30,
    rows: {
      mod_machine_learning_1: {
        lessonDone: true,
        quizScore: 100,
        quizAttempts: 1,
        taskText: "fit/predict pipeline on the iris set with train_test_split(stratify=y). Notebook linked.",
        taskSubmitted: true,
        projectText: "KNN vs LogisticRegression on a cleaned Titanic subset — notebook + 5-line write-up: https://github.com/fatimaz/ml-checkpoint-1",
        projectSubmitted: true,
      },
      mod_machine_learning_2: {
        lessonDone: true,
        quizScore: 75,
        quizAttempts: 1,
        taskText: "Decision tree trained on churn data; depth=3 vs depth=None comparison table pasted.",
        taskSubmitted: true,
        projectText: "",
        projectSubmitted: false,
      },
    },
  },
];

/* ------------------------------------------------------------------ */
/* Live classes                                                        */
/* ------------------------------------------------------------------ */

const LIVE_CLASSES: LiveClass[] = [
  { _id: "lc_01", title: "MERN Cohort 6 — Express Deep Dive", date: dPlus(2), time: "19:00", link: "https://meet.google.com/xkr-tnfd-qwp" },
  { _id: "lc_02", title: "Office Hours — Project Reviews (all tracks)", date: dPlus(5), time: "17:30", link: "https://meet.google.com/bhz-pmce-jyd" },
  { _id: "lc_03", title: "DSA Crash Session — Graph Traversals Live", date: dPlus(8), time: "20:00", link: "https://meet.google.com/qmv-wdrt-eks" },
  { _id: "lc_04", title: "Kickoff — Cohort 6 Orientation", date: dPlus(-3), time: "18:00", link: "https://meet.google.com/ryc-vjdo-mzs" },
];

/* ------------------------------------------------------------------ */
/* Assembly                                                            */
/* ------------------------------------------------------------------ */

export function seedDB(): DB {
  seq = 0;

  const subjects: Subject[] = SUBJECTS.map((s) => ({
    _id: `sub_${s.slug}`,
    name: s.name,
    slug: s.slug,
  }));

  const modules: ModuleDoc[] = [
    ...mernModules("sub_mern"),
    ...TRACKS.flatMap((t) => placeholderModules(`sub_${t.slug}`, t)),
  ];

  const students: StudentRec[] = DEMO_STUDENTS.map((d) => ({
    _id: d.id,
    name: d.name,
    subject: `sub_${d.subjectSlug}`,
    createdAt: new Date(Date.now() - d.joinedDaysAgo * 86400000).toISOString(),
  }));

  const progress: ProgressRow[] = [];
  for (const d of DEMO_STUDENTS) {
    for (const [moduleId, partial] of Object.entries(d.rows)) {
      progress.push({
        _id: uid("prg_"),
        student: d.id,
        module: moduleId,
        lessonDone: partial.lessonDone ?? false,
        quizScore: partial.quizScore ?? null,
        quizAttempts: partial.quizAttempts ?? 0,
        taskText: partial.taskText ?? "",
        taskSubmitted: partial.taskSubmitted ?? false,
        projectText: partial.projectText ?? "",
        projectSubmitted: partial.projectSubmitted ?? false,
      });
    }
  }

  return {
    subjects,
    students,
    trainers: [{ _id: "trn_01", name: "Coach Ade" }],
    modules,
    progress,
    liveClasses: [...LIVE_CLASSES],
  };
}
