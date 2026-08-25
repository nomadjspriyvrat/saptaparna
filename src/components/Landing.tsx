import { useEffect, useMemo, useState } from "react";
import katex from "katex";
import * as api from "../api";
import { FAQS, TESTIMONIALS } from "../data/seed";
import { useTypedLineCount } from "../hooks";
import type { CourseBundle } from "../types";
import { fmtDuration, fmtINR } from "../util";
import Reveal from "./Reveal";
import { IconBolt, IconCheck, IconChevron, IconClock, IconFileTex, IconInfinity, IconPlay, IconQuote, IconShield, IconStar, IconVideo, IconWand, LogoSigma } from "./icons";

const tex = (s: string, display = false) =>
  katex.renderToString(s, { displayMode: display, throwOnError: false, strict: false });

const TICKER = [
  "\\zeta(2) = \\tfrac{\\pi^2}{6}",
  "e^{i\\pi} + 1 = 0",
  "\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}",
  "\\sum_{k=0}^{\\infty} \\tfrac{x^k}{k!} = e^x",
  "\\langle u, v \\rangle \\le \\|u\\|\\,\\|v\\|",
  "f'(c) = \\tfrac{f(b)-f(a)}{b-a}",
  "\\lim_{n\\to\\infty}\\left(1+\\tfrac{1}{n}\\right)^{n} = e",
  "c_n = \\tfrac{1}{2\\pi}\\int_{-\\pi}^{\\pi} f(x)e^{-inx}\\,dx",
];

const COMPILE_SRC = [
  "\\begin{theorem}[Basel problem]",
  "\\[ \\sum_{n=1}^{\\infty} \\frac{1}{n^2}",
  "   = \\frac{\\pi^2}{6} \\]",
  "\\end{theorem}",
  "% compiled by EduTeX → KaTeX",
];

const COMPILE_LOGS = [
  "This is EduTeX, Version 3.141592",
  "(main.tex → amsmath.sty, tcolorbox.sty)",
  "Typeset 1 formula via KaTeX engine",
  "Output written on main.html (1 screen, 0.62s).",
];

function CompileCard() {
  const visible = useTypedLineCount(COMPILE_SRC.length, 520);
  const reduced = useMemo(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);
  const shown = reduced ? COMPILE_SRC.length : visible;
  const done = shown >= COMPILE_SRC.length;

  return (
    <div className="panel overflow-hidden border-line2/60 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]">
      <div className="flex items-center gap-2 border-b border-line bg-panel2 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-coral/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-chalk/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-mint/70" />
        <span className="ml-2 font-code text-[11px] tracking-[0.08em] text-dim">main.tex — EduTeX compiler</span>
      </div>
      <div className="grid lg:grid-cols-2">
        <div className="min-h-[190px] border-b border-line bg-[#0a100c] p-4 font-code text-[12px] leading-[1.9] text-mute lg:border-b-0 lg:border-r">
          {COMPILE_SRC.slice(0, shown).map((line, i) => (
            <div key={i} className="whitespace-pre">
              <span className="mr-3 select-none text-dim/60">{i + 1}</span>
              <span className={line.startsWith("\\begin") || line.startsWith("\\end") ? "text-chalk" : line.startsWith("%") ? "text-dim italic" : "text-[#b9d4c4]"}>
                {line}
              </span>
              {i === shown - 1 && !done && <span className="caret" />}
            </div>
          ))}
          {done && <div className="mt-3 text-[10.5px] tracking-[0.12em] text-mint">✓ 0 ERRORS · 0 OVERFULL HBOXES</div>}
        </div>
        <div className="flex flex-col justify-center p-5">
          <div className="label-xs mb-3">compiled output</div>
          {done ? (
            <div className="thm node-fade">
              <div className="thm-tag">Theorem (Basel problem).</div>
              <div dangerouslySetInnerHTML={{ __html: tex("\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}", true) }} />
            </div>
          ) : (
            <div className="skel h-[86px]" />
          )}
        </div>
      </div>
      <div className="border-t border-line bg-panel2 px-4 py-2.5 font-code text-[10.5px] text-dim">
        <span className="text-chalk">$</span> edutex main.tex{" "}
        <span className="text-mute">{COMPILE_LOGS[(Math.floor(Date.now() / 2600)) % COMPILE_LOGS.length]}</span>
      </div>
    </div>
  );
}

interface LandingProps {
  onTrial: () => void;
  onSignIn: () => void;
  onTrainer: () => void;
}

export default function Landing({ onTrial, onSignIn, onTrainer }: LandingProps) {
  const [bundle, setBundle] = useState<CourseBundle | null>(null);
  const [openMod, setOpenMod] = useState<string | null>("mod_c1");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [previewTab, setPreviewTab] = useState<"rendered" | "source">("rendered");

  useEffect(() => {
    api.getCourseBundle("advanced-calculus").then(setBundle).catch(() => setBundle(null));
  }, []);

  const tickerHtml = useMemo(() => TICKER.map((t) => tex(t)), []);
  const course = bundle?.course;
  const mods = bundle?.modules ?? [];
  const firstMod = mods[0];

  return (
    <div className="min-h-screen">
      {/* ---------- nav ---------- */}
      <header className="sticky top-0 z-50 border-b border-line bg-void/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="text-chalk"><LogoSigma size={26} sw={2} /></span>
            <span className="font-display text-[19px] font-bold italic tracking-tight text-ink">
              Edu<span className="text-chalk">Launch</span>
            </span>
          </div>
          <nav className="hidden items-center gap-7 font-code text-[11.5px] font-semibold tracking-[0.1em] text-mute md:flex">
            <a href="#syllabus" className="transition-colors hover:text-chalk">SYLLABUS</a>
            <a href="#pricing" className="transition-colors hover:text-chalk">PRICING</a>
            <a href="#instructor" className="transition-colors hover:text-chalk">INSTRUCTOR</a>
            <a href="#faq" className="transition-colors hover:text-chalk">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <button className="btn btn-ghost !text-[11px]" onClick={onTrainer}>TRAINER</button>
            <button className="btn btn-ghost !text-[11px] hidden sm:inline-flex" onClick={onSignIn}>STUDENT SIGN-IN</button>
            <button className="btn btn-chalk !text-[11px]" onClick={onTrial}>FREE TRIAL</button>
          </div>
        </div>
      </header>

      {/* ---------- hero ---------- */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24 lg:pt-16">
          <div>
            <Reveal>
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip chip-chalk"><IconFileTex size={12} /> LaTeX-native</span>
                <span className="chip chip-mint">2-day free trial</span>
                <span className="chip"><IconVideo size={12} /> live classes</span>
              </div>
            </Reveal>
            <Reveal delay={90}>
              <h1 className="mt-6 font-display text-[40px] font-bold leading-[1.06] tracking-tight text-ink sm:text-[58px]">
                Analysis, typeset the way it was{" "}
                <em className="text-chalk">meant to be read.</em>
              </h1>
            </Reveal>
            <Reveal delay={180}>
              <p className="mt-6 max-w-xl text-[15.5px] leading-relaxed text-mute">
                EduLaunch compiles instructor-authored LaTeX into publication-grade lessons — ε–δ arguments, aligned
                derivations, theorem boxes — then wraps them in trials, quizzes, payments and live rooms.{" "}
                <span className="text-ink">Start free for 48 hours. No card.</span>
              </p>
            </Reveal>
            <Reveal delay={260}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button className="btn btn-chalk !px-6 !py-3.5 !text-[13px]" onClick={onTrial}>
                  <IconBolt size={16} sw={2} /> START YOUR FREE TRIAL
                </button>
                <a href="#syllabus" className="btn btn-ghost !px-6 !py-3.5 !text-[13px]">
                  BROWSE THE SYLLABUS
                </a>
              </div>
            </Reveal>
            <Reveal delay={340}>
              <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3">
                <span className="flex items-center gap-1.5 text-[13px] text-mute">
                  <span className="flex text-chalk">
                    {[0, 1, 2, 3, 4].map((i) => <IconStar key={i} size={14} sw={2} />)}
                  </span>
                  <strong className="text-ink">{course ? course.rating.toFixed(1) : "4.9"}</strong>
                </span>
                <span className="font-code text-[11.5px] tracking-[0.08em] text-dim">
                  {course ? course.enrolled.toLocaleString("en-IN") : "1,200+"} ENROLLED
                </span>
                <span className="font-code text-[11.5px] tracking-[0.08em] text-dim">{course ? course.totalHours : 32} HOURS · 8 MODULES</span>
                <span className="chip chip-sky">{course ? course.level : "Undergraduate"}</span>
              </div>
            </Reveal>
          </div>
          <Reveal delay={200}>
            <CompileCard />
          </Reveal>
        </div>

        {/* formula ticker */}
        <div className="border-y border-line bg-abyss/60 py-3.5">
          <div className="ticker-wrap">
            <div className="ticker">
              {[...tickerHtml, ...tickerHtml].map((h, i) => (
                <span key={i} className="flex items-center gap-3 text-mute">
                  <span dangerouslySetInnerHTML={{ __html: h }} />
                  <span className="text-chalk/50">·</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- why: sticky two-column ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <div className="label-xs">// why EduLaunch</div>
              <h2 className="mt-3 font-display text-[34px] font-bold leading-tight tracking-tight text-ink sm:text-[42px]">
                A platform built around <em className="text-mint">the notation itself.</em>
              </h2>
              <p className="mt-5 max-w-md text-[14.5px] leading-relaxed text-mute">
                Most course tools treat math as an image to upload. We treat it as source code to compile — with the
                enrollment, trial and classroom machinery a serious course actually needs.
              </p>
            </Reveal>
          </div>
          <div className="flex flex-col gap-4">
            {[
              {
                n: "01", Icon: IconWand, t: "Compile, don't screenshot",
                d: "Lessons are authored in LaTeX and compiled server-side to HTML with KaTeX — theorems, align blocks, code listings — rendering crisply on any device.",
              },
              {
                n: "02", Icon: IconClock, t: "48 hours of everything, free",
                d: "Registration starts a full-access trial instantly. The countdown lives in your dashboard; when it hits zero, content locks until you pay once.",
              },
              {
                n: "03", Icon: IconVideo, t: "Rooms that schedule themselves",
                d: "Create a live class and a Jitsi or Google Meet room is generated on the spot — valid links, recordings, and calendar files for every student.",
              },
              {
                n: "04", Icon: IconShield, t: "Access control, per student",
                d: "Instructors enable or disable individual modules per learner, flip enrollment status, and see every quiz score from one admin console.",
              },
            ].map((f, i) => (
              <Reveal key={f.n} delay={i * 80}>
                <div className="panel panel-hover group flex gap-5 p-6">
                  <div className="flex flex-col items-center gap-3">
                    <span className="font-display text-[22px] font-bold italic text-chalk/80">{f.n}</span>
                    <span className="h-10 w-px bg-line" />
                    <span className="text-mint transition-transform duration-300 group-hover:scale-110 group-hover:text-chalk">
                      <f.Icon size={20} />
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-[19px] font-semibold italic text-ink">{f.t}</h3>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-mute">{f.d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- syllabus ---------- */}
      <section id="syllabus" className="border-t border-line bg-abyss/40 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="label-xs">// the syllabus</div>
                <h2 className="mt-3 font-display text-[34px] font-bold tracking-tight text-ink sm:text-[42px]">
                  Eight modules, <em className="text-chalk">zero hand-waving.</em>
                </h2>
              </div>
              <span className="chip chip-mint mb-1.5">FULL ACCESS DURING TRIAL</span>
            </div>
          </Reveal>
          <div className="mt-9 flex flex-col gap-3">
            {mods.map((m, i) => {
              const open = openMod === m._id;
              return (
                <Reveal key={m._id} delay={Math.min(i * 55, 330)}>
                  <div className={`panel overflow-hidden transition-colors duration-200 ${open ? "border-line2" : ""}`}>
                    <button
                      className="flex w-full items-center gap-4 px-5 py-4 text-left sm:px-6"
                      onClick={() => setOpenMod(open ? null : m._id)}
                    >
                      <span className={`font-display text-[24px] font-bold italic ${open ? "text-chalk" : "text-dim"}`}>
                        {String(m.order).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15.5px] font-bold text-ink">{m.title}</span>
                        <span className="mt-0.5 block truncate text-[12.5px] text-dim">{m.description}</span>
                      </span>
                      <span className="chip hidden sm:inline-flex"><IconClock size={11} /> {fmtDuration(m.estimatedMinutes)}</span>
                      <span className={`text-dim transition-transform duration-300 ${open ? "rotate-180 text-chalk" : ""}`}>
                        <IconChevron size={16} />
                      </span>
                    </button>
                    <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                      <div className="overflow-hidden">
                        <div className="border-t border-line bg-panel2/60 px-5 py-4 sm:px-6">
                          <div className="tex-prose max-w-none" dangerouslySetInnerHTML={{ __html: m.content.compiledHtml.split("<h3")[0].split('<div class="thm thm-example"')[0] }} />
                          <button className="btn btn-ghost mt-2 !text-[11px]" onClick={onTrial}>
                            <IconPlay size={14} /> READ IT FREE IN THE TRIAL
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* rendered vs source preview */}
          {firstMod && (
            <Reveal>
              <div className="panel mt-10 overflow-hidden">
                <div className="flex items-center justify-between gap-3 border-b border-line bg-panel2 px-5 py-3">
                  <span className="font-code text-[11px] tracking-[0.12em] text-dim">
                    MODULE 01 · {previewTab === "rendered" ? "WHAT STUDENTS SEE" : "WHAT THE INSTRUCTOR WRITES"}
                  </span>
                  <div className="flex gap-1">
                    {(["rendered", "source"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setPreviewTab(t)}
                        className={`rounded-md px-3 py-1.5 font-code text-[10.5px] font-bold tracking-[0.1em] transition-colors ${
                          previewTab === t ? "bg-chalk text-[#231a03]" : "text-dim hover:text-ink"
                        }`}
                      >
                        {t.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="max-h-[420px] overflow-y-auto p-5 sm:p-7">
                  {previewTab === "rendered" ? (
                    <div className="tex-prose" dangerouslySetInnerHTML={{ __html: firstMod.content.compiledHtml }} />
                  ) : (
                    <pre className="whitespace-pre-wrap font-code text-[12px] leading-[1.8] text-[#b9d4c4]">{firstMod.content.latexSource}</pre>
                  )}
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ---------- pricing ---------- */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal>
          <div className="panel relative overflow-hidden border-chalk/25 p-8 sm:p-12">
            <div className="pointer-events-none absolute -right-16 -top-16 text-chalk/[0.05]">
              <IconInfinity size={320} sw={1} />
            </div>
            <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <div className="label-xs">// one course, one payment</div>
                <div className="mt-5 flex flex-wrap items-baseline gap-4">
                  <span className="font-display text-[64px] font-bold leading-none text-chalk sm:text-[80px]">
                    {course ? fmtINR(course.pricing.discountPrice ?? course.pricing.amount) : "₹2,999"}
                  </span>
                  {course?.pricing.discountPrice && (
                    <span className="font-display text-[26px] text-dim line-through">{fmtINR(course.pricing.amount)}</span>
                  )}
                  <span className="chip chip-mint">LAUNCH OFFER</span>
                </div>
                <ul className="mt-7 grid max-w-md gap-3">
                  {[
                    "Lifetime access to all 8 modules & future re-typesets",
                    "Every quiz with instant grading and explanations",
                    "All live classes + recordings included",
                    "Compiled PDF-quality lessons on any device",
                  ].map((x) => (
                    <li key={x} className="flex items-start gap-3 text-[14px] text-mute">
                      <span className="mt-0.5 shrink-0 text-mint"><IconCheck size={15} /></span>
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-line bg-panel2/70 p-6 sm:p-7">
                <div className="flex items-center gap-3">
                  <span className="text-chalk"><IconClock size={22} /></span>
                  <div>
                    <div className="font-display text-[18px] font-semibold italic text-ink">First 48 hours free</div>
                    <div className="text-[12px] text-dim">full content · no card · clock starts at sign-up</div>
                  </div>
                </div>
                <button className="btn btn-chalk mt-5 w-full !py-3.5 !text-[13px]" onClick={onTrial}>
                  <IconBolt size={16} sw={2} /> START FREE TRIAL
                </button>
                <button className="btn btn-ghost mt-3 w-full" onClick={onSignIn}>I ALREADY HAVE AN ACCOUNT</button>
                <p className="mt-4 text-center font-code text-[10px] tracking-[0.1em] text-dim">
                  SECURED BY RAZORPAY · SANDBOX MODE IN THIS DEMO
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------- instructor ---------- */}
      <section id="instructor" className="border-t border-line bg-abyss/40 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <Reveal>
              <div className="panel h-full p-8 text-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-chalk/50 bg-chalk/10 font-display text-[38px] font-bold italic text-chalk">
                  AR
                </div>
                <h3 className="mt-5 font-display text-[24px] font-bold italic text-ink">Dr. Ananya Rao</h3>
                <div className="mt-1 font-code text-[11px] tracking-[0.14em] text-dim">PROGRAM DIRECTOR · 12 YRS</div>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {["Real Analysis", "Measure Theory", "Functional Analysis"].map((s) => (
                    <span key={s} className="chip chip-sky">{s}</span>
                  ))}
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-6">
                  <div>
                    <div className="font-display text-[26px] font-bold text-chalk">1,700+</div>
                    <div className="label-xs mt-1">students taught</div>
                  </div>
                  <div>
                    <div className="font-display text-[26px] font-bold text-mint">4.9★</div>
                    <div className="label-xs mt-1">avg rating</div>
                  </div>
                </div>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div>
                <div className="label-xs">// your instructor</div>
                <h2 className="mt-3 font-display text-[32px] font-bold leading-tight tracking-tight text-ink sm:text-[40px]">
                  Taught by someone who <em className="text-mint">writes proofs for a living.</em>
                </h2>
                <p className="mt-5 max-w-xl text-[14.5px] leading-relaxed text-mute">
                  Former IISc faculty, twelve years of teaching real analysis and measure theory. Every lesson in this
                  platform is authored by Dr. Rao in LaTeX, compiled here, and argued the way it would be on a
                  blackboard — hypothesis first, quantifiers in order, no steps skipped.
                </p>
                <div className="mt-8 flex flex-col gap-4">
                  {TESTIMONIALS.map((t, i) => (
                    <Reveal key={t.name} delay={i * 90}>
                      <figure className={`panel panel-hover p-5 ${i === 1 ? "lg:ml-10" : ""}`}>
                        <span className="text-chalk/70"><IconQuote size={20} /></span>
                        <blockquote className="mt-2 text-[13.5px] leading-relaxed text-mute">{t.text}</blockquote>
                        <figcaption className="mt-3 flex items-center justify-between">
                          <span className="text-[13px] font-bold text-ink">
                            {t.name} <span className="ml-1 font-normal text-dim">· {t.role}</span>
                          </span>
                          <span className="flex text-chalk">
                            {Array.from({ length: t.rating }).map((_, k) => <IconStar key={k} size={12} sw={2} />)}
                          </span>
                        </figcaption>
                      </figure>
                    </Reveal>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <Reveal>
          <div className="text-center">
            <div className="label-xs">// frequently asked</div>
            <h2 className="mt-3 font-display text-[34px] font-bold tracking-tight text-ink">
              Everything <em className="text-chalk">worth asking.</em>
            </h2>
          </div>
        </Reveal>
        <div className="mt-9 flex flex-col gap-3">
          {FAQS.map((f, i) => {
            const open = openFaq === i;
            return (
              <Reveal key={f.q} delay={Math.min(i * 60, 300)}>
                <div className={`panel overflow-hidden ${open ? "border-line2" : ""}`}>
                  <button className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left" onClick={() => setOpenFaq(open ? null : i)}>
                    <span className={`text-[14.5px] font-bold ${open ? "text-chalk" : "text-ink"}`}>{f.q}</span>
                    <span className={`shrink-0 text-dim transition-transform duration-300 ${open ? "rotate-180 text-chalk" : ""}`}>
                      <IconChevron size={16} />
                    </span>
                  </button>
                  <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                    <div className="overflow-hidden">
                      <p className="border-t border-line px-5 py-4 text-[13.5px] leading-relaxed text-mute">{f.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ---------- final CTA ---------- */}
      <section className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-4 py-14 sm:px-6">
          <div>
            <h2 className="font-display text-[30px] font-bold tracking-tight text-ink sm:text-[38px]">
              Your first 48 hours are <em className="text-chalk">on us.</em>
            </h2>
            <p className="mt-2 text-[14px] text-mute">Register, read Module 01, take the quiz. Decide with evidence.</p>
          </div>
          <button className="btn btn-chalk !px-7 !py-4 !text-[13.5px]" onClick={onTrial}>
            <IconBolt size={16} sw={2} /> START FREE TRIAL
          </button>
        </div>
      </section>

      <footer className="border-t border-line bg-abyss/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="text-chalk"><LogoSigma size={18} sw={2} /></span>
            <span className="font-display text-[15px] font-bold italic text-ink">EduLaunch</span>
          </div>
          <p className="font-code text-[10.5px] tracking-[0.12em] text-dim">
            TYPESET WITH KATEX · MEET ROOMS BY JITSI & GOOGLE · DEMO BUILD
          </p>
        </div>
      </footer>
    </div>
  );
}
