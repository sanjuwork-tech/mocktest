"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Enhance already-visible server content; animation never gates reading or navigation.
export function PageMotion() {
  const pathname = usePathname();
  useEffect(() => {
    if (!["/", "/exams", "/test-series", "/about"].includes(pathname)) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let observer: IntersectionObserver | undefined;
    const animations = new Set<{ revert: () => void }>();
    const reset = () => {
      observer?.disconnect();
      animations.forEach((animation) => animation.revert());
      animations.clear();
    };
    const start = async () => {
      reset();
      if (preference.matches) return;
      const { animate, stagger } = await import("animejs");
      if (disposed || preference.matches) return;
      const main = document.getElementById("main-content");
      if (!main) return;
      const enter = (element: Element) => {
        // Never animate a focused control or move the user's active reading position.
        if (element.contains(document.activeElement)) return;
        animations.add(
          animate(element, {
            translateY: [14, 0],
            duration: 600,
            ease: "out(3)",
          }),
        );
      };
      const hero = main.querySelector(".home-hero, .guide-hero");
      if (hero)
        animations.add(
          animate(Array.from(hero.children), {
            translateY: [12, 0],
            duration: 650,
            delay: stagger(75),
            ease: "out(3)",
          }),
        );
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries)
            if (entry.isIntersecting) {
              enter(entry.target);
              observer?.unobserve(entry.target);
            }
        },
        { threshold: 0.08 },
      );
      main.querySelectorAll(":scope > section").forEach((section) => {
        if (
          section !== hero &&
          section.getBoundingClientRect().top >= innerHeight
        )
          observer!.observe(section);
      });
    };
    const change = () => {
      void start().catch(reset);
    };
    preference.addEventListener("change", change);
    change();
    return () => {
      disposed = true;
      preference.removeEventListener("change", change);
      reset();
    };
  }, [pathname]);
  return null;
}
