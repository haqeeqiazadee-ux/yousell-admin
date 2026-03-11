# Phase 1 — Read Brief & Produce Structured Summary

## Context Recovery (do this first every time)

1. Read `CLAUDE.md`
2. Read `ai/qa_tracker.md` — check that Phase 1 status is NOT STARTED or IN PROGRESS
3. If Phase 1 is already COMPLETED, skip to the next incomplete phase

---

## Your Role

You are a Senior Software Architect reviewing the YouSell Intelligence Platform Master Build Brief v5.0.

---

## Input

Read the Master Build Brief PDF:
`https://github.com/haqeeqiazadee-ux/yousell-admin/blob/main/YOUSELL_MASTER_BUILD_BRIEF_v5.pdf`

---

## Task

Carefully read the entire PDF and produce a **structured summary** that will serve as the working reference for all subsequent QA phases. This summary must capture every detail — later phases will rely on it instead of re-reading the PDF.

---

## Output Structure

Save your output to: `ai/qa_brief_summary.md`

The summary must contain these sections:

### 1. Platform Vision & Goals
- One-paragraph summary of what YouSell is and who it serves

### 2. Tech Stack (complete list with roles)
- Frontend, backend, database, queues, scraping, AI, email, payments, deployment

### 3. Architecture Flow
- End-to-end data flow from scraping to dashboard display

### 4. Smart Scraping Rules
- All demand-driven rules, queue priorities (P0/P1/P2), freshness badges, budget enforcement

### 5. Universal Product Intelligence Chain
- All 7 rows with full detail on what each contains

### 6. Home Dashboard Spec
- What auto-populates, refresh logic, card contents

### 7. Platform Sections (TikTok / Amazon / Shopify)
- What each section displays, data sources, unique features per platform

### 8. Scoring Models
- All 4 intelligence engine algorithms with formulas/logic

### 9. Database Schema
- Every table mentioned, key fields, relationships, RLS rules, tenant_id usage

### 10. Worker System
- Every worker mentioned with: name, trigger, queue lane, what it produces

### 11. API Routes
- Every endpoint mentioned with method, path, purpose

### 12. Subscription Plans & Billing
- Plan tiers, feature gates, Stripe integration details, metering

### 13. Development Phases
- Ordered phase list with tasks per phase

### 14. Anything Else
- Capture anything that doesn't fit above but exists in the brief

---

## Formatting Rules

- Use tables for any list with 3+ items
- Use code blocks for flows, schemas, and algorithms
- Be exhaustive — if it's in the PDF, it must be in the summary
- Mark anything that seems vague or underspecified with: `⚠️ VAGUE:`

---

## After Completion

1. Save output to `ai/qa_brief_summary.md`
2. Update `ai/qa_tracker.md`:
   - Set Phase 1 status to `COMPLETED`
   - Add a session log entry with today's date and any notes
3. Commit changes with message: `QA Phase 1: Brief summary complete`
