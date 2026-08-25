import { useMemo, useState } from "react";
import { latexToHtml, texInline } from "../latex";
import { toast } from "../toast";
import type { ModuleAccess } from "../types";
import { fmtDuration } from "../util";
import { IconArrowLeft, IconArrowRight, IconCheckCircle, IconClock, IconEyeOff, IconLock, IconPlay } from "./icons";

interface ModuleViewerProps {
  access: ModuleAccess;
  quizScore: number | undefined;
  onBack: () => void;
  onQuiz: (score: number) => Promise<void>;
  onComplete: () => Promise<void>;
  onGoBilling: () => void;
  goNext: (() => void) | null;
}

export default function ModuleViewer({ access, quizScore, onBack, onQuiz, onComplete, onGoBilling, goNext }: ModuleViewerProps) {
  const m = access.module;
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState<"quiz" | "done" | null>(null);

  const compiled = useMemo(
    () => (m.content.compiledHtml ? m.content.compiledHtml : latexToHtml(m.content.latexSource).html),
    [m]
  );
  const isLiveRender = !m.content.compiledHtml;

  /* ---------- paywall ---------- */
  if (access.state === "paywall") {
    return (
      <div>
        <button onClick={onBack} className="btn btn-ghost py-2! text-[11.5px]"><IconArrowLeft size={14} /> BACK TO COURSE</button>
        <div className="panel mt-6 max-w-xl p-8 text-center sm:p-10">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-chalk/40 bg-chalk/10 text-chalk">
            <IconLock size={24} />
          </span>
          <h1 className="mt-5 font-display text-[26px] font-bold italic text-ink">Module {String(m.order).padStart(2, "0")} · {m.title}</h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-mute">
            Your trial has ended, so compiled content is locked. Pay the one-time course fee to unlock every module permanently.
          </p>
          <button className="btn btn-chalk mt-6 w-full !py-3" onClick={onGoBilling}>UNLOCK WITH PAYMENT</button>
        </div>
      </div>
    );
  }

  /* ---------- restricted by instructor ---------- */
  if (access.state === "restricted") {
    return (
      <div>
        <button onClick={onBack} className="btn btn-ghost py-2! text-[11.5px]"><IconArrowLeft size={14} /> BACK TO COURSE</button>
        <div className="panel mt-6 max-w-xl p-8 text-center sm:p-10">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-sky/40 bg-sky/10 text-sky">
            <IconEyeOff size={24} />
          </span>
          <h1 className="mt-5 font-display text-[26px] font-bold italic text-ink">Restricted by your instructor</h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-mute">
            Module {String(m.order).padStart(2, "0")} · {m.title} has been disabled on your profile. If you think this is a mistake, reach out after the next live class.
          </p>
          <button className="btn btn-ghost mt-6" onClick={onBack}>BACK TO COURSE</button>
        </div>
      </div>
    );
  }

  const allAnswered = m.quiz.length > 0 && m.quiz.every((_, i) => answers[i] !== undefined);
  const done = access.state === "done";

  const submitQuiz = async () => {
    setBusy("quiz");
    const correct = m.quiz.reduce((acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0), 0);
    const score = Math.round((correct / m.quiz.length) * 100);
    try {
      await onQuiz(score);
      setSubmitted(true);
      toast(score >= 70 ? `Quiz scored ${score}% — saved (best attempt kept).` : `Quiz scored ${score}%. Retakes allowed.`, score >= 50 ? "ok" : "info");
    } catch {
      toast("Could not save quiz score", "err");
    } finally {
      setBusy(null);
    }
  };

  const complete = async () => {
    setBusy("done");
    try {
      await onComplete();
      toast(`Module ${String(m.order).padStart(2, "0")} complete — next module unlocked.`);
    } catch {
      toast("Could not update progress", "err");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <button onClick={onBack} className="btn btn-ghost py-2! text-[11.5px]"><IconArrowLeft size={14} /> BACK TO COURSE</button>

      <div className="mt-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip chip-chalk">MODULE {String(m.order).padStart(2, "0")}</span>
          <span className="chip"><IconClock size={11} /> {fmtDuration(m.estimatedMinutes)}</span>
          <span className="chip chip-sky">{m.contentType}</span>
          {done && <span className="chip chip-mint"><IconCheckCircle size={11} /> COMPLETED</span>}
          {isLiveRender && <span className="chip chip-amber">LIVE KATEX RENDER</span>}
        </div>
        <h1 className="mt-3 max-w-3xl font-display text-[32px] font-bold italic leading-tight tracking-tight text-ink sm:text-[40px]">
          {m.title}
        </h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-mute">{m.description}</p>
      </div>

      {/* lesson */}
      <div className="panel mt-7 p-6 sm:p-9">
        <div className="tex-prose" dangerouslySetInnerHTML={{ __html: compiled }} />
      </div>

      {/* quiz */}
      {m.quiz.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-[15px] font-bold tracking-[0.22em] text-ink">
            <span className="text-chalk">▸</span> COMPREHENSION CHECK
          </h2>
          {quizScore != null && !submitted && (
            <div className="panel mt-4 flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <span className="label-xs">// best score on record</span>
                <div className="mt-1 font-code text-[24px] font-bold text-sky">{quizScore}%</div>
              </div>
              {!done && <button className="btn btn-ghost" onClick={() => setSubmitted(false)}>RETAKE</button>}
            </div>
          )}
          <div className="mt-4 flex flex-col gap-4">
            {m.quiz.map((q, qi) => {
              const chosen = answers[qi];
              return (
                <div key={qi} className="panel p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <span className="font-code text-[12.5px] font-bold text-chalk">Q{qi + 1}</span>
                    <p className="text-[14.5px] font-semibold leading-relaxed text-ink" dangerouslySetInnerHTML={{ __html: texInline(q.q) }} />
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
                      } else if (isChosen) cls = "border-chalk/70 bg-chalk/[0.07]";
                      return (
                        <label key={oi} className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-all duration-150 ${cls} ${submitted ? "cursor-default" : ""}`}>
                          <input type="radio" name={`mq-${qi}`} className="sr-only" checked={isChosen} disabled={submitted || done} onChange={() => setAnswers((a) => ({ ...a, [qi]: oi }))} />
                          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border font-code text-[10.5px] font-bold ${
                            submitted && isCorrect ? "border-mint bg-mint text-[#06251a]"
                              : submitted && isChosen ? "border-coral bg-coral text-[#2b070b]"
                                : isChosen ? "border-chalk bg-chalk text-[#231a03]"
                                  : "border-line2 text-dim"
                          }`}>
                            {submitted && isCorrect ? "✓" : submitted && isChosen ? "✕" : String.fromCharCode(65 + oi)}
                          </span>
                          <span className={`text-[13.5px] leading-relaxed ${submitted && isCorrect ? "text-mint" : submitted && isChosen ? "text-coral" : "text-mute"}`} dangerouslySetInnerHTML={{ __html: texInline(opt) }} />
                        </label>
                      );
                    })}
                  </div>
                  {submitted && (
                    <div className={`mt-4 rounded-lg border px-4 py-3 text-[12.5px] leading-relaxed text-mute ${chosen === q.correct ? "border-mint/35 bg-mint/[0.05]" : "border-coral/35 bg-coral/[0.05]"}`}>
                      <span className={`font-code text-[10.5px] font-bold tracking-[0.14em] ${chosen === q.correct ? "text-mint" : "text-coral"}`}>
                        {chosen === q.correct ? "▸ CORRECT — " : "▸ NOT QUITE — "}
                      </span>
                      {q.explain}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!submitted && !done && (
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <button className="btn btn-chalk" onClick={submitQuiz} disabled={!allAnswered || busy === "quiz"}>
                {busy === "quiz" ? "GRADING…" : "SUBMIT ANSWERS"}
              </button>
              <span className="font-code text-[11px] tracking-[0.1em] text-dim">{Object.keys(answers).length}/{m.quiz.length} ANSWERED</span>
            </div>
          )}
        </div>
      )}

      {/* complete + next */}
      <div className="panel mt-8 flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
        {done ? (
          <div className="flex items-center gap-3">
            <span className="text-mint"><IconCheckCircle size={22} /></span>
            <div>
              <div className="font-code text-[12.5px] font-bold tracking-[0.1em] text-mint">MODULE COMPLETE</div>
              <div className="text-[12px] text-dim">Best quiz score: {quizScore ?? "—"}%</div>
            </div>
          </div>
        ) : (
          <div className="text-[13px] text-mute">
            Finish the check above, then mark the module complete to unlock the next one.
          </div>
        )}
        <div className="flex gap-2.5">
          {!done && (
            <button className="btn btn-mint" onClick={complete} disabled={busy === "done" || (m.quiz.length > 0 && quizScore == null && !submitted)}>
              {busy === "done" ? "SAVING…" : "MARK MODULE COMPLETE"}
            </button>
          )}
          {goNext && (
            <button className={done ? "btn btn-chalk" : "btn btn-ghost"} onClick={goNext}>
              NEXT MODULE <IconArrowRight size={14} sw={2.4} />
            </button>
          )}
        </div>
      </div>

      {!done && m.quiz.length > 0 && quizScore == null && !submitted && (
        <p className="mt-3 flex items-center gap-2 font-code text-[10.5px] tracking-[0.1em] text-dim">
          <IconPlay size={13} /> SUBMIT THE QUIZ ONCE TO ENABLE COMPLETION
        </p>
      )}
    </div>
  );
}
