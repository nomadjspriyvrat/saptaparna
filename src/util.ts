import type { EnrollmentStatus, StudentRec } from "./types";

export const fmtINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export const fmtDate = (iso: string) =>
  new Date(iso.length === 10 ? iso + "T00:00:00" : iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

export const fmtDateLong = (iso: string) =>
  new Date(iso.length === 10 ? iso + "T00:00:00" : iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const fmtTime = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  const am = h < 12;
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${String(m).padStart(2, "0")} ${am ? "AM" : "PM"}`;
};

export const timeAgo = (iso: string) => {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 60) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
};

/** Remaining trial as {ms, h, m, s, pct} against the full trial window. */
export const trialRemaining = (student: StudentRec, now: number) => {
  const start = new Date(student.trialStart).getTime();
  const end = new Date(student.trialEnd).getTime();
  const total = Math.max(1, end - start);
  const ms = Math.max(0, end - now);
  const s = Math.floor(ms / 1000);
  return {
    ms,
    h: Math.floor(s / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
    pct: Math.min(100, (ms / total) * 100),
  };
};

export const fmtCountdown = (r: { h: number; m: number; s: number }) =>
  `${r.h}h ${String(r.m).padStart(2, "0")}m ${String(r.s).padStart(2, "0")}s`;

/** Trial students flip to expired the moment the clock passes trialEnd. */
export const effectiveStatus = (st: StudentRec, now = Date.now()): EnrollmentStatus =>
  st.status === "trial" && new Date(st.trialEnd).getTime() <= now ? "expired" : st.status;

export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");

export const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export const avg = (nums: number[]) =>
  nums.length === 0 ? null : Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);

export const uid = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}${Math.floor(Math.random() * 46656).toString(36)}`;

export const daysUntil = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / 86400000);
};

export const fmtDuration = (mins: number) => {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} hr` : `${h}h ${m}m`;
};
