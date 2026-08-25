import { useEffect, useState } from "react";

type Kind = "ok" | "err" | "info";
interface ToastItem {
  id: number;
  msg: string;
  kind: Kind;
}

let listeners: Array<(t: ToastItem) => void> = [];
let counter = 0;

export function toast(msg: string, kind: Kind = "ok") {
  const t: ToastItem = { id: ++counter, msg, kind };
  listeners.forEach((l) => l(t));
}

const BORDER: Record<Kind, string> = {
  ok: "var(--color-mint)",
  err: "var(--color-coral)",
  info: "var(--color-amber)",
};

const DOT: Record<Kind, string> = {
  ok: "▸ ok",
  err: "▸ err",
  info: "▸ info",
};

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const on = (t: ToastItem) => {
      setItems((s) => [...s.slice(-3), t]);
      window.setTimeout(() => setItems((s) => s.filter((i) => i.id !== t.id)), 3600);
    };
    listeners.push(on);
    return () => {
      listeners = listeners.filter((l) => l !== on);
    };
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-[70] flex w-[min(360px,calc(100vw-2.5rem))] flex-col gap-2">
      {items.map((t) => (
        <div key={t.id} className="toast-item flex items-start gap-3" style={{ borderLeftColor: BORDER[t.kind] }}>
          <span
            className="mt-[1px] shrink-0 text-[10px] font-bold tracking-[0.14em]"
            style={{ color: BORDER[t.kind] }}
          >
            {DOT[t.kind]}
          </span>
          <span className="text-[12.5px] leading-snug text-ink">{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
