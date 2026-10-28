"use client";

import { useState } from "react";
import Image from "next/image";
import { ExternalLink, MapPin } from "lucide-react";
import { collegesData, COLLEGES_CHECKED_ON, NIRF_SOURCE } from "@/data/colleges";
import type { ExamKey } from "@/data/catalog";

type Props = {
  examSlug?: ExamKey;
  heading?: string;
  subheading?: string;
  showFilters?: boolean;
};

const FILTERS: { id: "all" | ExamKey; label: string }[] = [
  { id: "all", label: "All" },
  { id: "cuet-ug", label: "CUET UG" },
  { id: "iiser-iat", label: "IISER IAT" },
  { id: "niser-nest", label: "NEST" },
  { id: "comedk", label: "COMEDK" },
];

const EXAM_LABEL: Record<ExamKey, string> = {
  "cuet-ug": "CUET UG",
  "iiser-iat": "IISER IAT",
  "niser-nest": "NEST",
  comedk: "COMEDK UGET",
};

export function CollegesShowcase({
  examSlug,
  heading = "Institutes and the exams that lead to them",
  subheading = "Verified admission routes, official NIRF 2025 rankings and links to each institute's website.",
  showFilters = true,
}: Props) {
  const [selected, setSelected] = useState<"all" | ExamKey>(examSlug ?? "all");
  const active = examSlug ?? selected;
  const colleges = collegesData.filter((c) => active === "all" || c.examSlug === active);

  return (
    <section className="section-space colleges-showcase" aria-labelledby="colleges-heading">
      <div className="section-heading">
        <div>
          <h2 id="colleges-heading">{heading}</h2>
          <p className="section-copy">{subheading}</p>
        </div>
      </div>

      {!examSlug && showFilters && (
        <div className="college-filters" role="group" aria-label="Filter by exam">
          {FILTERS.map((f) => (
            <button key={f.id} aria-pressed={selected === f.id} onClick={() => setSelected(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
      )}

      <ul className="college-grid">
        {colleges.map((college) => (
          <li key={college.id} className={`college-card theme-${college.examSlug}`}>
            {college.image && (
              <figure className="college-photo">
                <Image
                  src={college.image.src}
                  alt={college.image.alt}
                  width={1200}
                  height={675}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                  loading="lazy"
                />
                <figcaption className="college-photo-credit">
                  Photo: {college.image.credit},{" "}
                  <a href={college.image.licenseUrl} target="_blank" rel="noopener noreferrer">
                    {college.image.license}
                  </a>
                  , via{" "}
                  <a href={college.image.sourceUrl} target="_blank" rel="noopener noreferrer">
                    Wikimedia Commons
                  </a>
                </figcaption>
              </figure>
            )}
            <div className="college-card-top">
              <span className="college-exam">{EXAM_LABEL[college.examSlug]}</span>
              {college.nirf2025.length > 0 && (
                <span className="college-rank">NIRF 2025: {college.nirf2025.join(" · ")}</span>
              )}
            </div>
            <h3>{college.name}</h3>
            <p className="college-meta">
              <MapPin size={14} aria-hidden="true" /> {college.location}, {college.state} · Est. {college.established}
            </p>
            <p>{college.overview}</p>
            <dl>
              <div>
                <dt>How you get in</dt>
                <dd>{college.admissionRoute}</dd>
              </div>
              <div>
                <dt>Programmes</dt>
                <dd>{college.programmes.join("; ")}</dd>
              </div>
              {college.seats && (
                <div>
                  <dt>Seats</dt>
                  <dd>{college.seats}</dd>
                </div>
              )}
            </dl>
            <a href={college.officialUrl} target="_blank" rel="noopener noreferrer" className="text-link">
              Official website <ExternalLink size={14} aria-hidden="true" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="review-note">
        Rankings: official{" "}
        <a href={NIRF_SOURCE.url} target="_blank" rel="noopener noreferrer">
          {NIRF_SOURCE.label}
        </a>{" "}
        (the latest edition published). Seats: official 2026 admission bulletins. Checked{" "}
        <time dateTime={COLLEGES_CHECKED_ON}>27 October 2026</time>. Always confirm programmes and eligibility on the
        institute&apos;s own website.
      </p>
    </section>
  );
}
