import type { ReactNode } from "react";

// Essential content must remain visible before hydration and without JavaScript.
export function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
