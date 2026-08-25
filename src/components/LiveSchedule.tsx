import { useCallback, useEffect, useState } from "react";
import * as api from "../api";
import { toast } from "../toast";
import type { LiveClass, LiveStatus, MeetingProvider } from "../types";
import { daysUntil, fmtDate, fmtDuration, fmtTime } from "../util";
import Reveal from "./Reveal";
import { IconCalendar, IconDownload, IconPlus, IconTrash, IconVideo } from "./icons";

interface LiveScheduleProps {
  role: "student" | "admin";
  courseId?: string;
  courseName?: (id: string) => string;
}

const STATUS_CHIP: Record<LiveStatus, { cls: string; label: string }> = {
  scheduled: { cls: "chip-sky", label: "scheduled" },
  ongoing: { cls: "chip-coral", label: "● live now" },
  completed: { cls: "chip-mint", label: "completed" },
  cancelled: { cls: "", label: "cancelled" },
};

function downloadIcs(c: LiveClass, courseTitle: string) {
  const dt = c.date.replace(/-/g, "");
  const t = c.time.replace(":", "") + "00";
  const endMins = Number(c.time.slice(0, 2)) * 60 + Number(c.time.slice(3)) + c.durationMin;
  const eh = String(Math.floor(endMins / 60) % 24).padStart(2, "0");
  const em = String(endMins % 60).padStart(2, "0");
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//EduLaunch//Live//EN", "BEGIN:VEVENT",
    `UID:${c._id}@edulaunch`, `DTSTART:${dt}T${t}`, `DTEND:${dt}T${eh}${em}`,
    `SUMMARY:${c.title} — ${courseTitle}`, `DESCRIPTION:${c.meetingLink}`, `URL:${c.meetingLink}`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${c.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ics`;
  a.click();
  URL.revokeObjectURL(url);
  toast("Calendar file downloaded");
}

export default function LiveSchedule({ role, courseId, courseName }: LiveScheduleProps) {
  const [items, setItems] = useState<LiveClass[] | null>(null);
  const [form, setForm] = useState({ title: "", description: "", date: "", time: "19:00", durationMin: 60, provider: "jitsi" as MeetingProvider, courseId: courseId ?? "crs_calc" });
  const [formOpen, setFormOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(() => {
    api.getLiveClasses(role === "student" ? courseId : undefined).then(setItems).catch(() => toast("Could not load schedule", "err"));
  }, [role, courseId]);

  useEffect(refresh, [refresh]);

  const create = async () => {
    setBusy(true);
    try {
      const rec = await api.addLiveClass({ ...form, courseId: form.courseId });
      toast(`Room generated → ${rec.meetingLink}`);
      setForm((f) => ({ ...f, title: "", description: "" }));
      setFormOpen(false);
      refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not create class", "err");
    } finally {
      setBusy(false);
    }
  };

  const setStatus = async (c: LiveClass, status: LiveStatus) => {
    await api.updateLiveClass(c._id, { status });
    toast(`Marked "${c.title}" as ${status}`, "info");
    refresh();
  };

  const remove = async (c: LiveClass) => {
    await api.deleteLiveClass(c._id);
    toast("Session removed from schedule", "info");
    refresh();
  };

  const upcoming = (items ?? []).filter((c) => c.status === "scheduled" || c.status === "ongoing");
  const past = (items ?? []).filter((c) => c.status === "completed" || c.status === "cancelled");

  const Card = ({ c, i }: { c: LiveClass; i: number }) => {
    const st = STATUS_CHIP[c.status];
    const d = daysUntil(c.date);
    return (
      <Reveal delay={Math.min(i * 70, 350)}>
        <div className={`panel panel-hover p-5 sm:p-6 ${c.status === "ongoing" ? "border-coral/50 shadow-[0_0_34px_-14px_rgba(255,138,122,0.35)]" : ""}`}>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`chip ${st.cls}`}>{st.label}</span>
            <span className="chip">{c.provider === "jitsi" ? "JITSI MEET" : "GOOGLE MEET"}</span>
            {role === "admin" && courseName && <span className="chip chip-chalk">{courseName(c.courseId)}</span>}
            <span className="ml-auto font-code text-[10.5px] tracking-[0.1em] text-dim">{fmtDuration(c.durationMin).toUpperCase()}</span>
          </div>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-[17px] font-bold leading-snug text-ink">{c.title}</h3>
              {c.description && <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-mute">{c.description}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 font-code text-[11px] tracking-[0.08em] text-dim">
                <span className="flex items-center gap-1.5 text-mute"><IconCalendar size={13} /> {fmtDate(c.date).toUpperCase()}</span>
                <span>{fmtTime(c.time)}</span>
                {c.status === "scheduled" && d >= 0 && (
                  <span className="text-chalk">{d === 0 ? "TODAY" : d === 1 ? "TOMORROW" : `IN ${d} DAYS`}</span>
                )}
              </div>
              {c.status !== "cancelled" && (
                <div className="mt-2 truncate font-code text-[10.5px] text-dim">
                  ROOM · <span className="text-sky">{c.meetingId}</span>
                </div>
              )}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              {c.status === "ongoing" ? (
                <a href={c.meetingLink} target="_blank" rel="noreferrer" className="btn btn-mint !py-2.5 !text-[12px]">
                  <span className="pulse-dot" /> JOIN LIVE
                </a>
              ) : c.status === "scheduled" ? (
                <>
                  <a href={c.meetingLink} target="_blank" rel="noreferrer" className="btn btn-chalk !py-2.5 !text-[12px]">
                    <IconVideo size={14} /> OPEN ROOM
                  </a>
                  <button className="btn btn-ghost !py-2 !text-[10.5px]" onClick={() => downloadIcs(c, courseName ? courseName(c.courseId) : "EduLaunch")}>
                    <IconDownload size={13} /> ADD TO CALENDAR
                  </button>
                </>
              ) : c.status === "completed" && c.recordingUrl ? (
                <a href={c.recordingUrl} target="_blank" rel="noreferrer" className="btn btn-ghost !py-2.5 !text-[12px]">
                  <IconVideo size={14} /> WATCH RECORDING
                </a>
              ) : null}
              {role === "admin" && (
                <div className="mt-1 flex items-center gap-1.5">
                  <select
                    className="select !w-auto !py-1.5 !text-[11px]"
                    value={c.status}
                    onChange={(e) => setStatus(c, e.target.value as LiveStatus)}
                  >
                    {(["scheduled", "ongoing", "completed", "cancelled"] as LiveStatus[]).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button className="rounded-md p-1.5 text-dim transition-colors hover:bg-coral/10 hover:text-coral" title="Delete session" onClick={() => remove(c)}>
                    <IconTrash size={15} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Reveal>
    );
  };

  return (
    <div>
      <div className="label-xs">// live classes {role === "admin" ? "· all courses" : ""}</div>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-[32px] font-extrabold leading-tight tracking-tight text-ink">
          The <span className="text-chalk">blackboard,</span> live.
        </h1>
        {role === "admin" && (
          <button className="btn btn-chalk mb-1.5" onClick={() => setFormOpen((v) => !v)}>
            <IconPlus size={14} sw={2.4} /> SCHEDULE SESSION
          </button>
        )}
      </div>
      <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-mute">
        Meeting rooms are generated automatically when a session is scheduled — valid Jitsi or Google Meet links, plus
        a calendar file for every student.
      </p>

      {/* admin composer */}
      {role === "admin" && formOpen && (
        <div className="panel mt-6 p-5 sm:p-6">
          <div className="label-xs">// new session — room auto-generated on save</div>
          <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label-xs mb-1.5 block">title</label>
              <input className="input" placeholder="e.g. ε–δ Office Hours" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <label className="label-xs mb-1.5 block">description</label>
              <input className="input" placeholder="What will you work through?" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <label className="label-xs mb-1.5 block">course</label>
              <select className="select" value={form.courseId} onChange={(e) => setForm((f) => ({ ...f, courseId: e.target.value }))}>
                <option value="crs_calc">Advanced Calculus & Real Analysis</option>
                <option value="crs_linalg">Linear Algebra, Done Rigorously</option>
              </select>
            </div>
            <div>
              <label className="label-xs mb-1.5 block">provider</label>
              <select className="select" value={form.provider} onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value as MeetingProvider }))}>
                <option value="jitsi">Jitsi Meet (free, self-hosted)</option>
                <option value="gmeet">Google Meet</option>
              </select>
            </div>
            <div>
              <label className="label-xs mb-1.5 block">date</label>
              <input className="input" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-xs mb-1.5 block">time</label>
                <input className="input" type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} />
              </div>
              <div>
                <label className="label-xs mb-1.5 block">minutes</label>
                <input className="input" type="number" min={15} step={15} value={form.durationMin} onChange={(e) => setForm((f) => ({ ...f, durationMin: Number(e.target.value) }))} />
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button className="btn btn-chalk" onClick={create} disabled={busy}>
              {busy ? "GENERATING ROOM…" : "CREATE + GENERATE ROOM"}
            </button>
            <span className="font-code text-[10.5px] tracking-[0.08em] text-dim">
              {form.provider === "jitsi" ? "→ https://meet.jit.si/EduLaunch-…" : "→ https://meet.google.com/xxx-xxxx-xxx"}
            </span>
          </div>
        </div>
      )}

      {/* upcoming */}
      <div className="mt-8">
        <h2 className="font-display text-[15px] font-bold tracking-[0.22em] text-ink">
          <span className="text-chalk">▸</span> UPCOMING & LIVE
        </h2>
        {items === null ? (
          <div className="mt-4 flex flex-col gap-3">
            <div className="skel h-32" />
            <div className="skel h-32" />
          </div>
        ) : upcoming.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-line px-6 py-10 text-center">
            <span className="text-dim"><IconVideo size={26} sw={1.5} /></span>
            <p className="mt-3 font-code text-[11.5px] tracking-[0.14em] text-dim">NO SESSIONS SCHEDULED</p>
            <p className="mt-1 text-[12.5px] text-dim">New live classes appear here the moment they're created.</p>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-3.5">
            {upcoming.map((c, i) => <Card key={c._id} c={c} i={i} />)}
          </div>
        )}
      </div>

      {/* past */}
      {past.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-[15px] font-bold tracking-[0.22em] text-ink">
            <span className="text-chalk">▸</span> ARCHIVE
          </h2>
          <div className="mt-4 flex flex-col gap-3.5 opacity-80">
            {past.map((c, i) => <Card key={c._id} c={c} i={i} />)}
          </div>
        </div>
      )}
    </div>
  );
}
