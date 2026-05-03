# NyayaMitra

### From Court Judgments to Verified Action Plans

**AI for Bharat Hackathon 2026 — Theme 11**
**Powered by PAN IIT**

---

## Overview

NyayaMitra is an AI co-pilot for the Court Case Monitoring System (CCMS) that turns High Court judgment PDFs into verified, actionable plans for government officers. It reads the judgment, extracts every directive with source-linked proof, computes appeal deadlines under the Limitation Act, and hands a verified action plan to the law officer for sign-off.

What takes a senior officer three days today takes under five minutes — without removing the human from the decision.

---

## The Problem

When CCMS auto-fetches a judgment PDF from the High Court's CIS, the automation ends there. A law officer must manually read 20 to 80 pages of dense legal text, identify the operative directives, determine the responsible department, compute the appeal limitation period, and decide on compliance or appeal.

This manual workflow produces four structural failures:

- **Processing delay** — a single judgment can occupy a senior officer for half a working day
- **Omission** — critical directives buried in paragraph 47 of a long order go unnoticed
- **Missed limitation** — appeal windows close silently because no one computes the deadline from the certified copy
- **Inconsistency** — two officers reading the same judgment reach different conclusions

NyayaMitra addresses all four.

---

## Solution Snapshot

NyayaMitra is a decision-support platform (not full automation) built around four guarantees:

1. Every judgment is read the same way, every time
2. Every output is linked back to its exact source sentence in the PDF
3. Every record passes through mandatory human verification before it reaches the dashboard
4. Every appeal deadline is computed deterministically, not guessed

---

## Input and Output

**Input:**
Court judgment PDFs — multi-page, digital or scanned — fetched via the existing CCMS API.

**Output:**
- Structured extracted data (case details, parties, directives, timelines)
- AI-assisted action plan (what, who, by when, urgency)
- Human-verified records (only these reach the dashboard)
- A clean dashboard for government decision-makers

---

## Core Flow

### Step 1 — Extract

The system reads the PDF and extracts the theme-required fields: case details, date of order, key directions, parties involved, and relevant timelines.

- **Digital PDFs** are parsed with PyMuPDF
- **Scanned copies** go through a layout-aware OCR pipeline (Tesseract + layout parser)
- **Every sentence** is tagged with page number and bounding-box coordinates — this spatial index powers the entire explainability layer

Extraction uses a structured multi-step pipeline that first isolates the operative portion of the judgment (typically under 10% of the document, where all directives live) before extracting fields. This focused approach keeps accuracy high where it matters.

### Step 2 — Generate Action Plan

For each directive, the system produces a structured record with five fields:

| Field | Description |
|---|---|
| What is required | Compliance, consideration for appeal, or both |
| Responsible department | Mapped from directive language; improves from reviewer corrections |
| Key timelines | Explicit deadline from the order, or computed from the Limitation Act |
| Nature of action | Plain-language summary of the obligation |
| Urgency | 🔴 Red (< 15 days), 🟡 Amber (15 to 45 days), 🟢 Green (compliance only) |

Where the order does not state an explicit appeal deadline, a dedicated rule-based module computes it based on the order type (writ appeal, intra-court appeal, review petition, SLP) and the date of the certified copy.

### Step 3 — Verify (Human-in-the-Loop, Mandatory)

Human verification is a hard requirement. Before any record is used downstream:

- Each extracted field is displayed alongside the source PDF, with the supporting sentence highlighted
- Each field carries a confidence score to direct reviewer attention to uncertain outputs
- The reviewer can **Approve**, **Edit**, or **Reject** each field independently
- Only verified records move forward to the dashboard
- Every reviewer action is logged for audit

### Step 4 — Dashboard (Trusted View Only)

The dashboard shows only human-approved action plans:

- Department-wise views of pending actions
- A timeline view of upcoming limitation deadlines
- Click-through from any action to its verified source sentence in the original PDF
- A complete audit trail of who extracted, who verified, and what was changed

---

## How This Goes Beyond a Baseline Extraction Tool

Three capabilities distinguish NyayaMitra from a generic PDF-to-LLM-to-dashboard pipeline:

### 1. Limitation-Period Reasoner
A dedicated rule-based module encodes the Limitation Act and computes the exact calendar date by which an appeal must be filed. Missed appeal deadlines — the biggest pain point in the problem statement — are addressed directly by deterministic logic rather than left to the language model.

### 2. Precedent Awareness *(Demonstration Scope)*
Where historical judgments are available, the system surfaces past cases with similar directives to give the reviewer context during verification. For the hackathon this is demonstrated on a small sample set; a production rollout would extend it to the full CCMS archive.

### 3. Learning Department Router
Department assignment begins rule-based on day one, but every reviewer correction becomes a labelled training signal that improves routing over time — institutional knowledge that compounds with use.

---

## Explainability and Traceability

NyayaMitra is built on **Explainable AI** principles. Every AI-generated output is linked to the exact source sentence on the exact page of the original PDF. Nothing is shown in the verification interface or the dashboard without a verifiable link to its source. Every output is traceable to source text, and that traceability is preserved end-to-end.

---

## System Architecture

The full high-level architecture diagram is included in this folder as `architecture.png`.

The system is organised in five layers with cross-cutting services:

| Layer | Purpose |
|---|---|
| **1. Ingestion Layer** | Document intake, type detection, text and OCR extraction, spatial indexing |
| **2. Processing Layer** | Multi-pass extraction, action plan generation, Limitation Reasoner, precedent search |
| **3. Storage Layer** | Document storage (S3), metadata DB, vector DB for precedent, audit log |
| **4. Verification Layer** | Reviewer interface, field-level approve/edit/reject, verification service |
| **5. Dashboard Layer** | Trusted view with department filtering, deadline timeline, source traceability |

Cross-cutting services: Authentication & Authorization, Role Management, Audit Logging, Notification Service, Configuration Service.

---

## Technology Stack

| Layer | Choice |
|---|---|
| Frontend | React + Tailwind CSS |
| AI Layer | Python FastAPI service + Gemini API |
| OCR | PyMuPDF + Tesseract with layout parser |
| Storage | PostgreSQL (verified records, audit-grade), MongoDB (raw outputs), AWS S3 (PDFs) |
| Similarity Search | Sentence-transformer embeddings + pgvector |
| Audit | Immutable event log with timestamp, user, and diff — RTI-query-ready |

---

## Addressing the Stated Constraints

- **Complex, inconsistent PDFs** → handled by the dual digital + OCR pipeline with a layout parser
- **Explainable and verifiable outputs** → every field links to its source sentence and retains that link through the dashboard
- **Decision support, not full automation** → no record reaches the dashboard without human approval

---

## Mapping to Evaluation Criteria

| Criterion | How NyayaMitra Addresses It |
|---|---|
| Accuracy of extraction | Operative-portion isolation keeps accuracy high on the fields that matter most |
| Quality of action plan | A defined five-field schema with computed limitation periods where not stated |
| Effectiveness of verification | Field-level approve/edit/reject controls with confidence signals guiding reviewer focus |
| Dashboard usability | Department-wise filtering, deadline timeline, source traceability on every record |

---

## Scope for the Hackathon

The Round 2 demonstration will cover the end-to-end flow on representative sample judgments:

- Extraction of theme-specified fields
- Generation of structured action plans
- The field-level human verification interface
- The dashboard of approved records

Features that depend on historical case data (such as the long-term improvement curve of the Learning Router and the full precedent archive) will be shown conceptually with sample data and are intended for a post-hackathon production rollout.

---

## Round 2 Demo Scenario

A law officer uploads a 62-page scanned High Court judgment. Within 90 seconds:

- 12 structured fields and 4 distinct directives are extracted, each highlighted on the source PDF
- Two directives are flagged red — appeal window closes in 11 days
- Three precedent cases surface in the sidebar, with outcomes
- The officer approves 10 fields, edits one department mapping, and rejects one ambiguous directive for re-extraction
- The verified action plan appears on the dashboard, assigned to the Revenue Department, with calendar alerts pre-set for the appeal deadline

---

---

## Folder Contents

| File | Purpose |
|---|---|
| `README.md` | This file — full solution documentation |
| `architecture.png` | High-level system architecture diagram |

---

*Submitted for AI for Bharat Hackathon 2026, Theme 11 — From Court Judgments to Verified Action Plans.*