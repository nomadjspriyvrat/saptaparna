import { useState } from "react";
import Auth, { type AuthMode } from "./components/Auth";
import Landing from "./components/Landing";
import StudentApp from "./components/StudentApp";
import AdminApp from "./components/admin/AdminApp";
import { Toaster } from "./toast";
import type { Session } from "./types";

const SESSION_KEY = "edulaunch.session.v1";

const loadSession = (): Session | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw) as Session;
  } catch {
    /* ignore */
  }
  return null;
};

export default function App() {
  const [session, setSession] = useState<Session | null>(() => loadSession());
  const [auth, setAuth] = useState<{ open: boolean; mode: AuthMode }>({ open: false, mode: "trial" });

  const handleAuthed = (s: Session) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    setSession(s);
    setAuth({ open: false, mode: "trial" });
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  };

  if (!session) {
    return (
      <>
        <Landing
          onTrial={() => setAuth({ open: true, mode: "trial" })}
          onSignIn={() => setAuth({ open: true, mode: "signin" })}
          onTrainer={() => setAuth({ open: true, mode: "trainer" })}
        />
        {auth.open && (
          <Auth
            mode={auth.mode}
            onClose={() => setAuth((a) => ({ ...a, open: false }))}
            onAuthed={handleAuthed}
            onSwitchMode={(m) => setAuth({ open: true, mode: m })}
          />
        )}
        <Toaster />
      </>
    );
  }

  return (
    <>
      {session.role === "student" ? (
        <StudentApp key={session.id} session={session} onLogout={handleLogout} />
      ) : (
        <AdminApp key={session.id} session={session} onLogout={handleLogout} />
      )}
      <Toaster />
    </>
  );
}
