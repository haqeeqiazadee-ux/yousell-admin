# MASTER PROMPT: Aalpha.net AI Blog Intelligence Extractor

## OBJECTIVE
You are a senior AI solutions architect conducting a systematic research audit. Your task is to read EVERY blog post from the target URL list below, extract ALL actionable AI tips, architectural patterns, solution ideas, and implementation guidance relevant to building an AI-powered ecommerce platform, and compile them into a structured Excel workbook.

---

## MANDATORY RULES

1. **READ EVERY URL** — You MUST fetch and read the full content of every blog URL in the target list. Do NOT skip, summarise from memory, or guess content. Use `web_fetch` on each URL.
2. **NO HALLUCINATION** — Only extract information that is explicitly stated in the blog content. If a blog has no relevant AI ecommerce content, log it as "No relevant content" in the audit sheet and move on.
3. **TRACK PROGRESS** — After reading each blog, print a progress line: `[X/N] ✓ Read: <blog title>` so progress is visible.
4. **EXHAUSTIVE EXTRACTION** — Extract every useful tip, architectural recommendation, tool mention, framework suggestion, code pattern, API reference, and strategic insight. Do not cherry-pick.
5. **CATEGORISE RIGOROUSLY** — Every extracted item must be tagged to exactly one primary category and one or more sub-categories from the taxonomy below.

---

## TARGET BLOG URLs (Fetch ALL of these)

### TIER 1 — Primary (AI + Ecommerce direct)
1. https://www.aalpha.net/blog/how-to-build-an-ai-powered-ecommerce-store/
2. https://www.aalpha.net/blog/how-to-build-ai-agent-for-ecommerce/
3. https://www.aalpha.net/blog/how-to-build-ai-powered-marketplace-app/
4. https://www.aalpha.net/blog/marketplace-app-development-guide/

### TIER 2 — AI Agent Architecture & Development
5. https://www.aalpha.net/blog/how-to-build-an-ai-agent/
6. https://www.aalpha.net/blog/ai-agent-technology-stack/
7. https://www.aalpha.net/blog/ai-agent-marketplace-development/
8. https://www.aalpha.net/blog/agent-as-a-service-aaas-comprehensive-guide/
9. https://www.aalpha.net/blog/how-to-integrate-ai-agents-into-a-saas-platform/

### TIER 3 — AI Services, Costs & Strategy
10. https://www.aalpha.net/blog/ai-as-a-service-for-business/
11. https://www.aalpha.net/blog/ai-agent-development-cost/
12. https://www.aalpha.net/blog/artificial-intelligence-development-cost/
13. https://www.aalpha.net/blog/cost-to-build-a-generative-ai/

### TIER 4 — Chatbots, NLP & Conversational AI
14. https://www.aalpha.net/blog/how-to-develop-a-chatbot-from-scratch/
15. https://www.aalpha.net/blog/developing-chatbots-can-benefit/
16. https://www.aalpha.net/blog/natural-language-processing-in-artificial-intelligence/

### TIER 5 — Discovery Pass (search for more)
After reading Tiers 1-4, use `web_search` with these queries to find additional relevant aalpha.net blogs:
- `site:aalpha.net/blog AI product recommendation`
- `site:aalpha.net/blog machine learning ecommerce`
- `site:aalpha.net/blog dynamic pricing AI`
- `site:aalpha.net/blog AI search visual`
- `site:aalpha.net/blog AI fraud detection`
- `site:aalpha.net/blog AI inventory demand forecasting`
- `site:aalpha.net/blog RAG vector LLM`
- `site:aalpha.net/blog AI automation workflow`

Read and extract from any NEW blogs found that were not in Tiers 1-4.

---

## EXTRACTION TAXONOMY (Category → Sub-categories)

Use these as the `Category` and `Sub_Category` columns in the output:

### 1. AI ARCHITECTURE & INFRASTRUCTURE
- Microservices patterns
- RAG (Retrieval-Augmented Generation)
- Vector databases & embeddings
- LLM integration patterns
- Multi-agent orchestration
- Event-driven architecture
- API design for AI services
- Edge AI / hybrid deployment
- Containerisation (Docker/K8s)
- Model serving & inference

### 2. PRODUCT DISCOVERY & SEARCH
- Semantic / vector search
- Visual search (computer vision)
- Personalised ranking algorithms
- Faceted search with AI
- Natural language product queries

### 3. RECOMMENDATION & PERSONALISATION
- Collaborative filtering
- Content-based filtering
- Hybrid recommendation engines
- Dynamic product suggestions
- User behaviour analysis
- Cohort-based personalisation

### 4. CONVERSATIONAL AI & CUSTOMER SUPPORT
- Chatbot architecture
- Voicebot design
- NLP/NLU pipelines
- Intent classification
- Dialogue management
- Escalation to human agents
- Multilingual support

### 5. PRICING & REVENUE OPTIMISATION
- Dynamic pricing algorithms
- Competitor price monitoring
- Demand-based pricing
- Discount/promotion AI
- Price elasticity modelling

### 6. INVENTORY & SUPPLY CHAIN
- Demand forecasting
- Automated restocking
- Supply chain optimisation
- Warehouse / logistics AI

### 7. FRAUD & SECURITY
- Transaction fraud detection
- Behavioural anomaly detection
- Bot / scraping protection
- AI-powered KYC/verification

### 8. MARKETING & CUSTOMER ACQUISITION
- Lookalike audience modelling
- AI content generation
- Predictive churn / LTV
- Email/SMS personalisation
- Re-engagement automation

### 9. DATA & ANALYTICS
- Customer behaviour analytics
- A/B testing with AI
- Dashboard / BI integration
- Data pipeline architecture
- Feature engineering

### 10. TOOLS, PLATFORMS & VENDORS
- Specific tool names (e.g., Dynamic Yield, Clerk.io, ViSenze)
- Cloud platforms (AWS, GCP, Azure specifics)
- Open-source frameworks (LangChain, CrewAI, AutoGen)
- Ecommerce platforms (Shopify Magic, WooCommerce AI)
- API services (OpenAI, Anthropic, Google Dialogflow)

### 11. COST & IMPLEMENTATION STRATEGY
- Cost estimates / budget ranges
- Build vs buy decisions
- MVP vs full build phasing
- Team structure & hiring
- Timeline estimates
- ROI benchmarks

### 12. UX & FRONTEND AI FEATURES
- AI-powered UI personalisation
- Smart cart suggestions
- Exit-intent AI triggers
- Conversational commerce UI
- Accessibility via AI

---

## OUTPUT FORMAT: Excel Workbook

Create an Excel file called `aalpha_ai_ecommerce_intelligence.xlsx` with the following sheets:

### Sheet 1: "AI_Tips_Master" (Main extraction)
| Column | Description |
|--------|-------------|
| ID | Auto-increment (TIP-001, TIP-002...) |
| Category | From taxonomy above (e.g., "AI Architecture & Infrastructure") |
| Sub_Category | Specific sub-category (e.g., "RAG") |
| Tip_Title | Short descriptive title (max 15 words) |
| Description | Full extracted insight (2-5 sentences, paraphrased) |
| Implementation_Notes | How this could be implemented in a Next.js/Supabase/TypeScript stack |
| Tools_Mentioned | Comma-separated tool/platform names mentioned |
| Complexity | Low / Medium / High |
| Priority_For_Ecommerce | P0 (Critical) / P1 (Important) / P2 (Nice to have) |
| Source_URL | Blog URL where this was found |
| Source_Blog_Title | Title of the blog post |

### Sheet 2: "Architecture_Patterns"
| Column | Description |
|--------|-------------|
| ID | ARCH-001, ARCH-002... |
| Pattern_Name | Name of the architectural pattern |
| Description | What it is and how it works |
| Use_Case | Ecommerce scenario where this applies |
| Components | Key technical components involved |
| Pros | Benefits listed |
| Cons | Drawbacks or limitations listed |
| Stack_Fit | How well it fits Next.js + Supabase + TypeScript (Good/Partial/Needs Adaptation) |
| Source_URL | Blog URL |

### Sheet 3: "Tools_Vendors"
| Column | Description |
|--------|-------------|
| ID | TOOL-001, TOOL-002... |
| Tool_Name | Name of tool/platform/service |
| Category | What it does (Search, Recommendations, Chatbot, etc.) |
| Type | SaaS / API / Open-Source / Framework |
| Use_Case | How it applies to ecommerce |
| Pricing_Model | If mentioned (Free / Freemium / Paid / Enterprise) |
| Integration_Effort | Low / Medium / High |
| Source_URL | Blog URL |

### Sheet 4: "Implementation_Roadmap"
| Column | Description |
|--------|-------------|
| Phase | Phase 1 (Foundation) / Phase 2 (Growth) / Phase 3 (Advanced) |
| Feature | AI feature to implement |
| Category | From taxonomy |
| Dependencies | What needs to be in place first |
| Estimated_Effort | Days or weeks estimate |
| Priority | P0 / P1 / P2 |
| Notes | Any special considerations |

### Sheet 5: "Blog_Audit_Log"
| Column | Description |
|--------|-------------|
| Blog_URL | Full URL |
| Blog_Title | Page title |
| Date_Read | Timestamp of when you read it |
| Status | Read / Failed / No Relevant Content |
| Tips_Extracted | Count of tips pulled from this blog |
| Notes | Any issues (e.g., page timeout, 404, paywall) |

---

## FORMATTING REQUIREMENTS

- Headers: Bold, dark blue background (#1F3864), white text, frozen top row
- Column widths: Auto-fit to content, minimum 15 characters
- Alternating row colours: Light grey (#F2F2F2) on even rows
- Text wrapping enabled on Description and Implementation_Notes columns
- All sheets should have auto-filter enabled on headers
- Font: Arial 10pt throughout

---

## EXECUTION ORDER

1. Create the empty Excel workbook structure with all 5 sheets and headers
2. Fetch and read Tier 1 blogs (URLs 1-4) — extract all tips
3. Fetch and read Tier 2 blogs (URLs 5-9) — extract all tips
4. Fetch and read Tier 3 blogs (URLs 10-13) — extract all tips
5. Fetch and read Tier 4 blogs (URLs 14-16) — extract all tips
6. Run Tier 5 discovery searches — fetch and read any new blogs found
7. Populate the Implementation_Roadmap sheet by synthesising all extracted tips
8. Finalise the Blog_Audit_Log
9. Apply formatting to all sheets
10. Save and present the final Excel file

---

## CONTEXT: The Target Project

This intelligence will be used to enhance a project called **yousell-admin**, which is:
- **Stack**: Next.js (TypeScript), Supabase (PostgreSQL + Auth + Edge Functions), shadcn/ui, Tailwind CSS
- **Deployed on**: Netlify
- **Purpose**: An AI-enhanced ecommerce admin panel for UK-based bulk IT product sales and distribution
- **Current AI status**: Minimal — looking to add AI features for product recommendations, search, pricing intelligence, customer insights, chatbot support, and inventory forecasting
- **Data sources**: Product catalogues, customer order history, supplier pricing feeds, scraped competitor data

When writing `Implementation_Notes`, always frame suggestions in terms of this specific tech stack and business context.

---

## FINAL CHECK

Before saving the workbook, verify:
- [ ] Every Tier 1-4 URL has an entry in Blog_Audit_Log
- [ ] Total tips extracted ≥ 50 (these are long, detailed blogs)
- [ ] Every tip has a Category, Sub_Category, and Priority assigned
- [ ] No empty cells in required columns
- [ ] Architecture_Patterns sheet has ≥ 10 entries
- [ ] Tools_Vendors sheet has ≥ 20 entries
- [ ] Implementation_Roadmap covers all 3 phases with ≥ 15 total entries
