"use client";

import { useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { exams, filterExams } from "@/data/exams";

export function ExamDirectory() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All pathways");
  const matches = filterExams(query, category);
  return (
    <section aria-labelledby="directory-title" className="directory-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Find your direction</p>
          <h2 id="directory-title">Which path interests you?</h2>
        </div>
        <span className="text-sm text-navy/75">
          Start with {exams.length} exam guides
        </span>
      </div>
      <label className="search-field">
        <Search size={19} aria-hidden="true" />
        <span className="sr-only">Search exams, institutions or interests</span>
        <input
          type="search"
          placeholder="Try science, engineering, NISER…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <div className="filter-row" aria-label="Filter exam shortcuts by pathway">
        {[
          "All pathways",
          "University admissions",
          "Science & research",
          "Engineering",
        ].map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={value === category}
            onClick={() => setCategory(value)}
          >
            {value}
          </button>
        ))}
      </div>
      <p className="text-sm text-navy/75 mb-4" role="status">
        {matches.length} {matches.length === 1 ? "exam matches" : "exams match"}
        . Full exam details remain below.
      </p>
      <div className="directory-grid">
        {matches.map((exam) => (
          <a
            key={exam.slug}
            href={`#${exam.slug}`}
            className={`directory-card theme-${exam.slug}`}
          >
            <span className="card-category">{exam.category}</span>
            <h3>{exam.name}</h3>
            <p>{exam.summary}</p>
            <span className="card-link">
              Read the full guide <ArrowUpRight size={18} aria-hidden="true" />
            </span>
          </a>
        ))}
      </div>
      {!matches.length && (
        <div className="empty-state">
          <p>No matching exams in our first four guides.</p>
          <button
            type="button"
            className="button-secondary mt-3"
            onClick={() => {
              setQuery("");
              setCategory("All pathways");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </section>
  );
}
