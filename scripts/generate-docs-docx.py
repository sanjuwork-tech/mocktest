#!/usr/bin/env python3
"""
OurMocks Comprehensive PRD & TRD Generator + DOCX Compiler
Generates production-grade PRD.md, TRD.md, PRD_OurMocks.docx, and TRD_OurMocks.docx
for executive and senior developer handover.
"""

import os
import sys
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

PRD_CONTENT = """# OurMocks — Product Requirements Document (PRD)

**Document Version:** 2.0 (Production Roadmap & Architecture Baseline)  
**Date:** October 2026  
**Status:** Approved Architecture Baseline & Deployment Roadmap  
**Brand:** OurMocks (formerly TestDisha)  
**Platform URL:** https://ourmocks.com  
**Target Exams:** CUET UG, IISER IAT, COMEDK UGET, NISER NEST  

---

## 1. Executive Summary & Vision

### 1.1 The Problem
In the Indian competitive entrance landscape, JEE and NEET disproportionately dominate career discussions. Over 2.5 million Class 12 aspirants remain unaware of high-prestige alternatives—such as top Central Universities (CUET UG), Indian Institutes of Science Education and Research (IISER IAT), National Institute of Science Education and Research (NISER NEST), and premier engineering consortia (COMEDK UGET).
Existing test platforms are either generic, riddled with typographical errors in math/science formatting, or lock students into expensive single-exam silos.

### 1.2 Our Solution
**OurMocks** provides a unified discovery, practice, and diagnostic CBT platform:
1. **Unbiased Exam Discovery:** Direct comparisons of opportunities, eligibility, official bulletins, and marking patterns on one clean site.
2. **Authoritative Mock Test Engines:** True-to-exam CBT simulator with free navigation, review tags, and a live per-question elapsed timer alongside the overall exam clock.
3. **Flawless Mathematical Typography:** Zero-cramming KaTeX/mhchem rendering pipeline that automatically unwraps equations, converts operators to Unicode, and prevents letter-smearing.
4. **Multi-Exam Value Bundles:** Students can purchase single exam packs or multi-exam combos (e.g., CUET + IISER Dual Pass, Pure Science Trio, All-Access Super Pass) to maximize their admission options affordably.

---

## 2. Product Features: Implemented vs. Production Roadmap

| Capability | Current Implemented Status | Production Target / Next Steps |
| :--- | :--- | :--- |
| **Public Discovery & Catalog** | Fully responsive landing page, exam guides, catalog filters, proposed pricing | Dynamic CMS for notices & exam date updates |
| **CBT Mock Test Engine** | Live CBT player, questions palette, review marking, zero answer-leak client API | Anti-tab-switch proctoring, resume on connection drop |
| **Dual-Timer System** | Live question timer badge + overall exam timer; per-second persistence | Pacing efficiency radar (overtime vs fast-guess analysis) |
| **Math & Formula Engine** | `normalizeMathText` KaTeX/mhchem with automatic sentence unwrap & operator clean | Chemical diagram SVGs & interactive graph plotting |
| **Question Bank** | 15,000 cleaned CUET questions (300 papers); Paper 1 active across 13 subjects | Enable all 25 test papers per subject via paper picker |
| **Exam Selector** | Interactive dashboard selector for CUET UG, IISER IAT, COMEDK, NEST | Dynamic test generation per exam blueprint |
| **Product & Bundles** | Single exam packs + 3 multi-exam combos (CUET+IISER, Science Trio, All-Access) | Razorpay live checkout integration with webhook entitlements |
| **Database & Persistence** | Drizzle ORM (25 tables) with offline demo storage fallback | PostgreSQL deployment on Neon Serverless or VPS |

---

## 3. Product Offerings & Multi-Exam Bundles

### 3.1 Single Exam Passes
- **CUET UG Complete 2026 (₹1,499):** 45 planned mocks across 13 domain subjects, English, and General Test with NTA CBT interface.
- **IISER IAT Rank Booster 2026 (₹1,299):** 30 planned mocks with calibrated PCMB (60 questions, +4/-1) research aptitude questions.
- **NISER NEST Master Series 2026 (₹999):** 24 planned mocks for NISER and CEBS with selective scoring strategy.
- **COMEDK UGET Power Pack 2026 (₹1,199):** 35 planned high-speed PCM mocks (180 questions, 180 mins, no negative marks).

### 3.2 Multi-Exam Value Bundles (New Feature)
- **CUET UG + IISER IAT Dual Pass (₹2,199 · Save 41%):** Unlocks 75 mock tests across Central Universities and IISERs. Designed for science students targeting both DU/BHU BSc and IISER BS-MS.
- **Pure Science & Research Trio (₹2,699 · Save 36%):** 99 mock tests covering IISER IAT, NISER NEST, and CUET UG Science. Complete PCMB calibrated difficulty and rank prediction.
- **OurMocks 2026 All-Access Super Pass (₹3,499 · Save 42%):** Unlocks all 4 exams (134 total mock tests), all 13 subjects, unified cross-exam performance dashboard, and 1-year unlimited access.

---

## 4. Student User Journeys

### 4.1 Guest & Diagnostic Flow (Zero Friction)
1. Student lands on OurMocks homepage or clicks **Student login**.
2. Can instantly start a free diagnostic test as a guest with 1 click (no credit card or complex registration).
3. Selects their exam target (CUET UG, IISER IAT, COMEDK, NEST) and subject.
4. Takes Test 1 in full CBT mode with live question timers and responsive question palette.
5. Upon submission, receives instant comprehensive diagnostic report with topic accuracy, pacing analysis, and full KaTeX step-by-step solutions.

### 4.2 Paid Bundle Purchase Flow
1. Student selects a product or multi-exam bundle on the `/test-series` page.
2. Initiates checkout via Razorpay popup.
3. Webhook securely captures payment and creates idempotent entitlement record.
4. If a bundle is purchased, entitlements to all underlying exams/subjects are unlocked automatically.
"""

TRD_CONTENT = """# OurMocks — Technical Requirements Document (TRD)

**Document Version:** 2.0 (Engineering Architecture & Infrastructure Guide)  
**Date:** October 2026  
**Status:** Implementation Baseline & CTO Infrastructure Guide  
**Tech Stack:** Next.js 15 (App Router), TypeScript, React, Drizzle ORM, PostgreSQL, KaTeX, Tailwind/CSS  
**Database Tables:** 25 normalized PostgreSQL tables  
**Testing:** Node test runner, 16 suites, 86 unit/integration tests  

---

## 1. System Architecture Overview

```mermaid
flowchart TB
    Client[Next.js App Router Client]
    Server[Node.js Route Handlers / Server Actions]
    DB[(PostgreSQL Database)]
    KaTeX[KaTeX / mhchem Math Engine]
    Store[Local Storage / Demo Fallback]

    Client -->|API Requests| Server
    Server -->|Drizzle ORM| DB
    Client -->|LaTeX Normalization| KaTeX
    Client -->|Offline / Demo Cache| Store
```

### 1.1 Architectural Invariants
1. **Zero Answer Key Leakage:** During active test attempts, all questions served to the client must pass through `sanitizeQuestion()`, stripping `correct` and `explanation` properties.
2. **Server Time Authority:** Time remaining is governed by server deadline timestamps, not client clocks, eliminating client clock manipulation.
3. **Dual-Timer Persistence:** Time spent per question is stored on the client and sent as `responses[q.id].seconds` in the attempt payload for granular pacing telemetry.
4. **Idempotent Webhook Fulfillment:** Razorpay payment webhooks use HMAC SHA256 verification and atomic SQL transactions to ensure orders are processed exactly once.

---

## 2. Mathematical Text Processing Pipeline

### 2.1 Problem Solved
Raw questions imported from LaTeX repositories often wrap full English sentences in `\\( ... \\)` or `$ ... $`. KaTeX renders these in math italic mode, removing all whitespace and cramming letters together (e.g., $IfAisamatrix$).

### 2.2 Solution: `normalizeMathText()`
Located at `src/lib/student/math-cleaner.ts`:
1. **Sentence Unwrapping:** Detects when math delimiters contain space-separated alphabetic words ($\ge 2$ words) and extracts the natural language text.
2. **Operator & Symbol Conversion:** Replaces LaTeX operators with clean Unicode (`\\times` &rarr; `×`, `\\in` &rarr; `∈`, `\\sum` &rarr; `∑`, `\\pi` &rarr; `π`).
3. **Delimiter Cleaning:** Transforms `\\left|` and `\\right|` into `|` so determinants and absolute values display cleanly in both plain text and KaTeX.
4. **Standalone Equations:** Wraps formulas like `\\sqrt{...}` and `\\frac{...}{...}` in proper KaTeX `$ ... $` tags.
5. **Runtime Fallback in RichText:** If any string still slips through with multiple English words inside `$ ... $`, `RichText` renders it as standard text to guarantee zero crammed letters.

---

## 3. Database & Deployment Architecture (CTO Decision Matrix)

### 3.1 Can Free Vercel Handle OurMocks?
- **Vercel Hobby Limitations:**
  - Serverless function timeout: **10 seconds** (heavy test evaluation or database cold starts can trigger 504 Gateway Timeouts).
  - Database connection pool exhaustion: Serverless functions spin up separate ephemeral connections; without a connection pooler, PostgreSQL crashes.
  - Commercial restriction: Vercel Hobby strictly disallows commercial paid test series. Once charging via Razorpay, Vercel Pro ($20/seat/month) is mandated.
- **Verdict:** Free Vercel is suitable only for staging/prototyping. Commercial launch requires proper infrastructure.

### 3.2 Recommended Hosting Architecture

#### Path A: Vercel Pro + Serverless Managed PostgreSQL (Neon / Supabase) — Recommended for Speed
- **Frontend / API:** Next.js hosted on Vercel Pro ($20/mo).
- **Database:** **Neon Serverless PostgreSQL** (Free tier available, $19/mo for Pro with connection pooling).
  - Native connection pooler (`?sslmode=require&pooler=true`).
  - Auto-scaling compute and zero-maintenance backups.
- **Pros:** Zero DevOps, global edge deployment, instant rollback.

#### Path B: Single VPS (Hetzner / DigitalOcean) + Docker + Coolify — Recommended for Cost
- **Server:** Hetzner Cloud CX22 / DigitalOcean Droplet ($5–$8/mo).
- **Stack:** Coolify or Docker Compose running:
  1. Next.js standalone container.
  2. PostgreSQL 16 container with persistent SSD volume.
  3. Caddy reverse proxy with automatic SSL.
- **Pros:** Full root control, fixed predictable cost, zero connection limits, no serverless timeouts.

---

## 4. Multi-Exam Bundle & Entitlement Architecture

### 4.1 Data Modeling
Each bundle in `src/data/catalog.ts` specifies:
```typescript
{
  slug: "bundle-cuet-iiser",
  isBundle: true,
  bundleType: "combo",
  includedExams: ["cuet-ug", "iiser-iat"]
}
```

### 4.2 Fulfillment Logic (`src/server/entitlements.ts`)
When an order for a bundle is paid:
1. An entitlement for the primary bundle product is recorded.
2. Secondary entitlements for each child exam in `includedExams` are granted in the same database transaction.
3. When `checkEntitlement(userId, productId)` is evaluated, access is granted if the user owns either the specific product or any active bundle containing that exam.
"""

def add_styled_paragraph(doc, text, style='Normal', space_after=6, space_before=0, line_spacing=1.15):
    p = doc.add_paragraph(text, style=style)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.line_spacing = line_spacing
    return p

def create_docx(title, subtitle, markdown_content, output_path):
    doc = Document()

    # Page Margins
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # Document Title Header
    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_after = Pt(4)
    run_title = p_title.add_run(title)
    run_title.font.name = 'Calibri'
    run_title.font.size = Pt(26)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(7, 26, 77) # OurMocks Deep Navy

    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_after = Pt(18)
    run_sub = p_sub.add_run(subtitle)
    run_sub.font.name = 'Calibri'
    run_sub.font.size = Pt(13)
    run_sub.font.italic = True
    run_sub.font.color.rgb = RGBColor(31, 94, 255) # OurMocks Brand Blue

    # Parse and write markdown content
    lines = markdown_content.split('\n')
    in_code_block = False
    in_table = False
    table_lines = []

    def flush_table():
        nonlocal in_table, table_lines
        if not table_lines:
            return
        
        # Parse rows
        rows_data = []
        for line in table_lines:
            if line.strip().startswith('|') and not '---' in line:
                cells = [c.strip() for c in line.strip().split('|')[1:-1]]
                if cells:
                    rows_data.append(cells)
        
        if rows_data:
            table = doc.add_table(rows=len(rows_data), cols=len(rows_data[0]))
            table.alignment = WD_TABLE_ALIGNMENT.CENTER
            table.autofit = True

            for r_idx, row in enumerate(rows_data):
                for c_idx, cell_text in enumerate(row):
                    cell = table.cell(r_idx, c_idx)
                    cell.text = cell_text
                    # Header formatting
                    p = cell.paragraphs[0]
                    p.paragraph_format.space_after = Pt(2)
                    p.paragraph_format.space_before = Pt(2)
                    if r_idx == 0:
                        for run in p.runs:
                            run.font.bold = True
                            run.font.color.rgb = RGBColor(255, 255, 255)
                        shading_elm = parse_xml(r'<w:shd {} w:fill="071A4D"/>'.format(nsdecls('w')))
                        cell._tc.get_or_add_tcPr().append(shading_elm)
                    else:
                        if r_idx % 2 == 1:
                            shading_elm = parse_xml(r'<w:shd {} w:fill="F8FAFC"/>'.format(nsdecls('w')))
                            cell._tc.get_or_add_tcPr().append(shading_elm)
            
            p_space = doc.add_paragraph()
            p_space.paragraph_format.space_after = Pt(8)
            p_space.paragraph_format.space_before = Pt(0)

        in_table = False
        table_lines = []

    for line in lines:
        stripped = line.strip()

        # Code block handling
        if stripped.startswith('```'):
            if in_code_block:
                in_code_block = False
            else:
                in_code_block = True
            continue

        if in_code_block:
            p_code = doc.add_paragraph()
            p_code.paragraph_format.space_after = Pt(2)
            p_code.paragraph_format.space_before = Pt(0)
            run = p_code.add_run(line)
            run.font.name = 'Courier New'
            run.font.size = Pt(9.5)
            run.font.color.rgb = RGBColor(51, 65, 85)
            continue

        # Table detection
        if stripped.startswith('|') and stripped.endswith('|'):
            in_table = True
            table_lines.append(stripped)
            continue
        elif in_table:
            flush_table()

        if not stripped:
            continue

        # Headings
        if stripped.startswith('# '):
            continue # Top title already handled
        elif stripped.startswith('## '):
            h = doc.add_paragraph()
            h.paragraph_format.space_before = Pt(14)
            h.paragraph_format.space_after = Pt(4)
            h.paragraph_format.keep_with_next = True
            run = h.add_run(stripped[3:])
            run.font.name = 'Calibri'
            run.font.size = Pt(16)
            run.font.bold = True
            run.font.color.rgb = RGBColor(7, 26, 77)
        elif stripped.startswith('### '):
            h = doc.add_paragraph()
            h.paragraph_format.space_before = Pt(10)
            h.paragraph_format.space_after = Pt(3)
            h.paragraph_format.keep_with_next = True
            run = h.add_run(stripped[4:])
            run.font.name = 'Calibri'
            run.font.size = Pt(13)
            run.font.bold = True
            run.font.color.rgb = RGBColor(31, 94, 255)
        elif stripped.startswith('- ') or stripped.startswith('* '):
            p = doc.add_paragraph(style='List Bullet')
            p.paragraph_format.space_after = Pt(3)
            p.paragraph_format.space_before = Pt(0)
            # Simple bold handler inside bullets
            raw_text = stripped[2:]
            parts = raw_text.split('**')
            for idx, part in enumerate(parts):
                run = p.add_run(part)
                run.font.name = 'Calibri'
                run.font.size = Pt(10.5)
                if idx % 2 == 1:
                    run.font.bold = True
        else:
            p = doc.add_paragraph()
            p.paragraph_format.space_after = Pt(6)
            p.paragraph_format.line_spacing = 1.15
            parts = stripped.split('**')
            for idx, part in enumerate(parts):
                run = p.add_run(part)
                run.font.name = 'Calibri'
                run.font.size = Pt(10.5)
                if idx % 2 == 1:
                    run.font.bold = True

    if in_table:
        flush_table()

    doc.save(output_path)
    print(f"Generated DOCX: {output_path}")

def main():
    os.makedirs("docs", exist_ok=True)

    # 1. Write PRD.md
    with open("docs/PRD.md", "w", encoding="utf-8") as f:
        f.write(PRD_CONTENT)
    print("Updated docs/PRD.md")

    # 2. Write TRD.md
    with open("docs/TRD.md", "w", encoding="utf-8") as f:
        f.write(TRD_CONTENT)
    print("Updated docs/TRD.md")

    # 3. Create PRD_OurMocks.docx
    create_docx(
        "OurMocks — Product Requirements Document (PRD)",
        "Version 2.0 · Platform Vision, User Experience, Offerings & Multi-Exam Bundles",
        PRD_CONTENT,
        "docs/PRD_OurMocks.docx"
    )

    # 4. Create TRD_OurMocks.docx
    create_docx(
        "OurMocks — Technical Requirements Document (TRD)",
        "Version 2.0 · System Architecture, Mathematical Engine & Database Infrastructure",
        TRD_CONTENT,
        "docs/TRD_OurMocks.docx"
    )

if __name__ == "__main__":
    main()
