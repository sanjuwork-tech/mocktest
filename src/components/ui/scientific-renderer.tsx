import React from "react";
import katex from "katex";
import "katex/contrib/mhchem";

type TextRun = { type: "text"; text: string };
type MathRun = { type: "math"; latex: string; spokenText: string };
type Run = TextRun | MathRun;

export type ParagraphBlock = { type: "paragraph"; runs: Run[] };
export type DisplayMathBlock = { type: "display_math"; latex: string; spokenText: string };
export type ImageBlock = { type: "image"; assetId: string; alt: string; caption?: string };
export type TableBlock = { type: "table"; caption: string; headers: Run[][]; rows: Run[][][] };

export type Block = ParagraphBlock | DisplayMathBlock | ImageBlock | TableBlock;

export function ScientificRenderer({ content }: { content: Block[] }) {
  if (!content || !Array.isArray(content)) return null;

  return (
    <div className="scientific-content space-y-4">
      {content.map((block, i) => <BlockRenderer key={i} block={block} />)}
    </div>
  );
}

function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="leading-relaxed">
          {block.runs.map((run, i) => (
            <RunRenderer key={i} run={run} />
          ))}
        </p>
      );
    case "display_math":
      return (
        <div
          className="my-4 flex justify-center overflow-x-auto text-lg"
          aria-label={block.spokenText}
          dangerouslySetInnerHTML={{
            __html: katex.renderToString(block.latex, {
              displayMode: true,
              throwOnError: false,
              trust: false,
              strict: "warn",
              output: "htmlAndMathml",
            }),
          }}
        />
      );
    case "image":
      // In Phase 2/7, assetId might map to an API route or S3 bucket.
      // For now, we will render a placeholder or the actual src if we construct it.
      return (
        <figure className="my-6">
          <img
            src={`/api/assets/${block.assetId}`}
            alt={block.alt}
            className="mx-auto max-w-full rounded-lg border border-slate-200"
          />
          {block.caption && (
            <figcaption className="mt-2 text-center text-sm text-slate-500">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    case "table":
      return (
        <div className="my-6 overflow-x-auto">
          <table className="w-full border-collapse border border-slate-300 text-sm">
            {block.caption && (
              <caption className="mb-2 text-left font-semibold text-slate-700">
                {block.caption}
              </caption>
            )}
            <thead className="bg-slate-50">
              <tr>
                {block.headers.map((headerRuns, i) => (
                  <th key={i} className="border border-slate-300 px-4 py-2 text-left font-semibold">
                    {headerRuns.map((run, j) => <RunRenderer key={j} run={run} />)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  {row.map((cellRuns, j) => (
                    <td key={j} className="border border-slate-300 px-4 py-2">
                      {cellRuns.map((run, k) => <RunRenderer key={k} run={run} />)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return null;
  }
}

function RunRenderer({ run }: { run: Run }) {
  if (run.type === "text") {
    // Basic text, we preserve whitespace optionally but React does it.
    return <span>{run.text}</span>;
  } else if (run.type === "math") {
    return (
      <span
        className="science-formula"
        aria-label={run.spokenText}
        dangerouslySetInnerHTML={{
          __html: katex.renderToString(run.latex, {
            displayMode: false,
            throwOnError: false,
            trust: false,
            strict: "warn",
            output: "htmlAndMathml",
          }),
        }}
      />
    );
  }
  return null;
}
