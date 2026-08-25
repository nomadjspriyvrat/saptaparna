import { useMemo } from "react";
import type { ModuleDoc, ProgressRow } from "../types";
import { avg, computeBadges, rowDone, streakOf } from "../util";
import Reveal from "./Reveal";
import { IconCheck, IconLock, IconMedal } from "./icons";

const stepsOf = (r: ProgressRow | undefined) => [
  { k: "lesson", label: "Lesson", done: !!r?.lessonDone },
  { k: "quiz", label: "Quiz", done: r?.quizScore != null },
  { k: "task", label: "Task", done: !!r?.taskSubmitted },
  { k: "project", label: "Project", done: !!r?.projectSubmitted },
];

const cellCls = (count: number) =>
  count === 0
    ? "border border-line/70 bg-panel2"
    : count === 1
      ? "bg-mint/25"
      : count === 2
        ? "bg-mint/55"
        : "bg-mint shadow-[0_0_8px_-1px_rgba(47,230,168,0.5)]";

interface ProgressViewProps {
  modules: ModuleDoc[];
  progress: ProgressRow[];
  activity: Record<string, number>;
  onCertificate: () => void;
}

export default function ProgressView({ modules, progress, activity, onCertificate }: ProgressViewProps) {
  const rows = new Map(progress.map((p) => [p.module, p]));
  const total = modules.length;
  const doneCount = modules.filter((m) => rowDone(rows.get(m._id))).length;
  const percent = total ? Math.round((doneCount / total) * 100) : 0;
  const scores = modules.map((m) => rows.get(m._id)?.quizScore).filter((s): s is number => s != null);
  const avgQuiz = avg(scores);
  const stepsDone = modules.reduce((acc, m) => acc + stepsOf(rows.get(m._id)).filter((s) => s.done).length, 0);
  const streak = streakOf(activity);

  const badges = useMemo(
    () => computeBadges(modules.map((m) => rows.get(m._id)), streak),
    [modules, rows, streak]
  );
  const earnedCount = badges.filter((b) => b.earned).length;

  /* activity heatmap — trailing ~12 weeks, week columns starting Sunday */
  const cells = useMemo(() => {
    const out: Array<{ iso: string; count: number }> = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() - 83);
    start.setDate(start.getDate() - start.getDay());
    for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
      const iso = d.toISOString().slice(0, 10);
      out.push({ iso, count: activity[iso] ?? 0 });
    }
    return out;
  }, [activity]);
  const activeDays = cells.filter((c) => c.count > 0).length;

  return (
    <div>
      <div className="label-xs">// my progress</div>
      <h1 className="mt-2 text-[32px] font-extrabold leading-tight tracking-tight text-ink">
        The numbers behind <span className="text-amber">the grind.</span>
      </h1>

      {/* stat strip */}
      <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { n: `${percent}%`, l: "track complete", c: "text-mint" },
          { n: `${doneCount}/${total}`, l: "modules done", c: "text-ink" },
          { n: avgQuiz == null ? "—" : `${avgQuiz}%`, l: "avg quiz score", c: "text-sky" },
          { n: `${stepsDone}/${total * 4}`, l: "steps cleared", c: "text-amber" },
        ].map((s, i) => (
          <Reveal key={s.l} delay={i * 70}>
            <div className="panel p-5">
              <div className={`font-display text-[28px] font-extrabold leading-none ${s.c}`}>{s.n}</div>
              <div className="label-xs mt-2.5">{s.l}</div>
              {i === 0 && (
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line/70">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber to-mint transition-[width] duration-1000"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              )}
            </div>
          </Reveal>
        ))}
      </div>

      {/* certificate banner */}
      {percent === 100 && (
        <Reveal>
          <div className="mt-6 flex flex-wrap items-center gap-4 rounded-xl border border-mint/40 bg-mint/[0.06] px-5 py-4">
            <span className="text-mint">
              <IconMedal size={26} sw={1.5} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-display text-[12.5px] font-bold tracking-[0.14em] text-mint">
                TRACK COMPLETE — CERTIFICATE READY
              </div>
              <p className="mt-0.5 text-[12.5px] text-mute">Every module, every step. Make it official.</p>
            </div>
            <button className="btn btn-mint" onClick={onCertificate}>
              CLAIM CERTIFICATE
            </button>
          </div>
        </Reveal>
      )}

      {/* activity heatmap + achievements */}
      <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <Reveal>
          <div className="panel h-full p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[12.5px] font-bold tracking-[0.2em] text-ink">
                <span className="text-amber">▸</span> ACTIVITY
              </h2>
              <span className="chip">{activeDays} ACTIVE DAYS</span>
            </div>
            <p className="mt-1.5 text-[12px] text-dim">Last 12 weeks · every saved lesson, quiz, task or project lights a square.</p>
            <div className="mt-5 overflow-x-auto pb-1">
              <div className="grid w-max grid-flow-col grid-rows-7 gap-[3px]">
                {cells.map((c) => (
                  <div
                    key={c.iso}
                    title={`${c.iso} — ${c.count === 0 ? "no activity" : `${c.count} save${c.count > 1 ? "s" : ""}`}`}
                    className={`h-[12px] w-[12px] rounded-[2.5px] transition-transform duration-150 hover:scale-125 ${cellCls(c.count)}`}
                  />
                ))}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 font-display text-[9.5px] tracking-[0.12em] text-dim">
              LESS
              {[0, 1, 2, 3].map((c) => (
                <span key={c} className={`h-[10px] w-[10px] rounded-[2px] ${cellCls(c)}`} />
              ))}
              MORE
            </div>
          </div>
        </Reveal>

        <Reveal delay={110}>
          <div className="panel h-full p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[12.5px] font-bold tracking-[0.2em] text-ink">
                <span className="text-amber">▸</span> ACHIEVEMENTS
              </h2>
              <span className="chip chip-amber">{earnedCount}/{badges.length} EARNED</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {badges.map((b) => (
                <div
                  key={b.id}
                  className={`group flex flex-col items-start gap-2 rounded-lg border p-3.5 transition-all duration-200 hover:-translate-y-0.5 ${
                    b.earned ? "border-amber/35 bg-amber/[0.05]" : "border-line bg-panel2 opacity-70"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
                      b.earned ? "border-amber/40 bg-amber/10 text-amber" : "border-line bg-panel text-dim"
                    }`}
                  >
                    {b.earned ? <IconMedal size={17} /> : <IconLock size={14} />}
                  </span>
                  <div>
                    <div className={`font-display text-[10.5px] font-bold tracking-[0.08em] ${b.earned ? "text-ink" : "text-dim"}`}>
                      {b.name.toUpperCase()}
                    </div>
                    <div className="mt-1 text-[10.5px] leading-snug text-dim">{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      {/* per-module rows */}
      <div className="mt-9 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-[15px] font-bold tracking-[0.22em] text-ink">
          <span className="text-amber">▸</span> MODULE BREAKDOWN
        </h2>
        <span className="chip">{streak > 0 ? `${streak}-DAY STREAK` : "NO ACTIVE STREAK"}</span>
      </div>
      <div className="mt-5 flex flex-col gap-3">
        {modules.map((m, i) => {
          const row = rows.get(m._id);
          const done = rowDone(row);
          const unlocked = i === 0 || rowDone(rows.get(modules[i - 1]._id));
          const started = !!row && (row.lessonDone || row.quizScore != null || row.taskSubmitted || row.taskText !== "");
          const steps = stepsOf(row);
          return (
            <Reveal key={m._id} delay={Math.min(i * 60, 300)}>
              <div className={`panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center ${!unlocked ? "opacity-60" : ""}`}>
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <span
                    className={`font-display text-[22px] font-extrabold ${
                      done ? "text-mint" : unlocked ? "text-amber" : "text-dim"
                    }`}
                  >
                    {String(m.order).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-[15px] font-bold text-ink">{m.title}</span>
                      {done ? (
                        <span className="chip chip-mint">complete</span>
                      ) : !unlocked ? (
                        <span className="chip">
                          <IconLock size={10} /> locked
                        </span>
                      ) : started ? (
                        <span className="chip chip-amber">in progress</span>
                      ) : (
                        <span className="chip chip-sky">not started</span>
                      )}
                    </div>
                    <div className="mt-1 text-[12px] text-dim">{m.desc}</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  {steps.map((s) =>
                    s.k === "quiz" ? (
                      <span key={s.k} className={`chip ${row?.quizScore != null ? "chip-sky" : ""}`}>
                        QUIZ {row?.quizScore != null ? `${row.quizScore}%` : "—"}
                      </span>
                    ) : (
                      <span key={s.k} className={`chip ${s.done ? "chip-mint" : ""}`}>
                        {s.done && <IconCheck size={10} sw={3} />}
                        {s.label.toUpperCase()}
                      </span>
                    )
                  )}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
