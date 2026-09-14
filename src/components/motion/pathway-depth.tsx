"use client";

import { useEffect, useRef } from "react";

export function PathwayDepth() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const media = matchMedia(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
    );
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    let generation = 0;
    const update = async () => {
      const current = ++generation;
      cleanup?.();
      cleanup = undefined;
      if (!media.matches || connection?.saveData) return;
      const { mountPathwayScene } = await import("./pathway-scene");
      if (disposed || current !== generation || !media.matches) return;
      cleanup = mountPathwayScene(element);
    };
    const change = () => {
      void update().catch(() => {
        /* Keep the SVG fallback. */
      });
    };
    media.addEventListener("change", change);
    change();
    return () => {
      disposed = true;
      generation++;
      media.removeEventListener("change", change);
      cleanup?.();
    };
  }, []);
  return (
    <div className="pathway-depth" ref={host} aria-hidden="true">
      <svg className="pathway-depth-fallback" viewBox="0 0 160 160" fill="none">
        <ellipse
          cx="80"
          cy="80"
          rx="62"
          ry="25"
          stroke="#1F5EFF"
          strokeWidth="2"
          transform="rotate(-35 80 80)"
        />
        <ellipse
          cx="80"
          cy="80"
          rx="62"
          ry="25"
          stroke="#071A4D"
          strokeWidth="2"
          transform="rotate(35 80 80)"
        />
        <circle cx="80" cy="80" r="12" fill="#B8FF34" />
        <circle cx="128" cy="43" r="5" fill="#FF826C" />
      </svg>
    </div>
  );
}
