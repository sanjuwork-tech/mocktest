import katex from "katex";
import "katex/contrib/mhchem";
import { normalizeMathText } from "@/lib/student/math-cleaner";

export function RichText({ text }: { text: string }) {
  if (!text) return null;
  const clean = normalizeMathText(text);

  return (
    <span className="science-text">
      {clean.split(/(\$[^$]+\$)/g).map((part, i) => {
        if (part.startsWith("$") && part.endsWith("$")) {
          const inner = part.slice(1, -1).trim();

          // Defensive safety net: if a token has multiple English words, avoid math italic cramming
          const words = inner.split(/\s+/).filter((w) => /^[a-zA-Z]{2,}$/.test(w));
          if (words.length >= 2) {
            return <span key={i}>{inner}</span>;
          }

          const html = katex.renderToString(inner, {
            throwOnError: false,
            trust: false,
            strict: "warn",
            output: "htmlAndMathml",
            maxExpand: 500,
          });
          return (
            <span
              className="science-formula"
              key={i}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}
