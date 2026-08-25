import { useState } from "react";
import * as api from "../api";
import { toast } from "../toast";
import type { Announcement } from "../types";
import { ago } from "../util";
import Reveal from "./Reveal";
import { IconMegaphone, IconTrash } from "./icons";

interface AnnouncementsProps {
  isTrainer: boolean;
  authorName: string;
  items: Announcement[];
  onPosted: (a: Announcement) => void;
  onDeleted: (id: string) => void;
}

export default function Announcements({ isTrainer, authorName, items, onPosted, onDeleted }: AnnouncementsProps) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const post = async () => {
    setBusy(true);
    try {
      const rec = await api.addAnnouncement(text, authorName);
      onPosted(rec);
      setText("");
      toast("Notice posted to the board");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not post", "err");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (a: Announcement) => {
    setDeleting(a._id);
    try {
      await api.deleteAnnouncement(a._id);
      onDeleted(a._id);
      toast("Notice removed", "info");
    } catch {
      toast("Could not remove notice", "err");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <section>
      <div className="flex items-center gap-3">
        <h2 className="font-display text-[15px] font-bold tracking-[0.22em] text-ink">
          <span className="text-amber">▸</span> NOTICE BOARD
        </h2>
        <span className="chip">{items.length} POSTED</span>
      </div>
      <p className="mt-2 text-[13px] text-mute">
        Cohort-wide updates from the coaching team — schedule changes, office hours, prep notes.
      </p>

      {/* trainer composer */}
      {isTrainer && (
        <div className="panel mt-5 p-5">
          <div className="label-xs">// post a notice</div>
          <textarea
            className="textarea mt-3 min-h-[84px] resize-y"
            placeholder="e.g. Thursday's Express session moves to 19:00 — same Meet link."
            value={text}
            maxLength={400}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="mt-3 flex items-center gap-3">
            <button className="btn btn-amber" onClick={post} disabled={busy || text.trim().length === 0}>
              {busy ? "POSTING…" : "POST TO BOARD"}
            </button>
            <span className="font-display text-[10.5px] tracking-[0.08em] text-dim">{text.length}/400</span>
          </div>
        </div>
      )}

      {/* list */}
      {items.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-line px-6 py-10 text-center">
          <span className="text-dim">
            <IconMegaphone size={26} sw={1.5} />
          </span>
          <p className="mt-3 font-display text-[11.5px] tracking-[0.14em] text-dim">NO NOTICES YET</p>
          <p className="mt-1 text-[12.5px] text-dim">Session updates and coaching notes land here.</p>
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-3">
          {items.map((a, i) => (
            <Reveal key={a._id} delay={Math.min(i * 60, 240)}>
              <div className="panel panel-hover flex items-start gap-4 border-l-[3px] border-l-amber/70 p-4 sm:p-5">
                <span className="mt-0.5 shrink-0 text-amber">
                  <IconMegaphone size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] leading-relaxed text-ink">{a.text}</p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <span className="chip chip-amber">{a.author}</span>
                    <span className="font-display text-[10.5px] tracking-[0.1em] text-dim">{ago(a.at).toUpperCase()}</span>
                  </div>
                </div>
                {isTrainer && (
                  <button
                    className="shrink-0 rounded-md p-1.5 text-dim transition-colors hover:bg-coral/10 hover:text-coral"
                    title="Delete notice"
                    onClick={() => remove(a)}
                    disabled={deleting === a._id}
                  >
                    <IconTrash size={15} />
                  </button>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
