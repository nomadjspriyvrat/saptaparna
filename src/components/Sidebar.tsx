import type { ComponentType } from "react";
import type { Session } from "../types";
import { initials, levelInfo } from "../util";
import { IconChart, IconFlame, IconLogout, IconRoute, IconTrophy, IconUsers, IconVideo, LogoMark, type IconProps } from "./icons";

interface NavItem {
  view: string;
  label: string;
  Icon: ComponentType<IconProps>;
}

const NAV: Record<"student" | "trainer", NavItem[]> = {
  student: [
    { view: "dashboard", label: "The Track", Icon: IconRoute },
    { view: "leaderboard", label: "Leaderboard", Icon: IconTrophy },
    { view: "progress", label: "My Progress", Icon: IconChart },
    { view: "live", label: "Live Classes", Icon: IconVideo },
  ],
  trainer: [
    { view: "students", label: "Students", Icon: IconUsers },
    { view: "live", label: "Live Classes", Icon: IconVideo },
  ],
};

interface SidebarProps {
  session: Session;
  view: string;
  onNav: (v: string) => void;
  onLogout: () => void;
  xp: number;
  streak: number;
}

export default function Sidebar({ session, view, onNav, onLogout, xp, streak }: SidebarProps) {
  const items = NAV[session.role];
  const activeRoot = view === "module" ? "dashboard" : view === "student-detail" ? "students" : view;
  const li = levelInfo(xp);
  const isStudent = session.role === "student";

  return (
    <aside className="sticky top-0 z-30 flex h-screen w-[74px] shrink-0 flex-col border-r border-line bg-abyss/70 lg:w-[252px]">
      {/* brand */}
      <div className="flex items-center justify-center gap-2.5 px-3 pb-5 pt-6 lg:justify-start lg:px-6">
        <span className="text-amber">
          <LogoMark size={24} sw={2.1} />
        </span>
        <div className="hidden lg:block">
          <div className="font-display text-[13px] font-bold tracking-[0.2em] text-ink">THE TRACK</div>
          <div className="label-xs mt-0.5 text-[9px]!">skill training hub</div>
        </div>
      </div>

      {/* nav */}
      <nav className="flex flex-col gap-1 px-2.5 lg:px-3">
        {items.map(({ view: v, label, Icon }) => {
          const active = activeRoot === v;
          return (
            <button
              key={v}
              onClick={() => onNav(v)}
              title={label}
              className={`group relative flex items-center justify-center gap-3 rounded-lg px-2 py-2.5 text-left font-display text-[12.5px] font-semibold tracking-[0.06em] transition-all duration-200 lg:justify-start lg:px-3.5 ${
                active ? "bg-raise text-amber" : "text-mute hover:bg-panel hover:text-ink"
              }`}
            >
              <span
                className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-amber transition-all duration-200 ${
                  active ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                }`}
              />
              <Icon size={17} sw={active ? 2 : 1.7} className="shrink-0" />
              <span className="hidden lg:inline">{label.toUpperCase()}</span>
            </button>
          );
        })}
      </nav>

      {/* footer */}
      <div className="mt-auto px-2.5 pb-4 lg:px-4 lg:pb-5">
        {/* xp + streak (student, wide) */}
        {isStudent && (
          <div className="mb-3 hidden rounded-lg border border-line bg-panel2/80 p-3 lg:block">
            <div className="flex items-center justify-between">
              <span className="font-display text-[10.5px] font-bold tracking-[0.14em] text-mint">LVL {li.level}</span>
              <span className="font-display text-[10.5px] font-semibold tracking-[0.08em] text-dim">{xp} XP</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line/70">
              <div
                className="h-full rounded-full bg-gradient-to-r from-mint to-amber transition-[width] duration-700 ease-out"
                style={{ width: `${li.pct}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-display text-[9.5px] tracking-[0.1em] text-dim">
                {li.next ? `${li.span - li.into} XP → LVL ${li.level + 1}` : "MAX LEVEL"}
              </span>
              <span className={`flex items-center gap-1 font-display text-[10px] font-bold tracking-[0.08em] ${streak > 0 ? "text-amber" : "text-dim"}`}>
                <IconFlame size={12} sw={2} />
                {streak}D
              </span>
            </div>
          </div>
        )}

        {/* user card — wide */}
        <div className="panel hidden items-center gap-3 p-3 lg:flex">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-display text-[12px] font-bold ${
              isStudent ? "bg-amber/15 text-amber" : "bg-mint/15 text-mint"
            }`}
          >
            {initials(session.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold text-ink">{session.name}</div>
            <div className="truncate font-display text-[10px] tracking-[0.1em] text-dim">
              {isStudent ? session.subject?.name.toUpperCase() : "TRAINER · ALL TRACKS"}
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Sign out"
            className="rounded-md p-1.5 text-dim transition-colors hover:bg-coral/10 hover:text-coral"
          >
            <IconLogout size={16} />
          </button>
        </div>

        {/* user card — compact */}
        <div className="flex flex-col items-center gap-2 lg:hidden">
          <div
            title={session.name}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border border-line font-display text-[11px] font-bold ${
              isStudent ? "bg-amber/15 text-amber" : "bg-mint/15 text-mint"
            }`}
          >
            {initials(session.name)}
          </div>
          <button
            onClick={onLogout}
            title="Sign out"
            className="rounded-md p-1.5 text-dim transition-colors hover:bg-coral/10 hover:text-coral"
          >
            <IconLogout size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
