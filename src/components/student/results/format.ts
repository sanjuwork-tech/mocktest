import type { CSSProperties } from "react";

/** "45s" or "1m 05s". */
export const fmt = (ms: number) => {
  const s = Math.round(ms / 1000);
  return s >= 60 ? `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s` : `${s}s`;
};

/** Minutes for long spans: "38 min", or "4.5 min" under ten. */
export const fmtMin = (ms: number) => {
  const m = ms / 60000;
  return `${m >= 10 ? Math.round(m) : Math.round(m * 10) / 10} min`;
};

/** Signed marks with a real minus sign: "+5", "−3", "0". */
export const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : "0");

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** Passes dynamic numbers to CSS as custom properties, the only inline style the project allows. */
export const vars = (o: Record<string, string | number>) => o as CSSProperties;

export const clamp = (n: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, n));
