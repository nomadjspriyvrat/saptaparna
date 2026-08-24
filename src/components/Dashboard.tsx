import type { ModuleDoc, ProgressRow, Session } from "../types";
import { avg, rowDone } from "../util";
import Reveal from "./Reveal";
import Ring from "./Ring";
import {
  IconArrowRight,
  IconBolt,
  IconCheck,
  IconLock,
} from "./icons";

type NodeStatus = "done" | "active" | "open" | "locked";

const stepsOf = (r: ProgressRow | undefined) => [
  { k: "L", label: "Lesson", done: !!r?.lessonDone },
  { k: "Q", label: "Quiz", done: r?.quizScore != null },
  { k: "T", label: "Task", done: !!r?.taskSubmitted },
  { k: "P", label: "Project", done: !!r?.projectSubmitted },
];

interface DashboardProps {
  session: Session;
  modules: ModuleDoc[];
  progress: ProgressRow[];
  onOpenModule: (id: string) => void;
}

export default function Dashboard({ session, modules, progress, onOpenModule }: DashboardProps) {
  const rows = new Map(progress.map((p) => [p.module, p]));

  let activeClaimed = false;
  const nodes = modules.map((m, i) => {
    const row = rows.get(m._id);
    const done = rowDone(row);
    const unlocked = i === 0 || rowDone(rows.get(modules[i - 1]._id));
    let status: NodeStatus = done ? "done" : unlocked ? "open" : "locked";
    if (status === "open" && !activeClaimed) {
      status = "active";
      activeClaimed = true;
    }
    return { m, row, done, unlocked, status };
  });

  const total = modules.length;
  const doneCount = nodes.filter((n) => n.done).length;
  const percent = total ? Math.round((doneCount / total) * 100) : 0;
  const scores = nodes.map((n) => n.row?.quizScore).filter((s): s is number => s != null);
  const avgQuiz = avg(scores);
  const stepsDone = nodes.reduce((acc, n) => acc + stepsOf(n.row).filter((s) => s.done).length, 0);

  const next = nodes.find((n) => n.status === "active" || n.status === "open");
  const nextStep = next ? stepsOf(next.row).find((s) => !s.done) : undefined;
  const firstName = session.name.trim().split(/\s+/)[0];

  return (
    <div>
      {/* ---------- header ---------- */}
      <div className="label-xs">// student dashboard</div>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-[32px] font-extrabold leading-tight tracking-tight text-ink sm:text-[40px]">
          Welcome back, <span className="text-amber">{firstName}.</span>
        </h1>
        <div className="flex items-center gap-2 pb-1.5">
          <span className="chip chip-amber">{session.subject?.name}</span>
          <span className="chip">{total} modules</span>
        </div>
      </div>

      {/* ---------- stats ---------- */}
      <div className="mt-7 grid gap-4 lg:grid-cols-[1fr_340px]">
        <Reveal>
          <div className="panel flex flex-col items-center gap-7 p-6 sm:flex-row sm:p-7">
            <Ring value={percent} size={148} stroke={11}>
              <span className="font-display text-[34px] font-extrabold leading-none text-ink">{percent}%</span>
              <span className="label-xs mt-1.5">complete</span>
            </Ring>
            <div className="grid flex-1 grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3">
              <div>
                <div className="font-display text-[30px] font-extrabold leading-none text-ink">
                  {doneCount}
                  <span className="text-[17px] text-dim">/{total}</span>
                </div>
                <div className="label-xs mt-2">modules done</div>
              </div>
              <div>
                <div className="font-display text-[30px] font-extrabold leading-none text-sky">
                  {avgQuiz == null ? "—" : `${avgQuiz}%`}
                </div>
                <div className="label-xs mt-2">avg quiz score</div>
              </div>
              <div>
                <div className="font-display text-[30px] font-extrabold leading-none text-mint">
                  {stepsDone}
                  <span className="text-[17px] text-dim">/{total * 4}</span>
                </div>
                <div className="label-xs mt-2">steps cleared</div>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <div className="h-2 overflow-hidden rounded-full bg-line/70">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber to-mint transition-[width] duration-1000 ease-out"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={110}>
          <div className="panel flex h-full flex-col justify-between p-6">
            {next ? (
              <>
                <div>
                  <div className="label-xs">// next up</div>
                  <div className="mt-3 font-display text-[13px] font-bold tracking-[0.08em] text-amber">
                    MODULE {String(next.m.order).padStart(2, "0")} · {nextStep?.label.toUpperCase()}
                  </div>
                  <p className="mt-2 text-[14px] font-semibold leading-snug text-ink">{next.m.title}</p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-mute">
                    {nextStep?.label === "Lesson"
                      ? "Read the lesson, then mark it complete."
                      : nextStep?.label === "Quiz"
                        ? "Answer the questions — instant grading and explanations."
                        : nextStep?.label === "Task"
                          ? "A short exercise. Drafts save automatically."
                          : "The module-capping build. Paste code or a link."}
                  </p>
                </div>
                <button className="btn btn-amber mt-5 w-full" onClick={() => onOpenModule(next.m._id)}>
                  RESUME <IconArrowRight size={14} sw={2.4} />
                </button>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <span className="text-mint">
                  <IconBolt size={34} sw={1.5} />
                </span>
                <div className="mt-3 font-display text-[14px] font-bold tracking-[0.14em] text-mint">TRACK COMPLETE</div>
                <p className="mt-2 text-[12.5px] leading-relaxed text-mute">
                  All {total} modules cleared. See you in the next live class.
                </p>
              </div>
            )}
          </div>
        </Reveal>
      </div>

      {/* ---------- the track ---------- */}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-[15px] font-bold tracking-[0.22em] text-ink">
          <span className="text-amber">▸</span> THE TRACK
        </h2>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-display text-[10px] tracking-[0.14em] text-dim">
            <span className="h-2 w-2 rounded-full bg-mint" /> DONE
          </span>
          <span className="flex items-center gap-1.5 font-display text-[10px] tracking-[0.14em] text-dim">
            <span className="h-2 w-2 rounded-full bg-amber" /> CURRENT
          </span>
          <span className="flex items-center gap-1.5 font-display text-[10px] tracking-[0.14em] text-dim">
            <span className="h-2 w-2 rounded-full bg-line2" /> LOCKED
          </span>
        </div>
      </div>

      <div className="relative mt-6">
        <div className="absolute bottom-6 left-[19px] top-6 w-px bg-line" />
        <div className="flex flex-col gap-4">
          {nodes.map((n, i) => {
            const steps = stepsOf(n.row);
            const stepsCleared = steps.filter((s) => s.done).length;
            return (
              <Reveal key={n.m._id} delay={Math.min(i * 70, 350)}>
                <div className="relative flex gap-4 sm:gap-5">
                  {/* node */}
                  <div
                    className={`node-pop relative z-10 mt-5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 font-display text-[13px] font-bold ${
                      n.status === "done"
                        ? "border-mint bg-mint text-[#04231a]"
                        : n.status === "active"
                          ? "border-amber bg-amber/10 text-amber"
                          : n.status === "open"
                            ? "border-line2 bg-panel text-mute"
                            : "border-line bg-panel2 text-dim"
                    }`}
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    {n.status === "done" ? <IconCheck size={17} /> : n.status === "locked" ? <IconLock size={15} /> : n.m.order}
                    {n.status === "active" && <span className="pulse-dot absolute -right-0.5 -top-0.5" />}
                  </div>

                  {/* card */}
                  {n.unlocked ? (
                    <button
                      onClick={() => onOpenModule(n.m._id)}
                      className={`panel panel-hover group min-w-0 flex-1 p-5 text-left ${
                        n.status === "active" ? "border-amber/45 shadow-[0_0_34px_-14px_rgba(255,178,36,0.4)]" : ""
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="chip">{`MODULE ${String(n.m.order).padStart(2, "0")}`}</span>
                        {n.status === "done" && <span className="chip chip-mint">complete</span>}
                        {n.status === "active" && <span className="chip chip-amber">in progress</span>}
                        {n.status === "open" && <span className="chip chip-sky">unlocked</span>}
                        <span className="ml-auto font-display text-[11px] font-bold tracking-[0.1em] text-dim">
                          {stepsCleared}/4 STEPS
                        </span>
                      </div>
                      <div className="mt-2.5 flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="text-[17px] font-bold leading-snug text-ink transition-colors group-hover:text-amber2">
                            {n.m.title}
                          </h3>
                          <p className="mt-1 text-[13px] leading-relaxed text-mute">{n.m.desc}</p>
                        </div>
                        <span className="mt-1 hidden shrink-0 text-dim transition-all duration-200 group-hover:translate-x-1 group-hover:text-amber sm:block">
                          <IconArrowRight size={18} />
                        </span>
                      </div>
                      <div className="mt-4 grid max-w-[280px] grid-cols-4 gap-2">
                        {steps.map((s) => (
                          <div key={s.k} className="flex flex-col items-center gap-1">
                            <span className={`step-pill ${s.done ? "on" : ""}`}>{s.done ? "✓" : s.k}</span>
                            <span className="font-display text-[8.5px] font-semibold tracking-[0.12em] text-dim">
                              {s.label.toUpperCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </button>
                  ) : (
                    <div className="panel min-w-0 flex-1 border-dashed p-5 opacity-70">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="chip">{`MODULE ${String(n.m.order).padStart(2, "0")}`}</span>
                        <span className="chip">locked</span>
                      </div>
                      <h3 className="mt-2.5 text-[17px] font-bold leading-snug text-mute">{n.m.title}</h3>
                      <p className="mt-1 text-[13px] leading-relaxed text-dim">{n.m.desc}</p>
                      <p className="mt-3 flex items-center gap-2 font-display text-[10.5px] font-semibold tracking-[0.14em] text-dim">
                        <IconLock size={13} /> UNLOCKS WHEN MODULE {String(n.m.order - 1).padStart(2, "0")} IS COMPLETE
                      </p>
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>

      <Reveal>
        <div className="mt-8 flex items-start gap-3 rounded-lg border border-line bg-panel2/70 px-4 py-3.5">
          <span className="mt-0.5 shrink-0 text-amber">
            <IconBolt size={16} />
          </span>
          <p className="text-[12.5px] leading-relaxed text-mute">
            <span className="font-semibold text-ink">How unlocking works:</span> a module opens only when every step of
            the one before it — lesson, quiz, task and project — is complete. Quiz scores can be improved by retaking.
          </p>
        </div>
      </Reveal>
    </div>
  );
}
