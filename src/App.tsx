import { useCallback, useEffect, useState } from "react";
import * as api from "./api";
import type { ProgressPatch } from "./api";
import Announcements from "./components/Announcements";
import Certificate from "./components/Certificate";
import Dashboard from "./components/Dashboard";
import Leaderboard from "./components/Leaderboard";
import LiveClasses from "./components/LiveClasses";
import LoginGate from "./components/LoginGate";
import ModuleView from "./components/ModuleView";
import ProgressView from "./components/ProgressView";
import Sidebar from "./components/Sidebar";
import StudentDetail from "./components/StudentDetail";
import StudentsList from "./components/StudentsList";
import { Toaster, toast } from "./toast";
import type { Announcement, LiveClass, ModuleDoc, ProgressRow, Session } from "./types";
import { avgQuizOf, streakOf, xpOf } from "./util";

const SESSION_KEY = "track.session.v1";

type View = "dashboard" | "module" | "progress" | "leaderboard" | "live" | "students" | "student-detail";

const loadSession = (): Session | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw) as Session;
  } catch {
    /* ignore */
  }
  return null;
};

function Skeleton() {
  return (
    <div>
      <div className="skel h-4 w-44" />
      <div className="skel mt-4 h-10 w-72" />
      <div className="skel mt-7 h-44" />
      <div className="mt-6 grid gap-4">
        <div className="skel h-32" />
        <div className="skel h-32" />
        <div className="skel h-32" />
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(() => loadSession());
  const [view, setView] = useState<View>(() => (loadSession()?.role === "trainer" ? "students" : "dashboard"));
  const [modules, setModules] = useState<ModuleDoc[] | null>(null);
  const [progress, setProgress] = useState<ProgressRow[] | null>(null);
  const [activity, setActivity] = useState<Record<string, number>>({});
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentModuleId, setCurrentModuleId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [certOpen, setCertOpen] = useState(false);
  const [loadError, setLoadError] = useState("");

  /* load student data on login / restore */
  useEffect(() => {
    if (!session || session.role !== "student" || !session.subject) return;
    let alive = true;
    setModules(null);
    setProgress(null);
    setActivity({});
    setLoadError("");
    (async () => {
      try {
        const [mods, prog, act, lc, ann] = await Promise.all([
          api.getModules(session.subject!.slug),
          api.getProgress(session.id),
          api.getActivity(session.id),
          api.getLiveClasses(),
          api.listAnnouncements(),
        ]);
        if (!alive) return;
        setModules(mods);
        setProgress(prog);
        setActivity(act);
        setLiveClasses(lc);
        setAnnouncements(ann);
      } catch (err) {
        if (alive) {
          setLoadError(err instanceof Error ? err.message : "Could not load your track");
          toast("Could not load your track", "err");
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [session]);

  /* trainers only need the shared board data */
  useEffect(() => {
    if (!session || session.role !== "trainer") return;
    let alive = true;
    api.listAnnouncements().then((a) => alive && setAnnouncements(a)).catch(() => {});
    api.getLiveClasses().then((lc) => alive && setLiveClasses(lc)).catch(() => {});
    return () => {
      alive = false;
    };
  }, [session]);

  const handleLogin = (s: Session) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    setSession(s);
    setView(s.role === "student" ? "dashboard" : "students");
    setCurrentModuleId(null);
    setSelectedStudentId(null);
    setCertOpen(false);
    toast(
      s.role === "student" ? `Welcome, ${s.name} — track loaded: ${s.subject?.name}` : `Coach mode on. Welcome, ${s.name}.`
    );
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    setModules(null);
    setProgress(null);
    setActivity({});
    setAnnouncements([]);
    setLiveClasses([]);
    setCurrentModuleId(null);
    setSelectedStudentId(null);
    setCertOpen(false);
    setView("dashboard");
  };

  const nav = (v: string) => {
    setView(v as View);
    if (v !== "module") setCurrentModuleId(null);
    if (v !== "student-detail") setSelectedStudentId(null);
    setCertOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openModule = (id: string) => {
    setCurrentModuleId(id);
    setView("module");
    window.scrollTo({ top: 0 });
  };

  const refreshProgress = useCallback(async () => {
    if (!session || session.role !== "student") return;
    const prog = await api.getProgress(session.id);
    setProgress(prog);
  }, [session]);

  const patchProgress = useCallback(
    async (moduleId: string, patch: ProgressPatch) => {
      if (!session) throw new Error("No session");
      const updated = await api.patchProgress(session.id, moduleId, patch);
      await refreshProgress();
      /* keep streak / heatmap live */
      api
        .getActivity(session.id)
        .then(setActivity)
        .catch(() => {});
      return updated;
    },
    [session, refreshProgress]
  );

  if (!session) {
    return (
      <>
        <LoginGate onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  const currentModule = modules?.find((m) => m._id === currentModuleId) ?? null;
  const currentRow = progress?.find((p) => p.module === currentModuleId);
  const xp = progress ? xpOf(progress) : 0;
  const streak = streakOf(activity);

  const announcementsProps = {
    authorName: session.name,
    items: announcements,
    onPosted: (a: Announcement) => setAnnouncements((s) => [a, ...s]),
    onDeleted: (id: string) => setAnnouncements((s) => s.filter((x) => x._id !== id)),
  };

  let content: React.ReactNode;
  if (session.role === "student") {
    if (loadError) {
      content = (
        <div className="panel p-10 text-center">
          <p className="font-display text-[13px] tracking-[0.1em] text-coral">✕ {loadError.toUpperCase()}</p>
          <button className="btn btn-amber mt-5" onClick={() => window.location.reload()}>
            RETRY
          </button>
        </div>
      );
    } else if (modules === null || progress === null) {
      content = <Skeleton />;
    } else {
      switch (view) {
        case "module":
          content = currentModule ? (
            <ModuleView
              key={currentModule._id}
              module={currentModule}
              row={currentRow}
              onBack={() => nav("dashboard")}
              onPatch={(patch) => patchProgress(currentModule._id, patch)}
            />
          ) : (
            <Skeleton />
          );
          break;
        case "progress":
          content = (
            <ProgressView modules={modules} progress={progress} activity={activity} onCertificate={() => setCertOpen(true)} />
          );
          break;
        case "leaderboard":
          content = <Leaderboard session={session} />;
          break;
        case "live":
          content = (
            <div className="flex flex-col gap-12">
              <LiveClasses isTrainer={false} />
              <Announcements isTrainer={false} {...announcementsProps} />
            </div>
          );
          break;
        default:
          content = (
            <Dashboard
              session={session}
              modules={modules}
              progress={progress}
              liveClasses={liveClasses}
              announcements={announcements}
              activity={activity}
              onOpenModule={openModule}
              onCertificate={() => setCertOpen(true)}
            />
          );
      }
    }
  } else {
    switch (view) {
      case "student-detail":
        content = selectedStudentId ? (
          <StudentDetail key={selectedStudentId} studentId={selectedStudentId} onBack={() => nav("students")} />
        ) : (
          <StudentsList
            onSelect={(id) => {
              setSelectedStudentId(id);
              setView("student-detail");
              window.scrollTo({ top: 0 });
            }}
          />
        );
        break;
      case "live":
        content = (
          <div className="flex flex-col gap-12">
            <LiveClasses isTrainer={true} />
            <Announcements isTrainer={true} {...announcementsProps} />
          </div>
        );
        break;
      default:
        content = (
          <StudentsList
            onSelect={(id) => {
              setSelectedStudentId(id);
              setView("student-detail");
              window.scrollTo({ top: 0 });
            }}
          />
        );
    }
  }

  return (
    <>
      <div className="flex min-h-screen">
        <Sidebar session={session} view={view} onNav={nav} onLogout={handleLogout} xp={xp} streak={streak} />
        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 lg:py-10">{content}</div>
        </main>
      </div>

      {certOpen && session.role === "student" && progress && (
        <Certificate
          name={session.name}
          subjectName={session.subject?.name ?? ""}
          modulesCount={modules?.length ?? 0}
          avgQuiz={avgQuizOf(progress)}
          onClose={() => setCertOpen(false)}
        />
      )}

      <Toaster />
    </>
  );
}
