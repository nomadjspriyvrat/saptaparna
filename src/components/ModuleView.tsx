import { useEffect, useRef, useState } from "react";
import type { ProgressPatch } from "../api";
import { toast } from "../toast";
import type { ModuleDoc, ProgressRow } from "../types";
import { IconArrowLeft, IconBook, IconCheck, IconCheckCircle, IconProject, IconQuiz, IconSave, IconTask } from "./icons";

type Tab = "lesson" | "quiz" | "task" | "project";

const TABS: Array<{ k: Tab; label: string; Icon: typeof IconBook }> = [
  { k: "lesson", label: "Lesson", Icon: IconBook },
  { k: "quiz", label: "Quiz", Icon: IconQuiz },
  { k: "task", label: "Task", Icon: IconTask },
  { k: "project", label: "Project", Icon: IconProject },
];

interface ModuleViewProps {
  module: ModuleDoc;
  row: ProgressRow | undefined;
  onBack: () => void;
  onPatch: (patch: ProgressPatch) => Promise<ProgressRow>;
}

export default function ModuleView({ module: mod, row, onBack, onPatch }: ModuleViewProps) {
  const [tab, setTab] = useState<Tab>("lesson");
  const [pr, setPr] = useState<ProgressRow | undefined>(row);

  /* quiz state */
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [quizBusy, setQuizBusy] = useState(false);

  /* lesson state */
  const [lessonBusy, setLessonBusy] = useState(false);

  /* task / project drafts */
  const [taskText, setTaskText] = useState(pr?.taskText ?? "");
  const [projectText, setProjectText] = useState(pr?.projectText ?? "");
  const [taskSavedAt, setTaskSavedAt] = useState("");
  const [projectSavedAt, setProjectSavedAt] = useState("");
  const [submitBusy, setSubmitBusy] = useState<"task" | "project" | null>(null);

  const taskTimer = useRef<number | undefined>(undefined);
  const projectTimer = useRef<number | undefined>(undefined);
  const taskMounted = useRef(false);
  const projectMounted = useRef(false);

  useEffect(() => setPr(row), [row]);

  /* auto-save drafts (debounced) */
  useEffect(() => {
    if (!taskMounted.current) {
      taskMounted.current = true;
      return;
    }
    window.clearTimeout(taskTimer.current);
    taskTimer.current = window.setTimeout(async () => {
      try {
        const updated = await onPatch({ taskText });
        setPr(updated);
        setTaskSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      } catch {
        toast("Could not save draft", "err");
      }
    }, 750);
    return () => window.clearTimeout(taskTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskText]);

  useEffect(() => {
    if (!projectMounted.current) {
      projectMounted.current = true;
      return;
    }
    window.clearTimeout(projectTimer.current);
    projectTimer.current = window.setTimeout(async () => {
      try {
        const updated = await onPatch({ projectText });
        setPr(updated);
        setProjectSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      } catch {
        toast("Could not save draft", "err");
      }
    }, 750);
    return () => window.clearTimeout(projectTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectText]);

  const markLesson = async () => {
    setLessonBusy(true);
    try {
      const updated = await onPatch({ lessonDone: true });
      setPr(updated);
      toast("Lesson marked complete — quiz unlocked in spirit, go take it");
    } catch {
      toast("Could not update progress", "err");
    } finally {
      setLessonBusy(false);
    }
  };

  const allAnswered = mod.quiz.every((_, i) => answers[i] !== undefined);

  const submitQuiz = async () => {
    if (!allAnswered) return;
    setQuizBusy(true);
    const correct = mod.quiz.reduce((acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0), 0);
    const score = Math.round((correct / mod.quiz.length) * 100);
    try {
      const updated = await onPatch({ quizScore: score, quizAttempts: (pr?.quizAttempts ?? 0) + 1 });
      setPr(updated);
      setSubmitted(true);
      toast(
        score >= 75 ? `Quiz scored ${score}% — strong.` : `Quiz scored ${score}%. Retakes allowed, explanations below.`,
        score >= 50 ? "ok" : "info"
      );
    } catch {
      toast("Could not save quiz score", "err");
    } finally {
      setQuizBusy(false);
    }
  };

  const retake = () => {
    setAnswers({});
    setSubmitted(false);
  };

  const submitWork = async (kind: "task" | "project") => {
    const text = kind === "task" ? taskText : projectText;
    if (text.trim().length < 10) {
      toast("Add a little more before submitting (min ~10 characters)", "info");
      return;
    }
    setSubmitBusy(kind);
    try {
      const patch =
        kind === "task" ? { taskText: text, taskSubmitted: true } : { projectText: text, projectSubmitted: true };
      const updated = await onPatch(patch);
      setPr(updated);
      toast(
        kind === "task"
          ? "Task submitted — your trainer can review it now"
          : "Project submitted — your trainer can review it now"
      );
    } catch {
      toast("Could not submit", "err");
    } finally {
      setSubmitBusy(null);
    }
  };

  const tabDone: Record<Tab, boolean> = {
    lesson: !!pr?.lessonDone,
    quiz: pr?.quizScore != null,
    task: !!pr?.taskSubmitted,
    project: !!pr?.projectSubmitted,
  };

  const quizScore = pr?.quizScore ?? null;

  return (
    <div>
      <button onClick={onBack} className="btn btn-ghost py-2! text-[11.5px]">
        <IconArrowLeft size={14} /> BACK TO THE TRACK
      </button>

      {/* header */}
      <div className="mt-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip chip-amber">{`MODULE ${String(mod.order).padStart(2, "0")}`}</span>
          {mod.placeholder && <span className="chip chip-sky">placeholder curriculum</span>}
          <span className="font-display text-[11px] tracking-[0.12em] text-dim">
            {Object.values(tabDone).filter(Boolean).length}/4 STEPS COMPLETE
          </span>
        </div>
        <h1 className="mt-3 max-w-3xl text-[30px] font-extrabold leading-tight tracking-tight text-ink sm:text-[36px]">
          {mod.title}
        </h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-mute">{mod.desc}</p>
      </div>

      {/* tabs */}
      <div className="mt-6 flex gap-5 overflow-x-auto border-b border-line sm:gap-8">
        {TABS.map(({ k, label, Icon }) => (
          <button key={k} className={`tab-btn shrink-0 ${tab === k ? "active" : ""}`} onClick={() => setTab(k)}>
            <Icon size={15} />
            {label}
            <span
              className={`h-1.5 w-1.5 rounded-full ${tabDone[k] ? "bg-mint" : "bg-line2"}`}
              title={tabDone[k] ? "complete" : "pending"}
            />
          </button>
        ))}
      </div>

      {/* ---------------- LESSON ---------------- */}
      {tab === "lesson" && (
        <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_300px]">
          <div className="panel min-w-0 p-6 sm:p-8">
            <div className="prose-lesson" dangerouslySetInnerHTML={{ __html: mod.lesson }} />
          </div>
          <div className="h-fit lg:sticky lg:top-8">
            <div className="panel p-5">
              <div className="label-xs">// step 1 of 4</div>
              <p className="mt-3 text-[13px] leading-relaxed text-mute">
                Read through, then lock it in. The quiz right after checks the same ideas.
              </p>
              {pr?.lessonDone ? (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-mint/35 bg-mint/[0.07] px-3 py-2.5 font-display text-[11.5px] font-bold tracking-[0.1em] text-mint">
                  <IconCheckCircle size={16} /> LESSON COMPLETE
                </div>
              ) : (
                <button className="btn btn-amber mt-4 w-full" onClick={markLesson} disabled={lessonBusy}>
                  {lessonBusy ? "SAVING…" : "MARK LESSON COMPLETE"}
                  {!lessonBusy && <IconCheck size={14} sw={2.6} />}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- QUIZ ---------------- */}
      {tab === "quiz" && (
        <div className="mt-7 max-w-3xl">
          {quizScore != null && !submitted && (
            <div className="panel mb-5 flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <div className="label-xs">// latest result</div>
                <div className="mt-1 font-display text-[26px] font-extrabold text-sky">{quizScore}%</div>
                <div className="font-display text-[10.5px] tracking-[0.12em] text-dim">
                  {pr?.quizAttempts ?? 0} ATTEMPT{(pr?.quizAttempts ?? 0) === 1 ? "" : "S"} LOGGED
                </div>
              </div>
              <button className="btn btn-ghost" onClick={retake}>
                RETAKE FOR A BETTER SCORE
              </button>
            </div>
          )}

          <div className="flex flex-col gap-5">
            {mod.quiz.map((q, qi) => {
              const chosen = answers[qi];
              return (
                <div key={qi} className="panel p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <span className="font-display text-[13px] font-extrabold text-amber">Q{qi + 1}</span>
                    <p className="text-[15px] font-semibold leading-relaxed text-ink">{q.q}</p>
                  </div>
                  <div className="mt-4 grid gap-2.5">
                    {q.opts.map((opt, oi) => {
                      const isCorrect = oi === q.correct;
                      const isChosen = chosen === oi;
                      let cls = "border-line bg-panel2 hover:border-line2";
                      if (submitted) {
                        if (isCorrect) cls = "border-mint/60 bg-mint/[0.08]";
                        else if (isChosen) cls = "border-coral/60 bg-coral/[0.07]";
                        else cls = "border-line bg-panel2 opacity-55";
                      } else if (isChosen) {
                        cls = "border-amber/70 bg-amber/[0.07]";
                      }
                      return (
                        <label
                          key={oi}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-all duration-150 ${cls} ${
                            submitted ? "cursor-default" : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q-${qi}`}
                            className="sr-only"
                            checked={isChosen}
                            disabled={submitted}
                            onChange={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                          />
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border font-display text-[10.5px] font-bold ${
                              submitted && isCorrect
                                ? "border-mint bg-mint text-[#04231a]"
                                : submitted && isChosen
                                  ? "border-coral bg-coral text-[#2b070b]"
                                  : isChosen
                                    ? "border-amber bg-amber text-[#241703]"
                                    : "border-line2 text-dim"
                            }`}
                          >
                            {submitted && isCorrect ? "✓" : submitted && isChosen ? "✕" : String.fromCharCode(65 + oi)}
                          </span>
                          <span className={`text-[13.5px] leading-relaxed ${submitted && isCorrect ? "text-mint" : submitted && isChosen ? "text-coral" : "text-mute"}`}>
                            {opt}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  {submitted && (
                    <div
                      className={`mt-4 rounded-lg border px-4 py-3 text-[12.5px] leading-relaxed ${
                        chosen === q.correct ? "border-mint/35 bg-mint/[0.05] text-mute" : "border-coral/35 bg-coral/[0.05] text-mute"
                      }`}
                    >
                      <span className={`font-display text-[10.5px] font-bold tracking-[0.14em] ${chosen === q.correct ? "text-mint" : "text-coral"}`}>
                        {chosen === q.correct ? "▸ CORRECT — " : "▸ NOT QUITE — "}
                      </span>
                      {q.explain}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!submitted ? (
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button className="btn btn-amber" onClick={submitQuiz} disabled={!allAnswered || quizBusy}>
                {quizBusy ? "GRADING…" : "SUBMIT ANSWERS"}
              </button>
              <span className="font-display text-[11px] tracking-[0.1em] text-dim">
                {Object.keys(answers).length}/{mod.quiz.length} ANSWERED
              </span>
            </div>
          ) : (
            <div className="panel mt-6 flex flex-wrap items-center justify-between gap-4 border-mint/30 p-5">
              <div className="flex items-center gap-4">
                <span className="font-display text-[36px] font-extrabold leading-none text-mint">{quizScore}%</span>
                <div>
                  <div className="font-display text-[12px] font-bold tracking-[0.12em] text-ink">SCORE SAVED TO PROGRESS</div>
                  <div className="text-[12px] text-mute">Explanations above · retake any time to improve it.</div>
                </div>
              </div>
              <button className="btn btn-ghost" onClick={retake}>
                RETAKE QUIZ
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---------------- TASK ---------------- */}
      {tab === "task" && (
        <div className="mt-7 grid max-w-4xl gap-5 lg:grid-cols-[300px_1fr]">
          <div className="h-fit lg:sticky lg:top-8">
            <div className="panel p-5">
              <div className="label-xs">// step 3 · short exercise</div>
              <p className="mt-3 text-[13.5px] leading-relaxed text-mute">{mod.task}</p>
              {pr?.taskSubmitted && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-mint/35 bg-mint/[0.07] px-3 py-2.5 font-display text-[11px] font-bold tracking-[0.1em] text-mint">
                  <IconCheckCircle size={15} /> SUBMITTED — EDITS UPDATE IT
                </div>
              )}
            </div>
          </div>
          <div className="panel min-w-0 p-5">
            <div className="flex items-center justify-between gap-3">
              <label className="label-xs" htmlFor="task-ta">
                your submission — text / code / link
              </label>
              <span className="flex items-center gap-1.5 font-display text-[10.5px] tracking-[0.08em] text-dim">
                <IconSave size={12} />
                {taskSavedAt ? `DRAFT SAVED ${taskSavedAt}` : "AUTOSAVE ON"}
              </span>
            </div>
            <textarea
              id="task-ta"
              className="textarea input-mono mt-3 min-h-[240px] resize-y"
              placeholder={"Paste code, a repo link, or a written answer…\n\nDrafts save automatically as you type."}
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
            />
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button className="btn btn-amber" onClick={() => submitWork("task")} disabled={submitBusy === "task"}>
                {submitBusy === "task" ? "SUBMITTING…" : pr?.taskSubmitted ? "UPDATE SUBMISSION" : "SUBMIT TASK"}
              </button>
              <span className="font-display text-[10.5px] tracking-[0.08em] text-dim">
                {taskText.trim().length} CHARS
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- PROJECT ---------------- */}
      {tab === "project" && (
        <div className="mt-7 grid max-w-4xl gap-5 lg:grid-cols-[300px_1fr]">
          <div className="h-fit lg:sticky lg:top-8">
            <div className="panel p-5">
              <div className="label-xs">// step 4 · module-capping build</div>
              <h3 className="mt-3 font-display text-[14px] font-bold leading-snug text-amber2">{mod.project.title}</h3>
              <p className="mt-3 text-[13px] leading-relaxed text-mute">{mod.project.description}</p>
              {pr?.projectSubmitted && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-mint/35 bg-mint/[0.07] px-3 py-2.5 font-display text-[11px] font-bold tracking-[0.1em] text-mint">
                  <IconCheckCircle size={15} /> SUBMITTED — EDITS UPDATE IT
                </div>
              )}
            </div>
          </div>
          <div className="panel min-w-0 p-5">
            <div className="flex items-center justify-between gap-3">
              <label className="label-xs" htmlFor="proj-ta">
                your project — text / code / link
              </label>
              <span className="flex items-center gap-1.5 font-display text-[10.5px] tracking-[0.08em] text-dim">
                <IconSave size={12} />
                {projectSavedAt ? `DRAFT SAVED ${projectSavedAt}` : "AUTOSAVE ON"}
              </span>
            </div>
            <textarea
              id="proj-ta"
              className="textarea input-mono mt-3 min-h-[280px] resize-y"
              placeholder={"Paste your code, hosted URL, and a short write-up…\n\nDrafts save automatically as you type."}
              value={projectText}
              onChange={(e) => setProjectText(e.target.value)}
            />
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button className="btn btn-amber" onClick={() => submitWork("project")} disabled={submitBusy === "project"}>
                {submitBusy === "project" ? "SUBMITTING…" : pr?.projectSubmitted ? "UPDATE SUBMISSION" : "SUBMIT PROJECT"}
              </button>
              <span className="font-display text-[10.5px] tracking-[0.08em] text-dim">
                {projectText.trim().length} CHARS
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
