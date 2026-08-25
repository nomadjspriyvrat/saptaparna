import { useEffect, useState } from "react";
import * as api from "../api";
import type { Course, Session } from "../types";
import { IconBolt, IconX, LogoSigma } from "./icons";

export type AuthMode = "trial" | "signin" | "trainer";

interface AuthProps {
  mode: AuthMode;
  onClose: () => void;
  onAuthed: (s: Session) => void;
  onSwitchMode: (m: AuthMode) => void;
}

export default function Auth({ mode, onClose, onAuthed, onSwitchMode }: AuthProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [courseId, setCourseId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getPublicCourses().then((c) => {
      setCourses(c);
      setCourseId((prev) => prev || c[0]?._id || "");
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const s =
        mode === "trial"
          ? await api.registerStudent(name, email, courseId)
          : mode === "signin"
            ? await api.loginStudent(email)
            : await api.loginAdmin(email, password);
      onAuthed(s);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const tabs: Array<{ k: AuthMode; label: string }> = [
    { k: "trial", label: "Free trial" },
    { k: "signin", label: "Student sign-in" },
    { k: "trainer", label: "Trainer" },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-void/90 p-4 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        className="panel relative mt-6 w-full max-w-md border-line2/70 p-6 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.9)] sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="absolute right-4 top-4 rounded-md p-1.5 text-dim transition-colors hover:bg-raise hover:text-ink" onClick={onClose}>
          <IconX size={16} />
        </button>

        <div className="flex items-center gap-2.5">
          <span className="text-chalk"><LogoSigma size={24} sw={2} /></span>
          <span className="font-display text-[18px] font-bold italic text-ink">
            Edu<span className="text-chalk">Launch</span>
          </span>
        </div>

        <div className="mt-5 flex rounded-lg border border-line bg-panel2 p-1">
          {tabs.map((t) => (
            <button
              key={t.k}
              onClick={() => { onSwitchMode(t.k); setError(""); }}
              className={`flex-1 rounded-md px-2 py-2 font-code text-[10.5px] font-bold tracking-[0.1em] transition-all duration-200 ${
                mode === t.k ? "bg-chalk text-[#231a03]" : "text-dim hover:text-ink"
              }`}
            >
              {t.label.toUpperCase()}
            </button>
          ))}
        </div>

        <h2 className="mt-6 font-display text-[24px] font-bold italic leading-tight text-ink">
          {mode === "trial" ? "Start your 48-hour trial" : mode === "signin" ? "Welcome back, scholar" : "Trainer console"}
        </h2>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-mute">
          {mode === "trial"
            ? "Full access to every published module. The clock starts the moment you register — no card needed."
            : mode === "signin"
              ? "Sign in with the email you registered with. Your trial clock and progress are waiting."
              : "Manage courses, compile LaTeX, control student access and schedule live classes."}
        </p>

        <form onSubmit={submit} className="mt-5 flex flex-col gap-3.5">
          {mode === "trial" && (
            <>
              <div>
                <label className="label-xs mb-1.5 block">your name</label>
                <input className="input" placeholder="Srinivasa Ramanujan" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="label-xs mb-1.5 block">email</label>
                <input className="input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="label-xs mb-1.5 block">enroll in</label>
                <select className="select" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          {mode === "signin" && (
            <div>
              <label className="label-xs mb-1.5 block">email</label>
              <input className="input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          )}
          {mode === "trainer" && (
            <>
              <div>
                <label className="label-xs mb-1.5 block">trainer email</label>
                <input className="input" type="email" placeholder={api.ADMIN_EMAIL} value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="label-xs mb-1.5 block">password</label>
                <input className="input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </>
          )}

          {error && (
            <div className="rounded-lg border border-coral/40 bg-coral/[0.07] px-3.5 py-2.5 font-code text-[11.5px] leading-relaxed text-coral">
              ✕ {error}
            </div>
          )}

          <button className="btn btn-chalk mt-1 w-full !py-3 !text-[12.5px]" disabled={busy}>
            {busy ? "ONE MOMENT…" : mode === "trial" ? "BEGIN 48-HOUR TRIAL" : mode === "signin" ? "SIGN IN" : "OPEN CONSOLE"}
            {!busy && <IconBolt size={14} sw={2.2} />}
          </button>
        </form>

        <div className="mt-5 rounded-lg border border-line bg-panel2/70 px-3.5 py-3">
          <div className="label-xs !text-[9px] text-chalk">demo credentials</div>
          <p className="mt-1.5 font-code text-[10.5px] leading-relaxed text-dim">
            student · <span className="text-mute">priya@example.com</span> (trial running) ·{" "}
            <span className="text-mute">arjun@example.com</span> (paid)
            <br />
            trainer · <span className="text-mute">{api.ADMIN_EMAIL}</span> / <span className="text-mute">edulaunch</span>
          </p>
        </div>
      </div>
    </div>
  );
}
