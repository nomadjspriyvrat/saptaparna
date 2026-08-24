import { useEffect, useState, type FormEvent } from "react";
import * as api from "../api";
import { useScramble, useTypedLineCount } from "../hooks";
import type { Session, Subject } from "../types";
import { IconArrowRight, IconRoute, IconSpark, IconUsers, LogoMark } from "./icons";

const TERM_LINES: Array<{ text: string; cls: string }> = [
  { text: "$ the-track --boot --cohort=6", cls: "text-ink" },
  { text: "▸ loading curriculum … 29 modules", cls: "text-mute" },
  { text: "▸ syncing live-class schedule … ok", cls: "text-mute" },
  { text: "▸ 9 tracks online", cls: "text-mint" },
  { text: "$ awaiting trainee identity", cls: "text-amber" },
];

interface LoginGateProps {
  onLogin: (s: Session) => void;
}

export default function LoginGate({ onLogin }: LoginGateProps) {
  const [role, setRole] = useState<"student" | "trainer">("student");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const wordmark = useScramble("THE TRACK", 950);
  const visibleLines = useTypedLineCount(TERM_LINES.length, 430);

  useEffect(() => {
    let alive = true;
    api.getSubjects().then((s) => {
      if (alive) setSubjects(s);
    });
    return () => {
      alive = false;
    };
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (role === "student") {
        const student = await api.loginStudent(name, slug);
        onLogin({ role: "student", id: student._id, name: student.name, subject: student.subject });
      } else {
        const { rec } = await api.loginTrainer(name, passcode);
        onLogin({ role: "trainer", id: rec._id, name: rec.name });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const tickerItems = subjects.length ? subjects : [];

  return (
    <div className="flex min-h-screen">
      {/* ---------- left: terminal + wordmark ---------- */}
      <div className="relative hidden w-[52%] flex-col justify-between overflow-hidden border-r border-line p-10 lg:flex xl:p-14">
        <div className="flex items-center gap-3">
          <span className="text-amber">
            <LogoMark size={26} sw={2.1} />
          </span>
          <span className="font-display text-sm font-bold tracking-[0.22em] text-ink">THE TRACK</span>
          <span className="chip chip-mint ml-2">COHORT 6 · LIVE</span>
        </div>

        <div className="max-w-xl">
          <div className="term mb-10 overflow-hidden">
            <div className="flex items-center gap-1.5 border-b border-line px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-coral/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-mint/70" />
              <span className="ml-3 text-[10.5px] tracking-[0.18em] text-dim">TRAINING-SHELL v2.6</span>
            </div>
            <div className="min-h-[176px] px-4 py-3">
              {TERM_LINES.slice(0, visibleLines).map((l, i) => (
                <div key={i} className={l.cls}>
                  {l.text}
                </div>
              ))}
              {visibleLines >= TERM_LINES.length && (
                <div>
                  <span className="caret" />
                </div>
              )}
            </div>
          </div>

          <h1 className="font-display text-[52px] font-extrabold leading-[1.02] tracking-tight text-ink xl:text-[64px]">
            {wordmark}
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-mute">
            Skill training, module by module. Every module is four steps —{" "}
            <span className="font-display text-[12.5px] font-semibold tracking-wide text-amber2">
              LESSON → QUIZ → TASK → PROJECT
            </span>{" "}
            — and finishing all four unlocks the next one.
          </p>

          <div className="mt-9 flex items-center gap-8">
            {[
              ["9", "TRACKS"],
              ["29", "MODULES"],
              ["3", "LIVE CLASSES / WK"],
            ].map(([n, l]) => (
              <div key={l}>
                <div className="font-display text-3xl font-extrabold text-ink">{n}</div>
                <div className="label-xs mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="ticker-wrap">
          <div className="ticker">
            {[...tickerItems, ...tickerItems].map((s, i) => (
              <span key={i} className="flex items-center gap-2.5 font-display text-[11.5px] font-semibold tracking-[0.16em] text-dim">
                <span className="text-amber">
                  <IconSpark size={12} sw={2} />
                </span>
                {s.name.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ---------- right: role gate ---------- */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-[430px]">
          <div className="mb-6 flex items-center gap-2.5 lg:hidden">
            <span className="text-amber">
              <LogoMark size={24} sw={2.1} />
            </span>
            <span className="font-display text-sm font-bold tracking-[0.22em] text-ink">THE TRACK</span>
          </div>

          <div className="panel p-7 sm:p-8">
            <div className="label-xs mb-4">// select role</div>

            <div className="mb-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setRole("student");
                  setError("");
                }}
                className={`rounded-lg border p-4 text-left transition-all duration-200 ${
                  role === "student"
                    ? "border-amber/70 bg-amber/[0.07] shadow-[0_0_24px_-8px_rgba(255,178,36,0.35)]"
                    : "border-line bg-panel2 hover:border-line2"
                }`}
              >
                <span className={role === "student" ? "text-amber" : "text-dim"}>
                  <IconRoute size={22} />
                </span>
                <div className="mt-2.5 font-display text-[12.5px] font-bold tracking-[0.12em] text-ink">STUDENT</div>
                <div className="mt-1 text-[12px] leading-snug text-mute">Pick a track, run the modules</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole("trainer");
                  setError("");
                }}
                className={`rounded-lg border p-4 text-left transition-all duration-200 ${
                  role === "trainer"
                    ? "border-mint/70 bg-mint/[0.06] shadow-[0_0_24px_-8px_rgba(47,230,168,0.3)]"
                    : "border-line bg-panel2 hover:border-line2"
                }`}
              >
                <span className={role === "trainer" ? "text-mint" : "text-dim"}>
                  <IconUsers size={22} />
                </span>
                <div className="mt-2.5 font-display text-[12.5px] font-bold tracking-[0.12em] text-ink">TRAINER</div>
                <div className="mt-1 text-[12px] leading-snug text-mute">Progress + submissions board</div>
              </button>
            </div>

            <form onSubmit={submit} className="grid gap-4">
              <div>
                <label className="label-xs mb-1.5 block" htmlFor="gate-name">
                  {role === "student" ? "Your name" : "Trainer name"}
                </label>
                <input
                  id="gate-name"
                  className="input"
                  placeholder={role === "student" ? "e.g. Amina Yusuf" : "e.g. Coach Ade"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="off"
                />
              </div>

              {role === "student" ? (
                <div>
                  <label className="label-xs mb-1.5 block" htmlFor="gate-subject">
                    Subject / track
                  </label>
                  <select id="gate-subject" className="select" value={slug} onChange={(e) => setSlug(e.target.value)}>
                    <option value="" disabled>
                      {subjects.length ? "Choose your track…" : "Loading tracks…"}
                    </option>
                    {subjects.map((s) => (
                      <option key={s._id} value={s.slug}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1.5 text-[11.5px] text-dim">
                    Same name on a different track = separate progress.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="label-xs mb-1.5 block" htmlFor="gate-pass">
                    Shared passcode
                  </label>
                  <input
                    id="gate-pass"
                    className="input font-display tracking-[0.14em]"
                    type="password"
                    placeholder="••••••••"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    autoComplete="off"
                  />
                </div>
              )}

              {error && (
                <div className="rounded-md border border-coral/40 bg-coral/10 px-3 py-2 font-display text-[12px] text-coral">
                  ✕ {error}
                </div>
              )}

              <button type="submit" className={`btn w-full ${role === "student" ? "btn-amber" : "btn-mint"}`} disabled={busy}>
                {busy ? "CONNECTING…" : role === "student" ? "START TRAINING" : "OPEN COACH BOARD"}
                {!busy && <IconArrowRight size={15} sw={2.2} />}
              </button>
            </form>
          </div>

          <div className="mt-4 rounded-lg border border-dashed border-line2 bg-panel2/60 px-4 py-3 text-[12px] leading-relaxed text-dim">
            <span className="font-display text-[10.5px] font-bold tracking-[0.16em] text-mute">DEMO ACCESS //</span>{" "}
            student: any name + any track · trainer passcode:{" "}
            <code className="rounded bg-amber/10 px-1.5 py-0.5 font-display text-[11px] text-amber">track-2026</code>
          </div>
        </div>
      </div>
    </div>
  );
}
