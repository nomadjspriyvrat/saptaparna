import confetti from "canvas-confetti";
import { useCallback, useEffect, useState, type ComponentType } from "react";
import * as api from "../api";
import { useNow } from "../hooks";
import { toast } from "../toast";
import type { Payment, Session, StudentHome } from "../types";
import { effectiveStatus, fmtCountdown, fmtDateLong, fmtINR, initials, timeAgo, trialRemaining } from "../util";
import LiveSchedule from "./LiveSchedule";
import ModuleViewer from "./ModuleViewer";
import Reveal from "./Reveal";
import Ring from "./Ring";
import { IconCard, IconCheck, IconCheckCircle, IconClock, IconGrid, IconLock, IconLogout, IconPlay, IconReceipt, IconVideo, LogoSigma, type IconProps } from "./icons";

type View = "home" | "module" | "live" | "billing";

const NAV: Array<{ v: View; label: string; Icon: ComponentType<IconProps> }> = [
  { v: "home", label: "My Course", Icon: IconGrid },
  { v: "live", label: "Live Classes", Icon: IconVideo },
  { v: "billing", label: "Billing & Access", Icon: IconCard },
];

/* ---------------- payment modal ---------------- */

function PaymentModal({ amount, onPaid, onClose }: { amount: number; onPaid: (orderId: string) => Promise<void>; onClose: () => void }) {
  const [method, setMethod] = useState<"upi" | "card">("upi");
  const [step, setStep] = useState<"form" | "processing" | "done">("form");
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState("");

  const start = async () => {
    setStep("processing");
    setError("");
    try {
      const order = await api.createOrder(PaymentModal.studentId, method);
      setOrderId(order.orderId);
      await new Promise((r) => setTimeout(r, 1500));
      await onPaid(order.orderId);
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed — try again.");
      setStep("form");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-void/90 p-4 backdrop-blur-sm sm:items-center" onClick={step === "form" ? onClose : undefined}>
      <div className="panel relative mt-8 w-full max-w-md border-line2/70 p-6 sm:p-7" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-chalk"><LogoSigma size={22} sw={2} /></span>
            <span className="font-code text-[11px] font-bold tracking-[0.16em] text-dim">RAZORPAY · SANDBOX</span>
          </div>
          <span className="chip chip-mint">256-BIT TLS</span>
        </div>

        {step !== "done" ? (
          <>
            <div className="mt-6 rounded-xl border border-line bg-panel2/70 p-5">
              <div className="label-xs">course fee · one-time</div>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="font-display text-[40px] font-bold leading-none text-chalk">{fmtINR(amount)}</span>
                <span className="font-display text-[16px] text-dim line-through">{fmtINR(Math.round(amount / 0.6))}</span>
              </div>
              <div className="mt-1 font-code text-[10.5px] tracking-[0.1em] text-dim">LIFETIME ACCESS · ALL LIVE CLASSES · GST INCLUDED</div>
            </div>

            <div className="mt-5 flex rounded-lg border border-line bg-panel2 p-1">
              {(["upi", "card"] as const).map((mth) => (
                <button key={mth} onClick={() => setMethod(mth)} className={`flex-1 rounded-md px-3 py-2 font-code text-[10.5px] font-bold tracking-[0.12em] transition-all ${method === mth ? "bg-chalk text-[#231a03]" : "text-dim hover:text-ink"}`}>
                  {mth === "upi" ? "UPI" : "CARD"}
                </button>
              ))}
            </div>

            {method === "upi" ? (
              <div className="mt-4">
                <label className="label-xs mb-1.5 block">UPI ID</label>
                <input className="input" placeholder="yourname@okhdfc" defaultValue="student@okaxis" />
              </div>
            ) : (
              <div className="mt-4 grid gap-3">
                <div>
                  <label className="label-xs mb-1.5 block">card number</label>
                  <input className="input font-code" defaultValue="4111 1111 1111 1111" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-xs mb-1.5 block">expiry</label>
                    <input className="input font-code" defaultValue="12/27" />
                  </div>
                  <div>
                    <label className="label-xs mb-1.5 block">cvv</label>
                    <input className="input font-code" type="password" defaultValue="123" />
                  </div>
                </div>
              </div>
            )}

            {error && <div className="mt-4 rounded-lg border border-coral/40 bg-coral/[0.07] px-3.5 py-2.5 font-code text-[11px] text-coral">✕ {error}</div>}

            <button className="btn btn-chalk mt-5 w-full !py-3.5 !text-[13px]" onClick={start} disabled={step === "processing"}>
              {step === "processing" ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#231a03]/30 border-t-[#231a03]" />
                  PROCESSING…
                </>
              ) : (
                `PAY ${fmtINR(amount)}`
              )}
            </button>
            <p className="mt-3 text-center font-code text-[9.5px] tracking-[0.12em] text-dim">SIMULATED GATEWAY — NO REAL MONEY MOVES</p>
          </>
        ) : (
          <div className="py-6 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-mint/50 bg-mint/10 text-mint">
              <IconCheck size={30} sw={2.4} />
            </span>
            <h3 className="mt-5 font-display text-[26px] font-bold italic text-ink">Payment successful</h3>
            <p className="mt-2 font-code text-[11px] tracking-[0.1em] text-dim">ORDER {orderId.toUpperCase()}</p>
            <p className="mx-auto mt-3 max-w-xs text-[13px] leading-relaxed text-mute">
              Every module is now unlocked permanently. Your receipt is in Billing & Access.
            </p>
            <button className="btn btn-mint mt-6 w-full !py-3" onClick={onClose}>START LEARNING</button>
          </div>
        )}
      </div>
    </div>
  );
}
PaymentModal.studentId = "";

/* ---------------- app ---------------- */

interface StudentAppProps {
  session: Extract<Session, { role: "student" }>;
  onLogout: () => void;
}

export default function StudentApp({ session, onLogout }: StudentAppProps) {
  const [view, setView] = useState<View>("home");
  const [home, setHome] = useState<StudentHome | null>(null);
  const [moduleId, setModuleId] = useState<string | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const now = useNow(1000);

  const refresh = useCallback(() => {
    api.getStudentHome(session.id).then(setHome).catch(() => toast("Could not load your course", "err"));
  }, [session.id]);

  useEffect(refresh, [refresh]);

  const nav = (v: View) => {
    setView(v);
    if (v !== "module") setModuleId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openModule = (id: string) => {
    setModuleId(id);
    setView("module");
    window.scrollTo({ top: 0 });
  };

  const status = home ? effectiveStatus(home.student, now) : null;
  const trial = home ? trialRemaining(home.student, now) : null;
  const currentAccess = home?.modules.find((m) => m.module._id === moduleId) ?? null;
  const nextOpen = home?.modules.find((m) => m.state === "open") ?? null;
  const price = home ? home.course.pricing.discountPrice ?? home.course.pricing.amount : 0;

  const onPaid = async (orderId: string) => {
    const { student } = await api.completePayment(session.id, orderId);
    PaymentModal.studentId = "";
    void student;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      confetti({ particleCount: 130, spread: 78, origin: { y: 0.62 }, colors: ["#f6c945", "#6fe3b4", "#8fc7ff", "#eaf0e5"] });
    }
    toast("Payment verified — lifetime access unlocked");
    refresh();
  };

  return (
    <div className="flex min-h-screen">
      {/* ---------- sidebar (always visible) ---------- */}
      <aside className="sticky top-0 z-30 flex h-screen w-[74px] shrink-0 flex-col border-r border-line bg-abyss/70 lg:w-[252px]">
        <div className="flex items-center justify-center gap-2.5 px-3 pb-5 pt-6 lg:justify-start lg:px-6">
          <span className="text-chalk"><LogoSigma size={24} sw={2.1} /></span>
          <div className="hidden lg:block">
            <div className="font-display text-[16px] font-bold italic tracking-tight text-ink">Edu<span className="text-chalk">Launch</span></div>
            <div className="label-xs mt-0.5 text-[9px]!">student console</div>
          </div>
        </div>

        <nav className="flex flex-col gap-1 px-2.5 lg:px-3">
          {NAV.map(({ v, label, Icon }) => {
            const active = view === v || (view === "module" && v === "home");
            return (
              <button
                key={v}
                onClick={() => nav(v)}
                title={label}
                className={`group relative flex items-center justify-center gap-3 rounded-lg px-2 py-2.5 font-code text-[12px] font-semibold tracking-[0.06em] transition-all duration-200 lg:justify-start lg:px-3.5 ${active ? "bg-raise text-chalk" : "text-mute hover:bg-panel hover:text-ink"}`}
              >
                <span className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-chalk transition-opacity ${active ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`} />
                <Icon size={17} sw={active ? 2 : 1.7} className="shrink-0" />
                <span className="hidden lg:inline">{label.toUpperCase()}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto px-2.5 pb-4 lg:px-4 lg:pb-5">
          {status === "trial" && trial && (
            <div className="mb-3 hidden rounded-lg border border-chalk/35 bg-chalk/[0.06] p-3 lg:block">
              <div className="flex items-center justify-between">
                <span className="font-code text-[10px] font-bold tracking-[0.14em] text-chalk">TRIAL ENDS IN</span>
                <IconClock size={13} className="text-chalk" />
              </div>
              <div className="mt-1.5 font-code text-[17px] font-bold leading-none text-ink">{fmtCountdown(trial)}</div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line/70">
                <div className={`h-full rounded-full ${trial.pct < 25 ? "bg-coral" : "bg-gradient-to-r from-chalk to-mint"}`} style={{ width: `${trial.pct}%`, transition: "width 1s linear" }} />
              </div>
              <button className="btn btn-chalk mt-2.5 w-full !py-1.5 !text-[10.5px]" onClick={() => nav("billing")}>KEEP ACCESS</button>
            </div>
          )}
          {status === "expired" && (
            <div className="mb-3 hidden rounded-lg border border-coral/35 bg-coral/[0.06] p-3 lg:block">
              <div className="font-code text-[10px] font-bold tracking-[0.14em] text-coral">TRIAL EXPIRED</div>
              <button className="btn btn-coral mt-2 w-full !py-1.5 !text-[10.5px]" onClick={() => nav("billing")}>UNLOCK NOW</button>
            </div>
          )}
          <div className="panel hidden items-center gap-3 p-3 lg:flex">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-chalk/15 font-code text-[12px] font-bold text-chalk">{initials(session.name)}</div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold text-ink">{session.name}</div>
              <div className="truncate font-code text-[9.5px] tracking-[0.08em] text-dim">{home?.course.title.toUpperCase() ?? "…"}</div>
            </div>
            <button onClick={onLogout} title="Sign out" className="rounded-md p-1.5 text-dim transition-colors hover:bg-coral/10 hover:text-coral"><IconLogout size={16} /></button>
          </div>
          <div className="flex flex-col items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-chalk/15 font-code text-[11px] font-bold text-chalk" title={session.name}>{initials(session.name)}</div>
            <button onClick={onLogout} title="Sign out" className="rounded-md p-1.5 text-dim transition-colors hover:bg-coral/10 hover:text-coral"><IconLogout size={16} /></button>
          </div>
        </div>
      </aside>

      {/* ---------- content ---------- */}
      <main className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 lg:py-10">
          {!home ? (
            <div>
              <div className="skel h-4 w-44" />
              <div className="skel mt-4 h-10 w-80" />
              <div className="skel mt-7 h-44" />
              <div className="mt-6 flex flex-col gap-3">
                <div className="skel h-24" /><div className="skel h-24" /><div className="skel h-24" />
              </div>
            </div>
          ) : view === "module" && currentAccess ? (
            <ModuleViewer
              key={currentAccess.module._id}
              access={currentAccess}
              quizScore={home.student.progress.quizScores[currentAccess.module._id]}
              onBack={() => nav("home")}
              onQuiz={async (score) => {
                await api.submitQuiz(session.id, currentAccess.module._id, score);
                await refresh();
              }}
              onComplete={async () => {
                await api.markModuleDone(session.id, currentAccess.module._id);
                await refresh();
              }}
              onGoBilling={() => nav("billing")}
              goNext={(() => {
                const idx = home.modules.findIndex((m) => m.module._id === currentAccess.module._id);
                const nxt = home.modules[idx + 1];
                return nxt ? () => openModule(nxt.module._id) : null;
              })()}
            />
          ) : view === "live" ? (
            <LiveSchedule role="student" courseId={home.course._id} courseName={() => home.course.title} />
          ) : view === "billing" ? (
            <Billing home={home} now={now} onPay={() => { PaymentModal.studentId = session.id; setPayOpen(true); }} />
          ) : (
            <Home home={home} now={now} onOpenModule={openModule} onBilling={() => nav("billing")} />
          )}
        </div>
      </main>

      {payOpen && <PaymentModal amount={price} onPaid={onPaid} onClose={() => { setPayOpen(false); refresh(); }} />}
    </div>
  );
}

/* ---------------- home ---------------- */

function Home({ home, now, onOpenModule, onBilling }: { home: StudentHome; now: number; onOpenModule: (id: string) => void; onBilling: () => void }) {
  const nextOpen = home.modules.find((m) => m.state === "open") ?? null;
  const status = effectiveStatus(home.student, now);
  const trial = trialRemaining(home.student, now);
  const scores = Object.values(home.student.progress.quizScores);
  const avgQuiz = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  const minsLeft = home.modules.filter((m) => m.state !== "done").reduce((a, m) => a + m.module.estimatedMinutes, 0);

  return (
    <div>
      <div className="label-xs">// {home.course.category} · {home.course.level}</div>
      <h1 className="mt-2 max-w-3xl font-display text-[32px] font-bold italic leading-tight tracking-tight text-ink sm:text-[40px]">
        {home.course.title}
      </h1>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {status === "trial" && <span className="chip chip-chalk"><IconClock size={11} /> TRIAL · {fmtCountdown(trial)} LEFT</span>}
        {status === "active" && <span className="chip chip-mint"><IconCheckCircle size={11} /> LIFETIME ACCESS</span>}
        {status === "expired" && <span className="chip chip-coral"><IconLock size={11} /> TRIAL EXPIRED</span>}
        {status === "blocked" && <span className="chip chip-coral"><IconLock size={11} /> ACCESS BLOCKED</span>}
        <span className="chip">INSTRUCTOR · {home.instructor.name.toUpperCase()}</span>
      </div>

      {/* status banner */}
      {status === "expired" && (
        <Reveal>
          <div className="mt-6 flex flex-wrap items-center gap-4 rounded-xl border border-coral/40 bg-coral/[0.06] px-5 py-4">
            <span className="text-coral"><IconLock size={24} /></span>
            <div className="min-w-0 flex-1">
              <div className="font-code text-[12px] font-bold tracking-[0.14em] text-coral">YOUR 48-HOUR TRIAL HAS ENDED</div>
              <p className="mt-0.5 text-[12.5px] text-mute">Content is locked. Pay once — keep it forever, including live classes.</p>
            </div>
            <button className="btn btn-chalk" onClick={onBilling}>PAY {fmtINR(home.course.pricing.discountPrice ?? home.course.pricing.amount)} TO UNLOCK</button>
          </div>
        </Reveal>
      )}
      {status === "blocked" && (
        <Reveal>
          <div className="mt-6 rounded-xl border border-coral/40 bg-coral/[0.06] px-5 py-4">
            <div className="font-code text-[12px] font-bold tracking-[0.14em] text-coral">ACCESS BLOCKED BY ADMINISTRATION</div>
            <p className="mt-0.5 text-[12.5px] text-mute">Contact support to resolve a payment issue and restore access.</p>
          </div>
        </Reveal>
      )}

      {/* stats */}
      <div className="mt-7 grid gap-4 lg:grid-cols-[1fr_320px]">
        <Reveal>
          <div className="panel flex flex-col items-center gap-7 p-6 sm:flex-row sm:p-7">
            <Ring value={home.progressPct} size={146} stroke={11} color="var(--color-mint)">
              <span className="font-display text-[34px] font-bold italic leading-none text-ink">{home.progressPct}%</span>
              <span className="label-xs mt-1.5">complete</span>
            </Ring>
            <div className="grid flex-1 grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3">
              <div>
                <div className="font-code text-[28px] font-bold leading-none text-ink">
                  {home.modules.filter((m) => m.state === "done").length}<span className="text-[16px] text-dim">/{home.modules.length}</span>
                </div>
                <div className="label-xs mt-2">modules done</div>
              </div>
              <div>
                <div className="font-code text-[28px] font-bold leading-none text-sky">{avgQuiz == null ? "—" : `${avgQuiz}%`}</div>
                <div className="label-xs mt-2">avg quiz score</div>
              </div>
              <div>
                <div className="font-code text-[28px] font-bold leading-none text-chalk">{Math.ceil(minsLeft / 60)}h</div>
                <div className="label-xs mt-2">content left</div>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <div className="h-2 overflow-hidden rounded-full bg-line/70">
                  <div className="h-full rounded-full bg-gradient-to-r from-chalk to-mint transition-[width] duration-1000 ease-out" style={{ width: `${home.progressPct}%` }} />
                </div>
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal delay={110}>
          <div className="panel flex h-full flex-col justify-between p-6">
            {nextOpen ? (
              <>
                <div>
                  <div className="label-xs">// continue where you left off</div>
                  <div className="mt-3 font-code text-[12px] font-bold tracking-[0.1em] text-chalk">MODULE {String(nextOpen.module.order).padStart(2, "0")}</div>
                  <p className="mt-1.5 text-[15px] font-bold leading-snug text-ink">{nextOpen.module.title}</p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-mute">{nextOpen.module.description}</p>
                </div>
                <button className="btn btn-chalk mt-5 w-full" onClick={() => onOpenModule(nextOpen.module._id)}>
                  <IconPlay size={15} /> RESUME LESSON
                </button>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <span className="text-mint"><IconCheckCircle size={34} /></span>
                <div className="mt-3 font-code text-[12.5px] font-bold tracking-[0.16em] text-mint">COURSE COMPLETE</div>
                <p className="mt-2 text-[12.5px] leading-relaxed text-mute">Every module cleared. See you in the next live class.</p>
              </div>
            )}
          </div>
        </Reveal>
      </div>

      {/* module list */}
      <h2 className="mt-10 font-display text-[15px] font-bold tracking-[0.22em] text-ink"><span className="text-chalk">▸</span> COURSE MODULES</h2>
      <div className="mt-5 flex flex-col gap-3">
        {home.modules.map((acc, i) => {
          const m = acc.module;
          const clickable = acc.state === "done" || acc.state === "open";
          return (
            <Reveal key={m._id} delay={Math.min(i * 55, 330)}>
              <button
                disabled={!clickable}
                onClick={() => onOpenModule(m._id)}
                className={`panel group flex w-full items-center gap-4 p-4 text-left transition-all duration-200 sm:p-5 ${
                  clickable ? "panel-hover" : "cursor-not-allowed opacity-70"
                } ${acc.state === "open" ? "border-chalk/45" : ""}`}
              >
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border font-display text-[17px] font-bold italic ${
                  acc.state === "done" ? "border-mint/50 bg-mint/10 text-mint"
                    : acc.state === "open" ? "border-chalk/50 bg-chalk/10 text-chalk"
                      : "border-line bg-panel2 text-dim"
                }`}>
                  {acc.state === "done" ? <IconCheck size={18} /> : acc.state === "locked" || acc.state === "paywall" || acc.state === "restricted" ? <IconLock size={15} /> : String(m.order).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className={`text-[15px] font-bold ${clickable ? "text-ink group-hover:text-chalk2" : "text-mute"} transition-colors`}>{m.title}</span>
                    {acc.state === "done" && <span className="chip chip-mint">completed</span>}
                    {acc.state === "open" && <span className="chip chip-chalk">up next</span>}
                    {acc.state === "restricted" && <span className="chip chip-sky">restricted</span>}
                    {acc.state === "paywall" && <span className="chip chip-coral">locked · pay to unlock</span>}
                  </span>
                  <span className="mt-0.5 block truncate text-[12px] text-dim">{m.description}</span>
                </span>
                <span className="hidden shrink-0 items-center gap-3 sm:flex">
                  {home.student.progress.quizScores[m._id] != null && <span className="chip chip-sky">QUIZ {home.student.progress.quizScores[m._id]}%</span>}
                  <span className="font-code text-[10.5px] tracking-[0.1em] text-dim">{m.estimatedMinutes} MIN</span>
                </span>
              </button>
            </Reveal>
          );
        })}
      </div>

      <p className="mt-6 text-[12px] leading-relaxed text-dim">
        Enrolled {fmtDateLong(home.student.enrollmentDate)} · last active {timeAgo(home.student.lastActive)} · quizzes keep your best score.
      </p>
    </div>
  );
}

/* ---------------- billing ---------------- */

function Billing({ home, now, onPay }: { home: StudentHome; now: number; onPay: () => void }) {
  const status = effectiveStatus(home.student, now);
  const trial = trialRemaining(home.student, now);
  const p = home.course.pricing;
  const price = p.discountPrice ?? p.amount;
  const receipt = home.payments.find((x) => x.status === "completed");

  return (
    <div>
      <div className="label-xs">// billing & access</div>
      <h1 className="mt-2 text-[32px] font-extrabold leading-tight tracking-tight text-ink">
        One payment, <span className="text-chalk">kept for good.</span>
      </h1>

      <div className="mt-7 grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-4">
          {/* access status */}
          <Reveal>
            <div className={`panel p-6 ${status === "active" ? "border-mint/40" : status === "trial" ? "border-chalk/40" : "border-coral/40"}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {status === "active" ? <span className="text-mint"><IconCheckCircle size={26} /></span> : status === "trial" ? <span className="text-chalk"><IconClock size={26} /></span> : <span className="text-coral"><IconLock size={26} /></span>}
                  <div>
                    <div className="font-code text-[13px] font-bold tracking-[0.12em] text-ink">
                      {status === "active" ? "LIFETIME ACCESS ACTIVE" : status === "trial" ? "FREE TRIAL RUNNING" : status === "expired" ? "TRIAL EXPIRED" : "ACCESS BLOCKED"}
                    </div>
                    <div className="mt-0.5 text-[12px] text-dim">
                      {status === "active" ? "All published modules unlocked, live classes included." : status === "trial" ? "Everything is unlocked until the clock hits zero." : "Content is locked until the course fee is paid."}
                    </div>
                  </div>
                </div>
                {status === "trial" && (
                  <div className="text-right">
                    <div className="font-code text-[26px] font-bold leading-none text-chalk">{fmtCountdown(trial)}</div>
                    <div className="label-xs mt-1">remaining</div>
                  </div>
                )}
              </div>
              {status === "trial" && (
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-line/70">
                  <div className={`h-full rounded-full ${trial.pct < 25 ? "bg-coral" : "bg-gradient-to-r from-chalk to-mint"}`} style={{ width: `${trial.pct}%`, transition: "width 1s linear" }} />
                </div>
              )}
              {status !== "active" && (
                <button className="btn btn-chalk mt-5 w-full !py-3 sm:w-auto sm:px-8" onClick={onPay}>
                  <IconCard size={15} /> PAY {fmtINR(price)} · UNLOCK FOREVER
                </button>
              )}
            </div>
          </Reveal>

          {/* receipt / history */}
          <Reveal delay={90}>
            <div className="panel p-6">
              <h2 className="font-display text-[14px] font-bold tracking-[0.2em] text-ink"><span className="text-chalk">▸</span> PAYMENT HISTORY</h2>
              {home.payments.length === 0 ? (
                <p className="mt-4 rounded-lg border border-dashed border-line px-4 py-6 text-center text-[12.5px] text-dim">No payments yet — your trial is still carrying you.</p>
              ) : (
                <div className="mt-4 flex flex-col gap-2.5">
                  {home.payments.map((pay) => (
                    <div key={pay._id} className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-panel2/60 px-4 py-3">
                      <span className="text-chalk"><IconReceipt size={17} /></span>
                      <div className="min-w-0 flex-1">
                        <div className="font-code text-[12px] font-bold text-ink">{fmtINR(pay.amount)} · {pay.method.toUpperCase()} · {pay.gateway}</div>
                        <div className="mt-0.5 truncate font-code text-[10px] tracking-[0.06em] text-dim">
                          {pay.orderId.toUpperCase()}{pay.paymentId ? ` → ${pay.paymentId.toUpperCase()}` : ""}
                        </div>
                      </div>
                      <span className={`chip ${pay.status === "completed" ? "chip-mint" : pay.status === "failed" ? "chip-coral" : ""}`}>{pay.status}</span>
                      <span className="font-code text-[10.5px] text-dim">{fmtDateLong(pay.createdAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Reveal>
        </div>

        {/* plan */}
        <Reveal delay={140}>
          <div className="panel h-fit p-6 lg:sticky lg:top-8">
            <div className="label-xs">// your plan</div>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="font-display text-[44px] font-bold leading-none text-chalk">{fmtINR(price)}</span>
              {p.discountPrice && <span className="font-display text-[19px] text-dim line-through">{fmtINR(p.amount)}</span>}
            </div>
            <div className="mt-1 font-code text-[10px] tracking-[0.12em] text-dim">ONE-TIME · {home.course.title.toUpperCase()}</div>
            <ul className="mt-5 grid gap-2.5 border-t border-line pt-5">
              {[
                `${home.modules.length} compiled modules, lifetime access`,
                "Every quiz with explanations & retakes",
                "All live classes + recordings",
                "Future re-typesets of every lesson",
              ].map((x) => (
                <li key={x} className="flex items-start gap-2.5 text-[13px] text-mute">
                  <span className="mt-0.5 shrink-0 text-mint"><IconCheck size={14} /></span>{x}
                </li>
              ))}
            </ul>
            {receipt && (
              <div className="mt-5 rounded-lg border border-mint/35 bg-mint/[0.06] px-3.5 py-3">
                <div className="font-code text-[10px] font-bold tracking-[0.14em] text-mint">RECEIPT</div>
                <div className="mt-1 font-code text-[11px] text-mute">{receipt.paymentId.toUpperCase()}</div>
                <div className="font-code text-[10px] text-dim">{fmtDateLong(receipt.createdAt)} · {fmtINR(receipt.amount)}</div>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
