Deployment Instructions
1. Push to GitHub
cd yousell-admin
git remote set-url origin https://github.com/haqeeqiazadee-ux/yousell-admin.git
git push -u origin main --force
2. Create .env.local (already created, but won't be in git)
cp .env.local.example .env.local
# Edit with your actual values
3. Deploy to Netlify
Option A: Link to GitHub (Recommended)
Go to https://app.netlify.com
Import the haqeeqiazadee-ux/yousell-admin repo
Build command: npm run build
Publish directory: .next
Add environment variables in Netlify UI:
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
Option B: CLI Deploy
npm install -g netlify-cli
netlify login
netlify link --id inquisitive-cendol-4771eb
netlify deploy --prod --build
4. Set Supabase Auth Redirect URL
In your Supabase dashboard:

Go to Authentication > URL Configuration
Add your Netlify URL to "Redirect URLs":
https://your-site.netlify.app/api/auth/callback

# YOUSELL Platform – Claude Project Context

This file is the authoritative project context for the YOUSELL platform.

Claude must reload this file whenever:
- a new development session starts
- chat history becomes compressed
- context appears incomplete

Claude must never restart the project from scratch unless explicitly instructed.


------------------------------------------------
PROJECT PURPOSE
------------------------------------------------

YOUSELL is an AI-powered product discovery and intelligence platform.

The system identifies trending e-commerce products across multiple marketplaces,
analyzes product viability, and generates actionable insights for product launches.

Primary Users
- Admin operators managing product discovery scans
- Client businesses receiving curated product opportunities

Core Capabilities
- automated product discovery
- AI-assisted product scoring
- influencer and supplier analysis
- product launch blueprint generation
- client product allocation


------------------------------------------------
TECHNOLOGY STACK
------------------------------------------------

Frontend
Next.js 14 (App Router)
TypeScript
TailwindCSS
shadcn/ui
Netlify deployment

Backend
Node.js
Express API
BullMQ job queue
Redis

Database
Supabase PostgreSQL
Supabase Auth
Supabase Realtime

Scraping / Data Sources
Apify Actors

AI
Anthropic Claude API

Email
Resend API

Version Control
GitHub


------------------------------------------------
SYSTEM ARCHITECTURE
------------------------------------------------

Admin Dashboard (Next.js)
        ↓
Next.js API Routes
        ↓
Express Backend
        ↓
BullMQ Job Queue
        ↓
Scan Worker
        ↓
Apify Actors
        ↓
Actor Dataset
        ↓
Dataset Fetch Layer
        ↓
Raw Listings Table
        ↓
Transformation Layer
        ↓
Products Table
        ↓
Scoring Engine
        ↓
Supabase Database
        ↓
Realtime Dashboard Updates


------------------------------------------------
DATA INGESTION PIPELINE
------------------------------------------------

The platform uses a multi-stage ingestion pipeline.

Stage 1 — Actor Execution
Trigger Apify actors to scrape external data sources.

Stage 2 — Dataset Retrieval
Fetch dataset results produced by the actor.

Stage 3 — Raw Data Storage
Store dataset JSON in the raw_listings table before transformation.

Stage 4 — Data Transformation
Normalize raw dataset records into structured product entries.

Stage 5 — Product Scoring
Apply the 3-pillar scoring engine.

Stage 6 — Database Upsert
Insert or update products in the products table.


------------------------------------------------
SCORING ENGINE
------------------------------------------------

Products are evaluated using a three-pillar scoring model.

Final Score Formula

final_score =
trend_score × 0.40 +
viral_score × 0.35 +
profit_score × 0.25

Score Tiers

HOT  ≥ 80
WARM ≥ 60
COLD < 60


------------------------------------------------
DATABASE SOURCE OF TRUTH
------------------------------------------------

Primary Table

products

Key Fields

id
title
platform
external_id
price
cost
trend_score
viral_score
profit_score
final_score
created_at

Uniqueness Constraint

UNIQUE(platform, external_id)

This prevents duplicate products when the same item appears across multiple scans.


Raw Ingestion Table

raw_listings

Example Fields

id
platform
actor_run_id
raw_json
created_at


------------------------------------------------
DISCOVERY PIPELINE
------------------------------------------------

Purpose
Identify trending products across marketplaces.

Primary Sources

TikTok
Pinterest
Amazon Movers
Shopify stores

Output

products table


------------------------------------------------
INTELLIGENCE PIPELINE
------------------------------------------------

Purpose
Enhance discovered products with deeper insights.

Sources

Influencer platforms
Supplier APIs
AI product analysis
Profit calculations

Output

product intelligence data.


------------------------------------------------
JOB QUEUE SYSTEM
------------------------------------------------

BullMQ manages background jobs.

Queue Types

scan_jobs
transform_jobs
scoring_jobs

Worker Pipeline

scan job
↓
run Apify actor
↓
fetch dataset
↓
store raw data
↓
transform listings
↓
score products
↓
upsert to database


------------------------------------------------
AUTOMATION SCHEDULER
------------------------------------------------

Periodic scans should run automatically using the automation_jobs table.

Recommended schedules

TikTok trends — every 6 hours
Amazon movers — every 12 hours
Shopify stores — daily
Pinterest trends — daily

Admin dashboard scans should primarily read existing data rather than trigger scraping.


------------------------------------------------
DEVELOPMENT GUARDRAILS
------------------------------------------------

Claude must follow these rules.

1. Do NOT rebuild completed functionality.
2. Always inspect the repository before creating new files.
3. Only implement missing or broken components.
4. Always check the task board before starting work.
5. Use the existing Supabase singleton client.
6. Use Apify actors as the primary scraping method.
7. Ensure compatibility with Netlify deployment constraints.


------------------------------------------------
PROJECT MEMORY SYSTEM
------------------------------------------------

Persistent project memory is stored in the /ai directory.

Files

/ai/architecture.md
/ai/project_state.md
/ai/task_board.md
/ai/claude_rules.md


File purposes

architecture.md
System architecture reference.

project_state.md
Current development progress.

task_board.md
Task tracking and priorities.

claude_rules.md
Development behavior rules.


------------------------------------------------
SESSION CONTEXT RECOVERY
------------------------------------------------

If chat history becomes compressed or context appears incomplete,
Claude must immediately run the following protocol.

1. Reload these files

CLAUDE.md
/ai/architecture.md
/ai/project_state.md
/ai/task_board.md

2. Summarize

current architecture
completed tasks
remaining tasks

3. Continue development from the task board.

Claude must never restart the project from scratch.


------------------------------------------------
TASK EXECUTION PRINCIPLES
------------------------------------------------

Claude must complete tasks sequentially.

After completing each task:

1. update /ai/task_board.md
2. update /ai/project_state.md
3. commit changes

If architecture changes:

update /ai/architecture.md


------------------------------------------------
FINAL VERIFICATION REQUIREMENT
------------------------------------------------

After implementing the ingestion pipeline,
the system must be tested.

Run:

node sync-listings.js

Expected Result

200 OK response from Supabase

Claude must not claim completion until this verification succeeds.
