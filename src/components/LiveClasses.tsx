import { useCallback, useEffect, useState, type FormEvent } from "react";
import * as api from "../api";
import { toast } from "../toast";
import type { LiveClass } from "../types";
import { daysUntil, fmtDate } from "../util";
import Reveal from "./Reveal";
import { IconCalendar, IconClock, IconPlus, IconTrash, IconVideo } from "./icons";

interface LiveClassesProps {
  isTrainer: boolean;
}

export default function LiveClasses({ isTrainer }: LiveClassesProps) {
  const [list, setList] = useState<LiveClass[] | null>(null);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    api.getLiveClasses().then(setList).catch(() => toast("Could not load the schedule", "err"));
  }, []);

  useEffect(refresh, [refresh]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.addLiveClass({ title, date, time, link });
      toast(`Session scheduled — ${title.trim()}`);
      setTitle("");
      setDate("");
      setTime("");
      setLink("");
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add session");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (c: LiveClass) => {
    setRemovingId(c._id);
    try {
      await api.deleteLiveClass(c._id);
      toast(`Removed "${c.title}"`, "info");
      refresh();
    } catch {
      toast("Could not remove session", "err");
    } finally {
      setRemovingId(null);
    }
  };

  const upcoming = (list ?? []).filter((c) => daysUntil(c.date) >= 0);
  const past = (list ?? []).filter((c) => daysUntil(c.date) < 0).reverse();
  const [featured, ...rest] = upcoming;

  return (
    <div>
      <div className="label-xs">// shared schedule · all tracks</div>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-[32px] font-extrabold leading-tight tracking-tight text-ink">
          Live classes<span className="text-amber">.</span>
        </h1>
        <span className="chip chip-amber mb-1.5">
          <IconVideo size={12} /> GOOGLE MEET
        </span>
      </div>

      {/* ---------- trainer: add form ---------- */}
      {isTrainer && (
        <Reveal>
          <form onSubmit={submit} className="panel mt-7 p-6">
            <div className="label-xs mb-4">// schedule a new session</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="input sm:col-span-2"
                placeholder="Session title — e.g. Express Deep Dive"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <div>
                <label className="label-xs mb-1 block">Date</label>
                <input className="input input-mono" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div>
                <label className="label-xs mb-1 block">Time (24h)</label>
                <input className="input input-mono" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
              <input
                className="input sm:col-span-2"
                placeholder="Google Meet link — https://meet.google.com/xxx-yyyy-zzz"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>
            {error && (
              <div className="mt-3 rounded-md border border-coral/40 bg-coral/10 px-3 py-2 font-display text-[12px] text-coral">
                ✕ {error}
              </div>
            )}
            <button type="submit" className="btn btn-amber mt-4" disabled={busy}>
              {busy ? "ADDING…" : "ADD SESSION"} <IconPlus size={14} sw={2.4} />
            </button>
          </form>
        </Reveal>
      )}

      {/* ---------- content ---------- */}
      {list === null ? (
        <div className="mt-7 grid gap-4">
          <div className="skel h-40" />
          <div className="skel h-24" />
          <div className="skel h-24" />
        </div>
      ) : list.length === 0 ? (
        <div className="panel mt-7 p-10 text-center">
          <span className="text-dim">
            <IconCalendar size={30} />
          </span>
          <p className="mt-3 font-display text-[13px] tracking-[0.1em] text-mute">NO SESSIONS SCHEDULED YET</p>
        </div>
      ) : (
        <div className="mt-7 grid gap-4">
          {/* featured / next session */}
          {featured && (
            <Reveal>
              <div className="panel relative overflow-hidden p-6 sm:p-7">
                <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-amber/[0.07] blur-2xl" />
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  <div className="flex shrink-0 flex-col items-center rounded-xl border border-amber/35 bg-amber/[0.06] px-6 py-4">
                    <span className="font-display text-[11px] font-bold tracking-[0.2em] text-amber">
                      {fmtDate(featured.date).split(",")[0].toUpperCase()}
                    </span>
                    <span className="font-display text-[44px] font-extrabold leading-none text-ink">
                      {featured.date.slice(8)}
                    </span>
                    <span className="label-xs mt-1">{fmtDate(featured.date).split(" ")[1]?.toUpperCase()}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="chip chip-amber">
                        {daysUntil(featured.date) === 0
                          ? "TODAY"
                          : daysUntil(featured.date) === 1
                            ? "TOMORROW"
                            : `IN ${daysUntil(featured.date)} DAYS`}
                      </span>
                      <span className="chip">
                        <IconClock size={11} /> {featured.time}
                      </span>
                    </div>
                    <h2 className="mt-2.5 text-[20px] font-bold leading-snug text-ink">{featured.title}</h2>
                    <div className="mt-1.5 truncate font-display text-[12px] text-dim">{featured.link}</div>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <a href={featured.link} target="_blank" rel="noopener noreferrer" className="btn btn-mint">
                        <IconVideo size={15} /> JOIN ON MEET
                      </a>
                      {isTrainer && (
                        <button
                          className="btn btn-coral"
                          onClick={() => remove(featured)}
                          disabled={removingId === featured._id}
                        >
                          <IconTrash size={14} /> {removingId === featured._id ? "…" : "REMOVE"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          )}

          {/* rest upcoming */}
          {rest.map((c, i) => (
            <Reveal key={c._id} delay={i * 60}>
              <div className="panel panel-hover flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <div className="flex w-24 shrink-0 flex-col items-center rounded-lg border border-line bg-panel2 py-2.5">
                  <span className="font-display text-[20px] font-extrabold leading-none text-ink">{c.date.slice(8)}</span>
                  <span className="label-xs mt-1">{fmtDate(c.date).split(" ")[1]?.toUpperCase()}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[15px] font-bold text-ink">{c.title}</span>
                    <span className="chip chip-sky">{fmtDate(c.date)}</span>
                    <span className="chip">
                      <IconClock size={11} /> {c.time}
                    </span>
                  </div>
                  <div className="mt-1 truncate font-display text-[11.5px] text-dim">{c.link}</div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <a href={c.link} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                    <IconVideo size={14} /> JOIN
                  </a>
                  {isTrainer && (
                    <button
                      className="btn btn-coral px-2.5!"
                      title="Remove session"
                      onClick={() => remove(c)}
                      disabled={removingId === c._id}
                    >
                      <IconTrash size={14} />
                    </button>
                  )}
                </div>
              </div>
            </Reveal>
          ))}

          {/* past */}
          {past.length > 0 && (
            <>
              <div className="label-xs mt-4">// ended</div>
              {past.map((c) => (
                <div key={c._id} className="panel flex flex-col gap-3 border-dashed p-5 opacity-60 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[14px] font-semibold text-mute">{c.title}</span>
                      <span className="chip">ENDED</span>
                    </div>
                    <div className="mt-1 font-display text-[11px] text-dim">
                      {fmtDate(c.date)} · {c.time}
                    </div>
                  </div>
                  {isTrainer && (
                    <button
                      className="btn btn-coral px-2.5! shrink-0"
                      title="Remove session"
                      onClick={() => remove(c)}
                      disabled={removingId === c._id}
                    >
                      <IconTrash size={14} />
                    </button>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
