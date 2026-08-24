import type { ComponentType } from "react";
import type { Session } from "../types";
import { initials } from "../util";
import { IconChart, IconLogout, IconRoute, IconUsers, IconVideo, LogoMark, type IconProps } from "./icons";

interface NavItem {
  view: string;
  label: string;
  Icon: ComponentType<IconProps>;
}

const NAV: Record<"student" | "trainer", NavItem[]> = {
  student: [
    { view: "dashboard", label: "The Track", Icon: IconRoute },
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
}

export default function Sidebar({ session, view, onNav, onLogout }: SidebarProps) {
  const items = NAV[session.role];
  const activeRoot = view === "module" ? "dashboard" : view === "student-detail" ? "students" : view;

  return (
    <>
      {/* ---------- desktop rail ---------- */}
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-line bg-abyss/70 md:flex">
        <div className="flex items-center gap-2.5 px-6 pb-6 pt-7">
          <span className="text-amber">
            <LogoMark size={24} sw={2.1} />
          </span>
          <div>
            <div className="font-display text-[13px] font-bold tracking-[0.2em] text-ink">THE TRACK</div>
            <div className="label-xs mt-0.5 text-[9px]!">skill training hub</div>
          </div>
        </div>

        <nav className="flex flex-col gap-1 px-3">
          {items.map(({ view: v, label, Icon }) => {
            const active = activeRoot === v;
            return (
              <button
                key={v}
                onClick={() => onNav(v)}
                className={`group relative flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-left font-display text-[12.5px] font-semibold tracking-[0.06em] transition-all duration-200 ${
                  active ? "bg-raise text-amber" : "text-mute hover:bg-panel hover:text-ink"
                }`}
              >
                <span
                  className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-amber transition-all duration-200 ${
                    active ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                  }`}
                />
                <Icon size={17} sw={active ? 2 : 1.7} />
                {label.toUpperCase()}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto px-4 pb-5">
          <div className="panel flex items-center gap-3 p-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-display text-[12px] font-bold ${
                session.role === "student" ? "bg-amber/15 text-amber" : "bg-mint/15 text-mint"
              }`}
            >
              {initials(session.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold text-ink">{session.name}</div>
              <div className="truncate font-display text-[10px] tracking-[0.1em] text-dim">
                {session.role === "student" ? session.subject?.name.toUpperCase() : "TRAINER · ALL TRACKS"}
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
        </div>
      </aside>

      {/* ---------- mobile top bar ---------- */}
      <div className="sticky top-0 z-40 border-b border-line bg-void/90 backdrop-blur-md md:hidden">
        <div className="flex items-center justify-between px-4 pt-3">
          <div className="flex items-center gap-2">
            <span className="text-amber">
              <LogoMark size={20} sw={2.1} />
            </span>
            <span className="font-display text-[12px] font-bold tracking-[0.2em] text-ink">THE TRACK</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`chip ${session.role === "student" ? "chip-amber" : "chip-mint"}`}>{session.role}</span>
            <button
              onClick={onLogout}
              title="Sign out"
              className="rounded-md p-1.5 text-dim transition-colors hover:bg-coral/10 hover:text-coral"
            >
              <IconLogout size={16} />
            </button>
          </div>
        </div>
        <div className="flex gap-1 overflow-x-auto px-3 py-2">
          {items.map(({ view: v, label, Icon }) => (
            <button
              key={v}
              onClick={() => onNav(v)}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 font-display text-[11px] font-semibold tracking-[0.06em] transition-colors ${
                activeRoot === v ? "bg-raise text-amber" : "text-mute"
              }`}
            >
              <Icon size={14} />
              {label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
