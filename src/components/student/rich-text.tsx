import katex from "katex";
import "katex/contrib/mhchem";
export function RichText({ text }: { text: string }) {
  return (
    <span className="science-text">
      {text.split(/(\$[^$]+\$)/g).map((part, i) => {
        if (part.startsWith("$") && part.endsWith("$")) {
          const html = katex.renderToString(part.slice(1, -1), {
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
