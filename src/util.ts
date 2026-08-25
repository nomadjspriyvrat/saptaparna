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

export const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export const avg = (nums: number[]) =>
  nums.length === 0 ? null : Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
