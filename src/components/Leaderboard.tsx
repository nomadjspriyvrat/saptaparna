import { useEffect, useState } from "react";
import * as api from "../api";
import { toast } from "../toast";
import type { Session, StudentSummary } from "../types";
import { initials } from "../util";
import Reveal from "./Reveal";
import { IconTrophy } from "./icons";

interface Ranked extends StudentSummary {
  pct: number;
}

const RANK_STYLE = [
  { ring: "border-amber/60", text: "text-amber", bg: "bg-amber/10", bar: "bg-amber/70", label: "GOLD" },
  { ring: "border-sky/60", text: "text-sky", bg: "bg-sky/10", bar: "bg-sky/70", label: "SILVER" },
  { ring: "border-coral/60", text: "text-coral", bg: "bg-coral/10", bar: "bg-coral/70", label: "BRONZE" },
];

export default function Leaderboard({ session }: { session: Session }) {
  const [rows, setRows] = useState<Ranked[] | null>(null);

  useEffect(() => {
    let alive = true;
    api
      .listStudents()
      .then((all) => {
        if (!alive) return;
        const mine = all
          .filter((s) => s.subject.slug === session.subject?.slug)
          .map((s) => ({ ...s, pct: s.totalModules ? Math.round((s.modulesDone / s.totalModules) * 100) : 0 }))
          .sort((a, b) => b.pct - a.pct || (b.avgQuiz ?? -1) - (a.avgQuiz ?? -1) || a.name.localeCompare(b.name));
        setRows(mine);
      })
      .catch(() => alive && toast("Could not load leaderboard", "err"));
    return () => {
      alive = false;
    };
  }, [session.subject?.slug]);

  const myRank = (rows ?? []).findIndex((r) => r._id === session.id) + 1;
  const podium = (rows ?? []).slice(0, 3);
  const rest = (rows ?? []).slice(3);

  return (
    <div>
      <div className="label-xs">// leaderboard · {session.subject?.name}</div>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-[32px] font-extrabold leading-tight tracking-tight text-ink sm:text-[40px]">
          Top of <span className="text-amber">the track.</span>
        </h1>
        {myRank > 0 && (
          <span className={`chip mb-1.5 ${myRank === 1 ? "chip-amber" : myRank <= 3 ? "chip-sky" : ""}`}>
            <IconTrophy size={12} /> YOU'RE #{myRank}
          </span>
        )}
      </div>
      <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-mute">
        Ranked across everyone on this track — completed modules first, average quiz score as the tiebreaker.
      </p>

      {rows === null ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="skel h-44" />
          <div className="skel h-44" />
          <div className="skel h-44" />
        </div>
      ) : rows.length <= 1 ? (
        <div className="panel mt-8 px-6 py-12 text-center">
          <span className="text-amber">
            <IconTrophy size={30} sw={1.5} />
          </span>
          <p className="mt-3 font-display text-[12.5px] font-bold tracking-[0.16em] text-ink">FIRST ON THE TRACK</p>
          <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-mute">
            No one else has joined this subject yet — you hold #1 by default. It only gets competitive from here.
          </p>
        </div>
      ) : (
        <>
          {/* podium */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {podium.map((r, i) => {
              const st = RANK_STYLE[i];
              const me = r._id === session.id;
              return (
                <Reveal key={r._id} delay={i * 90}>
                  <div
                    className={`panel panel-hover relative overflow-hidden p-5 ${st.ring} border ${
                      i === 0 ? "sm:-translate-y-2" : ""
                    }`}
                  >
                    <div className={`absolute -right-3 -top-5 font-display text-[76px] font-extrabold leading-none opacity-[0.08] ${st.text}`}>
                      {i + 1}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl font-display text-[14px] font-extrabold ${st.bg} ${st.text}`}>
                        {initials(r.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-[15px] font-bold text-ink">
                          {r.name} {me && <span className="chip chip-amber ml-1">YOU</span>}
                        </div>
                        <div className={`font-display text-[10px] font-bold tracking-[0.16em] ${st.text}`}>
                          #{i + 1} · {st.label}
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 flex items-end justify-between">
                      <div>
                        <div className="font-display text-[30px] font-extrabold leading-none text-ink">{r.pct}%</div>
                        <div className="label-xs mt-1.5">track complete</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-display text-[16px] font-bold leading-none ${st.text}`}>
                          {r.avgQuiz == null ? "—" : `${r.avgQuiz}%`}
                        </div>
                        <div className="label-xs mt-1.5">avg quiz</div>
                      </div>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line/70">
                      <div className={`h-full rounded-full ${st.bar}`} style={{ width: `${r.pct}%` }} />
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* rest of the pack */}
          {rest.length > 0 && (
            <div className="mt-6 flex flex-col gap-2.5">
              {rest.map((r, i) => {
                const me = r._id === session.id;
                return (
                  <Reveal key={r._id} delay={Math.min(i * 50, 250)}>
                    <div className={`panel flex items-center gap-4 p-4 ${me ? "border-amber/45" : ""}`}>
                      <span className="w-8 shrink-0 text-center font-display text-[15px] font-extrabold text-dim">
                        {i + 4}
                      </span>
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-panel2 font-display text-[11px] font-bold text-mute">
                        {initials(r.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-[13.5px] font-semibold text-ink">{r.name}</span>
                          {me && <span className="chip chip-amber">YOU</span>}
                        </div>
                        <div className="mt-1.5 flex items-center gap-3">
                          <div className="h-1.5 max-w-[220px] flex-1 overflow-hidden rounded-full bg-line/70">
                            <div className="h-full rounded-full bg-gradient-to-r from-amber to-mint" style={{ width: `${r.pct}%` }} />
                          </div>
                          <span className="font-display text-[10.5px] font-bold tracking-[0.08em] text-mute">{r.pct}%</span>
                        </div>
                      </div>
                      <div className="hidden shrink-0 gap-2 sm:flex">
                        <span className="chip">{r.modulesDone}/{r.totalModules} MOD</span>
                        <span className="chip chip-sky">QUIZ {r.avgQuiz == null ? "—" : `${r.avgQuiz}%`}</span>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
