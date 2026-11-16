import Link from "next/link";
import { Fragment } from "react";
import { siteConfig } from "@/data/catalog";
import { JsonLd } from "@/components/json-ld";

type Faq = { q: string; a: string };
type Crumb = { name: string; href: string };

/** Visible breadcrumb for the notes pages; the last crumb is the current page. */
export function Crumbs({ trail }: { trail: Crumb[] }) {
  const all = [{ name: "Home", href: "/" }, ...trail];
  return (
    <nav aria-label="Breadcrumb" className="exam-breadcrumb">
      {all.map((c, i) => (
        <Fragment key={c.href}>
          {i > 0 && <span aria-hidden="true">/</span>}
          {i === all.length - 1 ? <span aria-current="page">{c.name}</span> : <Link href={c.href}>{c.name}</Link>}
        </Fragment>
      ))}
    </nav>
  );
}

/** BreadcrumbList + FAQPage (matching the visible FAQ) plus any page-specific nodes, as one JSON-LD graph. */
export function NotesJsonLd({ trail, faqs, nodes }: { trail: Crumb[]; faqs?: Faq[]; nodes: Record<string, unknown>[] }) {
  const all = [{ name: "Home", href: "/" }, ...trail];
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          ...nodes,
          {
            "@type": "BreadcrumbList",
            itemListElement: all.map((c, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: c.name,
              item: `${siteConfig.url}${c.href === "/" ? "" : c.href}`,
            })),
          },
          ...(faqs
            ? [{ "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }]
            : []),
        ],
      }}
    />
  );
}

export function Faqs({ title, faqs }: { title: string; faqs: Faq[] }) {
  return (
    <section className="exam-faqs nt-faq" aria-labelledby="nt-faq-title">
      <h2 id="nt-faq-title">{title}</h2>
      {faqs.map((f) => (
        <details key={f.q}>
          <summary>{f.q}</summary>
          <p>{f.a}</p>
        </details>
      ))}
    </section>
  );
}
