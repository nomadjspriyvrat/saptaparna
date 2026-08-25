import { useEffect, useState } from "react";

const SCRAMBLE_CHARS = "!<>-_\\/[]{}=+*^?#";

/** Decode-scramble a string into place. Honors prefers-reduced-motion. */
export function useScramble(text: string, duration = 850): string {
  const [out, setOut] = useState(text);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOut(text);
      return;
    }
    let frame = 0;
    const total = Math.max(1, Math.round(duration / 38));
    const id = window.setInterval(() => {
      frame += 1;
      const reveal = Math.floor((frame / total) * text.length);
      let s = "";
      for (let i = 0; i < text.length; i++) {
        if (i < reveal || text[i] === " ") s += text[i];
        else s += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }
      setOut(s);
      if (frame >= total) {
        setOut(text);
        window.clearInterval(id);
      }
    }, 38);
    return () => window.clearInterval(id);
  }, [text, duration]);

  return out;
}

/** Ticking clock — re-renders every `ms` and returns current epoch ms. */
export function useNow(ms = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return now;
}

/** Typed terminal lines: returns how many lines are visible. */
export function useTypedLineCount(total: number, stepMs = 420): number {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(total);
      return;
    }
    setN(0);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setN(i);
      if (i >= total) window.clearInterval(id);
    }, stepMs);
    return () => window.clearInterval(id);
  }, [total, stepMs]);

  return n;
}
