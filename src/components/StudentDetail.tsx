import { useCallback, useEffect, useState } from "react";
import * as api from "../api";
import { toast } from "../toast";
import type { StudentDetailData } from "../types";
import { avg, fmtDateLong, initials, rowDone } from "../util";
import Reveal from "./Reveal";
import Ring from "./Ring";
import { IconArrowLeft, IconCheck, IconChevron, IconEye } from "./icons";

interface StudentDetailProps {
  studentId: string;
  onBack: () => void;
}

type OpenKey = string | null;

export default function StudentDetail({ studentId, onBack }: StudentDetailProps) {
  const [data, setData] = useState<StudentDetailData | null>(null);
  const [open, setOpen] = useState<OpenKey>(null);

  const refresh = useCallback(() => {
    api.getStudentDetail(studentId).then(setData).catch(() => toast("Could not load student", "err"));
  }, [studentId]);

  useEffect(refresh, [refresh]);

  if (data === null) {
    return (
      <div>
        <div className="skel h-9 w-40" />
        <div className="skel mt-5 h-44" />
        <div className="skel mt-4 h-32" />
        <div className="skel mt-4 h-32" />
      </div>
    );
  }

  const doneCount = data.modules.filter((m) =>
    rowDone({
      _id: "",
      student: "",
      module: m.moduleId,
      lessonDone: m.lessonDone,
      quizScore: m.quizScore,
      quizAttempts: m.quizAttempts,
      taskText: m.taskText,
      taskSubmitted: m.taskSubmitted,
      projectText: m.projectText,
      projectSubmitted: m.projectSubmitted,
    })
  ).length;
  const percent = data.modules.length ? Math.round((doneCount / data.modules.length) * 100) : 0;
  const scores = data.modules.map((m) => m.quizScore).filter((s): s is number => s != null);
  const avgQuiz = avg(scores);

  const toggle = (key: string) => setOpen((o) => (o === key ? null : key));

  return (
    <div>
      <button onClick={onBack} className="btn btn-ghost py-2! text-[11.5px]">
        <IconArrowLeft size={14} /> ALL STUDENTS
      </button>

      {/* header */}
      <Reveal>
        <div className="panel mt-5 flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-7">
          <div className="flex min-w-0 flex-1 items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-amber/12 font-display text-[20px] font-extrabold text-amber">
              {initials(data.name)}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-[26px] font-extrabold leading-tight tracking-tight text-ink">{data.name}</h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span className="chip chip-amber">{data.subject.name}</span>
                <span className="chip">JOINED {fmtDateLong(data.createdAt).toUpperCase()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-7">
            <Ring value={percent} size={104} stroke={9}>
              <span className="font-display text-[22px] font-extrabold leading-none text-ink">{percent}%</span>
            </Ring>
            <div className="grid grid-cols-2 gap-x-7 gap-y-4">
              <div>
                <div className="font-display text-[22px] font-extrabold leading-none text-ink">
                  {doneCount}
                  <span className="text-[13px] text-dim">/{data.modules.length}</span>
                </div>
                <div className="label-xs mt-1.5">modules</div>
              </div>
              <div>
                <div className="font-display text-[22px] font-extrabold leading-none text-sky">
                  {avgQuiz == null ? "—" : `${avgQuiz}%`}
                </div>
                <div className="label-xs mt-1.5">avg quiz</div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* modules */}
      <div className="mt-7 flex flex-col gap-4">
        {data.modules.map((m, i) => {
          const done = m.lessonDone && m.quizScore != null && m.taskSubmitted && m.projectSubmitted;
          const started = m.lessonDone || m.quizScore != null || m.taskSubmitted || m.taskText !== "" || m.projectText !== "";
          return (
            <Reveal key={m.moduleId} delay={Math.min(i * 60, 300)}>
              <div className={`panel p-5 sm:p-6 ${done ? "border-mint/30" : ""}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-[15px] font-extrabold text-amber">
                    {String(m.order).padStart(2, "0")}
                  </span>
                  <span className="text-[16px] font-bold text-ink">{m.title}</span>
                  {done ? (
                    <span className="chip chip-mint ml-auto">
                      <IconCheck size={10} sw={3} /> COMPLETE
                    </span>
                  ) : started ? (
                    <span className="chip chip-amber ml-auto">IN PROGRESS</span>
                  ) : (
                    <span className="chip ml-auto">NOT STARTED</span>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
                  <div className="rounded-lg border border-line bg-panel2 px-3.5 py-2.5">
                    <div className="label-xs text-[9px]!">lesson</div>
                    <div className={`mt-1 font-display text-[12px] font-bold ${m.lessonDone ? "text-mint" : "text-dim"}`}>
                      {m.lessonDone ? "✓ READ" : "PENDING"}
                    </div>
                  </div>
                  <div className="rounded-lg border border-line bg-panel2 px-3.5 py-2.5">
                    <div className="label-xs text-[9px]!">quiz</div>
                    <div className={`mt-1 font-display text-[12px] font-bold ${m.quizScore != null ? "text-sky" : "text-dim"}`}>
                      {m.quizScore != null ? `${m.quizScore}% · ${m.quizAttempts}×` : "NOT TAKEN"}
                    </div>
                  </div>
                  <div className="rounded-lg border border-line bg-panel2 px-3.5 py-2.5">
                    <div className="label-xs text-[9px]!">task</div>
                    <div className={`mt-1 font-display text-[12px] font-bold ${m.taskSubmitted ? "text-mint" : "text-dim"}`}>
                      {m.taskSubmitted ? "✓ SUBMITTED" : m.taskText ? "DRAFT ONLY" : "PENDING"}
                    </div>
                  </div>
                  <div className="rounded-lg border border-line bg-panel2 px-3.5 py-2.5">
                    <div className="label-xs text-[9px]!">project</div>
                    <div className={`mt-1 font-display text-[12px] font-bold ${m.projectSubmitted ? "text-mint" : "text-dim"}`}>
                      {m.projectSubmitted ? "✓ SUBMITTED" : m.projectText ? "DRAFT ONLY" : "PENDING"}
                    </div>
                  </div>
                </div>

                {/* submitted work */}
                {(m.taskSubmitted || m.projectSubmitted) && (
                  <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                    {m.taskSubmitted && (
                      <div>
                        <button
                          onClick={() => toggle(`${m.moduleId}-task`)}
                          className="btn btn-ghost w-full justify-between! text-[11px]"
                        >
                          <span className="flex items-center gap-2">
                            <IconEye size={13} /> VIEW TASK SUBMISSION
                          </span>
                          <IconChevron size={13} className={`transition-transform duration-200 ${open === `${m.moduleId}-task` ? "rotate-180" : ""}`} />
                        </button>
                        {open === `${m.moduleId}-task` && (
                          <pre className="mt-2 whitespace-pre-wrap rounded-lg border border-line bg-panel2 p-4 font-display text-[11.5px] leading-relaxed text-mute">
                            {m.taskText || "(empty submission)"}
                          </pre>
                        )}
                      </div>
                    )}
                    {m.projectSubmitted && (
                      <div>
                        <button
                          onClick={() => toggle(`${m.moduleId}-project`)}
                          className="btn btn-ghost w-full justify-between! text-[11px]"
                        >
                          <span className="flex items-center gap-2">
                            <IconEye size={13} /> VIEW PROJECT SUBMISSION
                          </span>
                          <IconChevron size={13} className={`transition-transform duration-200 ${open === `${m.moduleId}-project` ? "rotate-180" : ""}`} />
                        </button>
                        {open === `${m.moduleId}-project` && (
                          <pre className="mt-2 whitespace-pre-wrap rounded-lg border border-line bg-panel2 p-4 font-display text-[11.5px] leading-relaxed text-mute">
                            {m.projectText || "(empty submission)"}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
