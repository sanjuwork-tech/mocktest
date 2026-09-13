import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  copy,
  children,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  children?: ReactNode;
}) {
  return (
    <section className="overflow-hidden border-b border-navy/10 py-20 sm:py-28">
      <div className="page-shell grid items-end gap-10 lg:grid-cols-[1.2fr_.8fr]">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="max-w-4xl font-display text-[clamp(4.2rem,9vw,8.4rem)] font-semibold leading-[.82] tracking-[-.075em]">
            {title}
          </h1>
        </div>
        <div>
          <p className="max-w-lg text-base leading-8 text-navy/58">{copy}</p>
          {children}
        </div>
      </div>
    </section>
  );
}
