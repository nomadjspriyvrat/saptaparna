import type { ModuleDoc, ProgressRow } from "../types";
import { avg, rowDone } from "../util";
import Reveal from "./Reveal";
import { IconCheck, IconLock } from "./icons";

const stepsOf = (r: ProgressRow | undefined) => [
  { k: "lesson", label: "Lesson", done: !!r?.lessonDone },
  { k: "quiz", label: "Quiz", done: r?.quizScore != null },
  { k: "task", label: "Task", done: !!r?.taskSubmitted },
  { k: "project", label: "Project", done: !!r?.projectSubmitted },
];

interface ProgressViewProps {
  modules: ModuleDoc[];
  progress: ProgressRow[];
}

export default function ProgressView({ modules, progress }: ProgressViewProps) {
  const rows = new Map(progress.map((p) => [p.module, p]));
  const total = modules.length;
  const doneCount = modules.filter((m) => rowDone(rows.get(m._id))).length;
  const percent = total ? Math.round((doneCount / total) * 100) : 0;
  const scores = modules.map((m) => rows.get(m._id)?.quizScore).filter((s): s is number => s != null);
  const avgQuiz = avg(scores);
  const stepsDone = modules.reduce((acc, m) => acc + stepsOf(rows.get(m._id)).filter((s) => s.done).length, 0);

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

      {/* per-module rows */}
      <div className="mt-8 flex flex-col gap-3">
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
