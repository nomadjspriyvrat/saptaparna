import { useCallback, useEffect, useState } from "react";
import * as api from "../api";
import { toast } from "../toast";
import type { StudentSummary } from "../types";
import { initials, joinedAgo } from "../util";
import Reveal from "./Reveal";
import { IconArrowRight, IconSearch, IconUsers } from "./icons";

interface StudentsListProps {
  onSelect: (id: string) => void;
}

export default function StudentsList({ onSelect }: StudentsListProps) {
  const [list, setList] = useState<StudentSummary[] | null>(null);
  const [query, setQuery] = useState("");

  const refresh = useCallback(() => {
    api.listStudents().then(setList).catch(() => toast("Could not load students", "err"));
  }, []);

  useEffect(refresh, [refresh]);

  const q = query.trim().toLowerCase();
  const filtered = (list ?? []).filter(
    (s) => !q || s.name.toLowerCase().includes(q) || s.subject.name.toLowerCase().includes(q)
  );
  const trackCount = new Set((list ?? []).map((s) => s.subject.slug)).size;
  const avgPct =
    list && list.length
      ? Math.round(list.reduce((acc, s) => acc + (s.totalModules ? (s.modulesDone / s.totalModules) * 100 : 0), 0) / list.length)
      : 0;

  return (
    <div>
      <div className="label-xs">// coach board · all tracks</div>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-[32px] font-extrabold leading-tight tracking-tight text-ink">
          Every student<span className="text-amber">, every track.</span>
        </h1>
      </div>

      {/* stats */}
      <div className="mt-7 grid grid-cols-3 gap-4">
        {[
          { n: list === null ? "…" : String(list.length), l: "students", c: "text-ink" },
          { n: list === null ? "…" : String(trackCount), l: "active tracks", c: "text-amber" },
          { n: list === null ? "…" : `${avgPct}%`, l: "avg completion", c: "text-mint" },
        ].map((s) => (
          <div key={s.l} className="panel p-5">
            <div className={`font-display text-[26px] font-extrabold leading-none ${s.c}`}>{s.n}</div>
            <div className="label-xs mt-2">{s.l}</div>
          </div>
        ))}
      </div>

      {/* search */}
      <div className="relative mt-6">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-dim">
          <IconSearch size={16} />
        </span>
        <input
          className="input pl-10!"
          placeholder="Search by name or track…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* list */}
      {list === null ? (
        <div className="mt-5 grid gap-3">
          <div className="skel h-20" />
          <div className="skel h-20" />
          <div className="skel h-20" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="panel mt-5 p-10 text-center">
          <span className="text-dim">
            <IconUsers size={30} />
          </span>
          <p className="mt-3 font-display text-[12.5px] tracking-[0.12em] text-mute">
            {list.length === 0 ? "NO STUDENTS HAVE LOGGED IN YET" : "NO MATCHES FOR THAT SEARCH"}
          </p>
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-3">
          {filtered.map((s, i) => {
            const pct = s.totalModules ? Math.round((s.modulesDone / s.totalModules) * 100) : 0;
            return (
              <Reveal key={s._id} delay={Math.min(i * 50, 250)}>
                <button
                  onClick={() => onSelect(s._id)}
                  className="panel panel-hover group flex w-full items-center gap-4 p-4 text-left sm:gap-5"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-raise font-display text-[13px] font-bold text-amber2">
                    {initials(s.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-[15px] font-bold text-ink transition-colors group-hover:text-amber2">
                        {s.name}
                      </span>
                      <span className="chip">{s.subject.name}</span>
                    </div>
                    <div className="mt-1 font-display text-[10.5px] tracking-[0.1em] text-dim">
                      JOINED {joinedAgo(s.createdAt).toUpperCase()}
                    </div>
                  </div>
                  <div className="hidden w-36 shrink-0 sm:block">
                    <div className="h-1.5 overflow-hidden rounded-full bg-line/70">
                      <div
                        className={`h-full rounded-full transition-[width] duration-700 ${pct === 100 ? "bg-mint" : "bg-amber"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className={`font-display text-[17px] font-extrabold leading-none ${pct === 100 ? "text-mint" : "text-ink"}`}>
                      {pct}%
                    </div>
                    <div className="font-display text-[9.5px] tracking-[0.1em] text-dim">
                      {s.modulesDone}/{s.totalModules} MODULES
                    </div>
                  </div>
                  <span className="shrink-0 text-dim transition-all duration-200 group-hover:translate-x-1 group-hover:text-amber">
                    <IconArrowRight size={17} />
                  </span>
                </button>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
