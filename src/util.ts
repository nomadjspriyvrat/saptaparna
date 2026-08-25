import type { ProgressRow } from "./types";

/** A module is "done" when all four steps are complete. */
export const rowDone = (r: ProgressRow | undefined | null): boolean =>
  !!r && r.lessonDone && r.quizScore !== null && r.taskSubmitted && r.projectSubmitted;

export const fmtDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

export const fmtDateLong = (isoDateTime: string) =>
  new Date(isoDateTime).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const daysUntil = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / 86400000);
};

export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");

export const joinedAgo = (isoDateTime: string) => {
  const days = Math.max(0, Math.floor((Date.now() - new Date(isoDateTime).getTime()) / 86400000));
  if (days === 0) return "today";
  if (days === 1) return "1d ago";
  if (days < 60) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
};

export const ago = (isoDateTime: string) => {
  const s = Math.max(0, (Date.now() - new Date(isoDateTime).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

export const untilLabel = (date: string, time: string) => {
  const ms = new Date(`${date}T${time}:00`).getTime() - Date.now();
  if (ms <= 0) return "live now";
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `in ${Math.max(1, mins)}m`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `in ${h}h ${mins % 60}m`;
  return `in ${Math.floor(h / 24)}d ${h % 24}h`;
};

export const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export const avg = (nums: number[]) =>
  nums.length === 0 ? null : Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);

export const avgQuizOf = (rows: ProgressRow[]) =>
  avg(rows.map((r) => r.quizScore).filter((s): s is number => s != null));

/* ---------------- XP & levels (per saved step) ---------------- */

export const todayISO = () => new Date().toISOString().slice(0, 10);

/** lesson 25 · quiz up to 50 (score/2) · task 40 · project 60 → 175 XP per module */
export function xpOf(rows: Array<ProgressRow | undefined>): number {
  let xp = 0;
  for (const r of rows) {
    if (!r) continue;
    if (r.lessonDone) xp += 25;
    if (r.quizScore != null) xp += Math.round(r.quizScore / 2);
    if (r.taskSubmitted) xp += 40;
    if (r.projectSubmitted) xp += 60;
  }
  return xp;
}

const LEVELS = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000];

export interface LevelInfo {
  level: number;
  xp: number;
  into: number;
  span: number;
  next: number | null;
  pct: number;
}

export function levelInfo(xp: number): LevelInfo {
  let level = 1;
  for (let i = 1; i < LEVELS.length; i++) if (xp >= LEVELS[i]) level = i + 1;
  const base = LEVELS[level - 1];
  const next = LEVELS[level] ?? null;
  const span = next ? next - base : 0;
  const pct = next ? clamp(Math.round(((xp - base) / (next - base)) * 100), 0, 100) : 100;
  return { level, xp, into: xp - base, span, next, pct };
}

/* ---------------- streaks ---------------- */

export function streakOf(activity: Record<string, number> | undefined): number {
  if (!activity) return 0;
  const key = (d: Date) => d.toISOString().slice(0, 10);
  const d = new Date();
  let streak = 0;
  /* today still counts as "pending" — the streak survives from yesterday */
  if (!activity[key(d)]) d.setDate(d.getDate() - 1);
  while (activity[key(d)]) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

/* ---------------- achievements ---------------- */

export interface BadgeDef {
  id: string;
  name: string;
  desc: string;
  earned: boolean;
}

export function computeBadges(rows: Array<ProgressRow | undefined>, streak: number): BadgeDef[] {
  const real = rows.filter((r): r is ProgressRow => !!r);
  const doneCount = real.filter((r) => rowDone(r)).length;
  const pct = real.length ? doneCount / real.length : 0;
  return [
    { id: "first-steps", name: "First Steps", desc: "Finish your first lesson", earned: real.some((r) => r.lessonDone) },
    { id: "quiz-ace", name: "Quiz Ace", desc: "Score 100% on any module quiz", earned: real.some((r) => r.quizScore === 100) },
    { id: "comeback", name: "Comeback Kid", desc: "Retake a quiz to sharpen a score", earned: real.some((r) => r.quizAttempts >= 2) },
    { id: "module-master", name: "Module Master", desc: "Clear all four steps of a module", earned: doneCount >= 1 },
    { id: "halfway", name: "Halfway There", desc: "Reach 50% of the track", earned: pct >= 0.5 },
    { id: "track-titan", name: "Track Titan", desc: "Complete the entire track", earned: pct >= 1 },
    { id: "on-a-roll", name: "On a Roll", desc: "Train 3 days in a row", earned: streak >= 3 },
    { id: "wordsmith", name: "Wordsmith", desc: "Submit a 500+ character project write-up", earned: real.some((r) => r.projectSubmitted && r.projectText.trim().length >= 500) },
  ];
}
