import { useCallback, useEffect, useState } from "react";
import * as api from "./api";
import type { ProgressPatch } from "./api";
import Dashboard from "./components/Dashboard";
import LiveClasses from "./components/LiveClasses";
import LoginGate from "./components/LoginGate";
import ModuleView from "./components/ModuleView";
import ProgressView from "./components/ProgressView";
import Sidebar from "./components/Sidebar";
import StudentDetail from "./components/StudentDetail";
import StudentsList from "./components/StudentsList";
import { Toaster, toast } from "./toast";
import type { ModuleDoc, ProgressRow, Session } from "./types";

const SESSION_KEY = "track.session.v1";

type View = "dashboard" | "module" | "progress" | "live" | "students" | "student-detail";

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
  const [currentModuleId, setCurrentModuleId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState("");

  /* load student data on login / restore */
  useEffect(() => {
    if (!session || session.role !== "student" || !session.subject) return;
    let alive = true;
    setModules(null);
    setProgress(null);
    setLoadError("");
    (async () => {
      try {
        const [mods, prog] = await Promise.all([
          api.getModules(session.subject!.slug),
          api.getProgress(session.id),
        ]);
        if (!alive) return;
        setModules(mods);
        setProgress(prog);
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

  const handleLogin = (s: Session) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    setSession(s);
    setView(s.role === "student" ? "dashboard" : "students");
    setCurrentModuleId(null);
    setSelectedStudentId(null);
    toast(
      s.role === "student" ? `Welcome, ${s.name} — track loaded: ${s.subject?.name}` : `Coach mode on. Welcome, ${s.name}.`
    );
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    setModules(null);
    setProgress(null);
    setCurrentModuleId(null);
    setSelectedStudentId(null);
    setView("dashboard");
  };

  const nav = (v: string) => {
    setView(v as View);
    if (v !== "module") setCurrentModuleId(null);
    if (v !== "student-detail") setSelectedStudentId(null);
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
          content = <ProgressView modules={modules} progress={progress} />;
          break;
        case "live":
          content = <LiveClasses isTrainer={false} />;
          break;
        default:
          content = <Dashboard session={session} modules={modules} progress={progress} onOpenModule={openModule} />;
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
        content = <LiveClasses isTrainer={true} />;
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
        <Sidebar session={session} view={view} onNav={nav} onLogout={handleLogout} />
        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 lg:py-10">{content}</div>
        </main>
      </div>
      <Toaster />
    </>
  );
}
