import { useEffect, useState, type ReactNode } from "react";
import { clamp } from "../util";

interface RingProps {
  value: number; // 0–100
  size?: number;
  stroke?: number;
  color?: string;
  children?: ReactNode;
}

export default function Ring({
  value,
  size = 132,
  stroke = 10,
  color = "var(--color-mint)",
  children,
}: RingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [off, setOff] = useState(c);

  useEffect(() => {
    const target = c - (clamp(value, 0, 100) / 100) * c;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOff(target);
      return;
    }
    const t = window.setTimeout(() => setOff(target), 80);
    return () => window.clearTimeout(t);
  }, [value, c]);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--color-line)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}
