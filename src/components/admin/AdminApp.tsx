import { useCallback, useEffect, useState, type ComponentType } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import * as api from "../../api";
import { toast } from "../../toast";
import type { AdminStudentRow, Analytics, EnrollmentStatus, Payment, Session } from "../../types";
import { effectiveStatus, fmtCountdown, fmtDateLong, fmtINR, initials, timeAgo, trialRemaining } from "../../util";
import CourseManager from "./CourseManager";
import LiveSchedule from "../LiveSchedule";
import Reveal from "../Reveal";
import {
  IconCard, IconChart, IconCheck, IconChevron, IconEye, IconEyeOff, IconGrid, IconLogout, IconSearch, IconUsers, IconVideo, LogoSigma, type IconProps,
} from "../icons";

type View = "overview" | "courses" | "students" | "live" | "payments";

const NAV: Array<{ v: View; label: string; Icon: ComponentType<IconProps> }> = [
  { v: "overview", label: "Overview", Icon: IconGrid },
  { v: "courses", label: "Courses & LaTeX", Icon: IconChart },
  { v: "students", label: "Students", Icon: IconUsers },
  { v: "live", label: "Live Classes", Icon: IconVideo },
  { v: "payments", label: "Payments", Icon: IconCard },
];

const STATUS_META: Record<EnrollmentStatus, { chip: string; label: string }> = {
  trial: { chip: "chip-chalk", label: "trial" },
  active: { chip: "chip-mint", label: "active" },
  expired: { chip: "chip-coral", label: "expired" },
  blocked: { chip: "chip-coral", label: "blocked" },
};

const tooltipStyle = {
  background: "#0f1713",
  border: "1px solid #2e4439",
  borderRadius: 8,
  fontFamily: "JetBrains Mono, monospace",
  fontSize: 11,
  color: "#eaf0e5",
};

interface AdminAppProps {
  session: Extract<Session, { role: "admin" }>;
  onLogout: () => void;
}

export default function AdminApp({ session, onLogout }: AdminAppProps) {
  const [view, setView] = useState<View>("overview");

  const nav = (v: View) => {
    setView(v);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex min-h-screen">
      {/* ---------- sidebar ---------- */}
      <aside className="sticky top-0 z-30 flex h-screen w-[74px] shrink-0 flex-col border-r border-line bg-abyss/70 lg:w-[252px]">
        <div className="flex items-center justify-center gap-2.5 px-3 pb-5 pt-6 lg:justify-start lg:px-6">
          <span className="text-chalk"><LogoSigma size={24} sw={2.1} /></span>
          <div className="hidden lg:block">
            <div className="font-display text-[16px] font-bold italic tracking-tight text-ink">Edu<span className="text-chalk">Launch</span></div>
            <div className="label-xs mt-0.5 text-[9px]!">trainer console</div>
          </div>
        </div>
        <nav className="flex flex-col gap-1 px-2.5 lg:px-3">
          {NAV.map(({ v, label, Icon }) => {
            const active = view === v;
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
          <div className="panel hidden items-center gap-3 p-3 lg:flex">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-mint/15 font-code text-[12px] font-bold text-mint">{initials(session.name)}</div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold text-ink">{session.name}</div>
              <div className="truncate font-code text-[9.5px] tracking-[0.08em] text-dim">ADMIN · FULL CONTROL</div>
            </div>
            <button onClick={onLogout} title="Sign out" className="rounded-md p-1.5 text-dim transition-colors hover:bg-coral/10 hover:text-coral"><IconLogout size={16} /></button>
          </div>
          <div className="flex flex-col items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-mint/15 font-code text-[11px] font-bold text-mint" title={session.name}>{initials(session.name)}</div>
            <button onClick={onLogout} title="Sign out" className="rounded-md p-1.5 text-dim transition-colors hover:bg-coral/10 hover:text-coral"><IconLogout size={16} /></button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 lg:py-10">
          {view === "overview" && <Overview />}
          {view === "courses" && <CourseManager />}
          {view === "students" && <Students />}
          {view === "live" && <LiveSchedule role="admin" courseName={(id) => (id === "crs_linalg" ? "Linear Algebra" : "Advanced Calculus")} />}
          {view === "payments" && <Payments />}
        </div>
      </main>
    </div>
  );
}

/* ---------------- overview ---------------- */

const DONUT_COLORS: Record<EnrollmentStatus, string> = {
  active: "#6fe3b4", trial: "#f6c945", expired: "#ff8a7a", blocked: "#64796c",
};

function Overview() {
  const [a, setA] = useState<Analytics | null>(null);
  const [rows, setRows] = useState<AdminStudentRow[]>([]);

  useEffect(() => {
    api.getAnalytics().then(setA).catch(() => toast("Could not load analytics", "err"));
    api.adminListStudents().then(setRows).catch(() => undefined);
  }, []);

  if (!a) {
    return (
      <div>
        <div className="skel h-9 w-64" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="skel h-28" /><div className="skel h-28" /><div className="skel h-28" /><div className="skel h-28" />
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3"><div className="skel h-64 lg:col-span-2" /><div className="skel h-64" /></div>
      </div>
    );
  }

  const donut = (Object.keys(a.statusCounts) as EnrollmentStatus[]).map((k) => ({ name: k, value: a.statusCounts[k] }));

  return (
    <div>
      <div className="label-xs">// trainer overview</div>
      <h1 className="mt-2 text-[32px] font-extrabold leading-tight tracking-tight text-ink">
        The whole <span className="text-chalk">cohort,</span> one board.
      </h1>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { n: fmtINR(a.revenueTotal), l: "lifetime revenue", c: "text-chalk" },
          { n: String(a.statusCounts.active), l: "paying students", c: "text-mint" },
          { n: `${a.conversionPct}%`, l: "trial → paid", c: "text-sky" },
          { n: `${a.avgCompletionPct}%`, l: "avg completion", c: "text-ink" },
        ].map((s, i) => (
          <Reveal key={s.l} delay={i * 70}>
            <div className="panel p-5">
              <div className={`font-display text-[30px] font-bold italic leading-none ${s.c}`}>{s.n}</div>
              <div className="label-xs mt-2.5">{s.l}</div>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Reveal>
          <div className="panel p-5 lg:col-span-2">
            <h2 className="font-display text-[13.5px] font-bold tracking-[0.18em] text-ink"><span className="text-chalk">▸</span> REVENUE · LAST 6 MONTHS</h2>
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={a.revenueMonthly} barSize={26}>
                  <CartesianGrid stroke="#21312a" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" stroke="#64796c" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} axisLine={false} />
                  <YAxis stroke="#64796c" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} axisLine={false} tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(246,201,69,0.06)" }} formatter={(v) => [fmtINR(Number(v)), "revenue"]} />
                  <Bar dataKey="value" fill="#f6c945" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className="panel p-5">
            <h2 className="font-display text-[13.5px] font-bold tracking-[0.18em] text-ink"><span className="text-chalk">▸</span> ENROLLMENT MIX</h2>
            <div className="mt-2 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donut} dataKey="value" innerRadius={46} outerRadius={66} paddingAngle={3} strokeWidth={0}>
                    {donut.map((d) => <Cell key={d.name} fill={DONUT_COLORS[d.name as EnrollmentStatus]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {donut.map((d) => (
                <span key={d.name} className="flex items-center gap-2 font-code text-[10.5px] tracking-[0.08em] text-mute">
                  <span className="h-2 w-2 rounded-full" style={{ background: DONUT_COLORS[d.name as EnrollmentStatus] }} />
                  {d.name.toUpperCase()} · {d.value}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Reveal>
          <div className="panel p-5 lg:col-span-2">
            <h2 className="font-display text-[13.5px] font-bold tracking-[0.18em] text-ink"><span className="text-chalk">▸</span> WEEKLY ENGAGEMENT</h2>
            <div className="mt-4 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={a.weeklyActive}>
                  <defs>
                    <linearGradient id="act" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6fe3b4" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#6fe3b4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#21312a" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" stroke="#64796c" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} axisLine={false} />
                  <YAxis stroke="#64796c" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, "active students"]} />
                  <Area dataKey="value" stroke="#6fe3b4" strokeWidth={2} fill="url(#act)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className="panel p-5">
            <h2 className="font-display text-[13.5px] font-bold tracking-[0.18em] text-ink"><span className="text-chalk">▸</span> NEWEST SIGNUPS</h2>
            <div className="mt-4 flex flex-col gap-3">
              {rows.slice(0, 5).map((r) => (
                <div key={r.student._id} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-panel2 font-code text-[10.5px] font-bold text-mute">{initials(r.student.name)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12.5px] font-semibold text-ink">{r.student.name}</div>
                    <div className="font-code text-[9.5px] tracking-[0.08em] text-dim">{r.courseTitle.toUpperCase()}</div>
                  </div>
                  <span className={`chip ${STATUS_META[effectiveStatus(r.student)].chip}`}>{STATUS_META[effectiveStatus(r.student)].label}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

/* ---------------- students ---------------- */

function Students() {
  const [rows, setRows] = useState<AdminStudentRow[] | null>(null);
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const now = Date.now();

  const refresh = useCallback(() => {
    api.adminListStudents().then(setRows).catch(() => toast("Could not load students", "err"));
  }, []);
  useEffect(refresh, [refresh]);

  const filtered = (rows ?? []).filter((r) =>
    (r.student.name + r.student.email + r.courseTitle).toLowerCase().includes(q.toLowerCase())
  );

  const setStatus = async (r: AdminStudentRow, status: EnrollmentStatus) => {
    await api.adminSetStatus(r.student._id, status);
    toast(`${r.student.name} → ${status}`, "info");
    refresh();
  };

  const toggleVis = async (r: AdminStudentRow, moduleId: string, moduleTitle: string) => {
    await api.adminToggleVisibility(r.student._id, moduleId);
    refresh();
    const hidden = r.student.moduleVisibility[moduleId] !== false;
    toast(`${hidden ? "Disabled" : "Re-enabled"} "${moduleTitle}" for ${r.student.name}`, "info");
  };

  return (
    <div>
      <div className="label-xs">// student management</div>
      <h1 className="mt-2 text-[32px] font-extrabold leading-tight tracking-tight text-ink">
        Every learner, <span className="text-chalk">every knob.</span>
      </h1>
      <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-mute">
        Flip enrollment status, restart trials, and toggle per-module visibility from here — changes apply to the student's dashboard immediately.
      </p>

      <div className="relative mt-6 max-w-md">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dim"><IconSearch size={16} /></span>
        <input className="input pl-10!" placeholder="Search name, email or course…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {rows === null ? (
        <div className="mt-5 flex flex-col gap-3"><div className="skel h-28" /><div className="skel h-28" /><div className="skel h-28" /></div>
      ) : (
        <div className="mt-5 flex flex-col gap-3">
          {filtered.map((r, i) => {
            const st = effectiveStatus(r.student);
            const meta = STATUS_META[st];
            const open = expanded === r.student._id;
            return (
              <Reveal key={r.student._id} delay={Math.min(i * 45, 270)}>
                <div className={`panel overflow-hidden ${open ? "border-line2" : ""}`}>
                  <div className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-panel2 font-code text-[13px] font-bold text-chalk">{initials(r.student.name)}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[14.5px] font-bold text-ink">{r.student.name}</span>
                        <span className={`chip ${meta.chip}`}>
                          {st === "trial" ? `trial · ${fmtCountdown(trialRemaining(r.student, now)).replace(/\s?\d+s$/, "")} left` : meta.label}
                        </span>
                        {r.student.paymentStatus === "completed" && <span className="chip chip-mint"><IconCheck size={10} sw={3} /> PAID</span>}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 font-code text-[10.5px] tracking-[0.06em] text-dim">
                        <span>{r.student.email}</span>
                        <span>{r.courseTitle.toUpperCase()}</span>
                        <span>JOINED {fmtDateLong(r.student.enrollmentDate).toUpperCase()}</span>
                        <span>ACTIVE {timeAgo(r.student.lastActive)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-28">
                        <div className="flex justify-between font-code text-[10px] text-dim">
                          <span>{r.modulesDone}/{r.modulesTotal}</span><span>{r.completionPct}%</span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line/70">
                          <div className="h-full rounded-full bg-gradient-to-r from-chalk to-mint" style={{ width: `${r.completionPct}%` }} />
                        </div>
                      </div>
                      <button className="btn btn-ghost !px-3 !py-2" onClick={() => setExpanded(open ? null : r.student._id)}>
                        <span className="hidden sm:inline">ACCESS</span>
                        <IconChevron size={14} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
                      </button>
                    </div>
                  </div>

                  {open && (
                    <div className="grid gap-4 border-t border-line bg-panel2/50 p-4 sm:p-5 lg:grid-cols-[1fr_1fr]">
                      <div>
                        <div className="label-xs">// enrollment status</div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(["trial", "active", "expired", "blocked"] as EnrollmentStatus[]).map((s) => (
                            <button
                              key={s}
                              onClick={() => setStatus(r, s)}
                              disabled={st === s}
                              className={`btn !px-3.5 !py-2 !text-[10.5px] ${st === s ? "btn-chalk" : "btn-ghost"}`}
                            >
                              {s === "trial" ? "RESTART TRIAL" : s.toUpperCase()}
                            </button>
                          ))}
                        </div>
                        <p className="mt-3 text-[11.5px] leading-relaxed text-dim">
                          “Restart trial” grants a fresh 48-hour window. “Active” grants permanent access without a payment record.
                        </p>
                      </div>
                      <div>
                        <div className="label-xs">// per-module visibility</div>
                        <div className="mt-3 flex flex-col gap-2">
                          {Object.keys(r.student.moduleVisibility || {}).length >= 0 &&
                            moduleIdsFor(r).map((m) => {
                              const hidden = r.student.moduleVisibility[m.id] === false;
                              return (
                                <button
                                  key={m.id}
                                  onClick={() => toggleVis(r, m.id, m.title)}
                                  className={`flex items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 text-left transition-colors ${hidden ? "border-coral/40 bg-coral/[0.05]" : "border-line bg-panel2 hover:border-line2"}`}
                                >
                                  <span className={`text-[12.5px] font-semibold ${hidden ? "text-coral line-through" : "text-ink"}`}>{m.title}</span>
                                  <span className={`flex items-center gap-1.5 font-code text-[10px] font-bold tracking-[0.1em] ${hidden ? "text-coral" : "text-mint"}`}>
                                    {hidden ? <IconEyeOff size={13} /> : <IconEye size={13} />}
                                    {hidden ? "DISABLED" : "VISIBLE"}
                                  </span>
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
          {filtered.length === 0 && (
            <p className="rounded-xl border border-dashed border-line px-6 py-10 text-center text-[13px] text-dim">No students match “{q}”.</p>
          )}
        </div>
      )}
    </div>
  );
}

/* module ids for the expanded access panel — derived from known courses */
function moduleIdsFor(r: AdminStudentRow): Array<{ id: string; title: string }> {
  const calc = [
    ["mod_c1", "01 · Sequences & Limits"], ["mod_c2", "02 · Continuity & ε–δ"], ["mod_c3", "03 · Differentiation & the MVT"],
    ["mod_c4", "04 · The Riemann Integral"], ["mod_c5", "05 · Uniform Convergence"], ["mod_c6", "06 · Power Series & Taylor"],
    ["mod_c7", "07 · Fourier Series"], ["mod_c8", "08 · Toward Lebesgue"],
  ];
  const la = [
    ["mod_la1", "01 · Vector Spaces"], ["mod_la2", "02 · Linear Maps & Rank–Nullity"], ["mod_la3", "03 · Eigenvalues & Spectral Theory"],
  ];
  return (r.courseTitle.includes("Linear") ? la : calc).map(([id, title]) => ({ id, title }));
}

/* ---------------- payments ---------------- */

function Payments() {
  const [pays, setPays] = useState<Array<Payment & { studentName: string; courseTitle: string }> | null>(null);

  useEffect(() => {
    api.getPaymentsAdmin().then(setPays).catch(() => toast("Could not load payments", "err"));
  }, []);

  const completed = (pays ?? []).filter((p) => p.status === "completed");
  const total = completed.reduce((a, p) => a + p.amount, 0);

  return (
    <div>
      <div className="label-xs">// payments</div>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-[32px] font-extrabold leading-tight tracking-tight text-ink">
          The <span className="text-chalk">ledger.</span>
        </h1>
        <span className="chip chip-mint mb-1.5">{completed.length} COMPLETED · {fmtINR(total)}</span>
      </div>

      {pays === null ? (
        <div className="mt-6 flex flex-col gap-3"><div className="skel h-16" /><div className="skel h-16" /><div className="skel h-16" /></div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-y-2">
            <thead>
              <tr>
                {["STUDENT", "COURSE", "AMOUNT", "METHOD", "GATEWAY REF", "STATUS", "DATE"].map((h) => (
                  <th key={h} className="label-xs px-4 pb-1 text-left !text-[9.5px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pays.map((p) => (
                <tr key={p._id} className="panel">
                  <td className="rounded-l-lg border-b border-l border-t border-line px-4 py-3.5 text-[13px] font-semibold text-ink">{p.studentName}</td>
                  <td className="border-t border-line px-4 py-3.5 text-[12px] text-mute">{p.courseTitle}</td>
                  <td className="border-t border-line px-4 py-3.5 font-code text-[13px] font-bold text-chalk">{fmtINR(p.amount)}</td>
                  <td className="border-t border-line px-4 py-3.5"><span className="chip">{p.method}</span></td>
                  <td className="border-t border-line px-4 py-3.5 font-code text-[10.5px] text-dim">{p.paymentId ? p.paymentId.toUpperCase() : p.orderId.toUpperCase()}</td>
                  <td className="border-t border-line px-4 py-3.5">
                    <span className={`chip ${p.status === "completed" ? "chip-mint" : p.status === "failed" ? "chip-coral" : "chip-chalk"}`}>{p.status}</span>
                  </td>
                  <td className="rounded-r-lg border-b border-r border-t border-line px-4 py-3.5 font-code text-[11px] text-dim">{fmtDateLong(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
