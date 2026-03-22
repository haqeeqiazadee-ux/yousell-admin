# Scraper Document v1 — Comprehensive Execution Roadmap

> **Version:** 1.0
> **Date:** 2026-03-22
> **Status:** INITIAL DRAFT
> **Purpose:** Complete coding logic, architecture, stack decisions, and implementation plan for the AI Scraping Platform

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Delivery Modes](#2-product-vision--delivery-modes)
3. [Finalized Technology Stack](#3-finalized-technology-stack)
4. [Project Setup & Dependencies](#4-project-setup--dependencies)
5. [Core Architecture](#5-core-architecture)
6. [Shared Data Contracts](#6-shared-data-contracts)
7. [Execution Lanes & Routing Logic](#7-execution-lanes--routing-logic)
8. [Connector Strategy & Coding Logic](#8-connector-strategy--coding-logic)
9. [Session Management](#9-session-management)
10. [Proxy & CAPTCHA Strategy](#10-proxy--captcha-strategy)
11. [AI Layer — Routing, Repair, Normalization](#11-ai-layer)
12. [Storage Architecture](#12-storage-architecture)
13. [Control Plane API](#13-control-plane-api)
14. [Runtime Shells](#14-runtime-shells)
15. [Security Model](#15-security-model)
16. [Observability](#16-observability)
17. [Testing Strategy](#17-testing-strategy)
18. [Deployment Strategy](#18-deployment-strategy)
19. [Implementation Phases](#19-implementation-phases)
20. [Risk Matrix](#20-risk-matrix)

---

## 1. Executive Summary

This platform is a **production-grade, cloud-agnostic AI scraping engine** that runs identically across four runtime modes:

| Mode | Description |
|------|-------------|
| **Cloud SaaS** | Multi-tenant hosted platform with web dashboard |
| **Self-Hosted** | Single-tenant Docker deployment for enterprises |
| **Windows EXE** | Desktop app (Tauri) — local or hybrid cloud mode |
| **Browser Extension** | Chrome extension — cloud-connected or local-companion mode |

**Key principle:** All four modes share ONE core engine. The EXE and extension are runtime shells over the same extraction platform — not separate products.

**AI strategy:** AI (Claude API) handles routing intelligence, extraction repair, schema normalization, and dedup. It does NOT replace deterministic extraction. Deterministic parsers run first; AI is the fallback and normalization layer.

---

## 2. Product Vision & Delivery Modes

### 2.1 What It Is
An intelligent scraping platform that extracts structured data from any website using a multi-lane execution strategy (API feeds, HTTP parsing, browser automation, hard-target unlockers) with AI-powered routing and repair.

### 2.2 User Personas

| Persona | Use Case |
|---------|----------|
| **SaaS Operator** | Hosts the platform for multiple clients, manages quotas and billing |
| **Self-Hosted Enterprise** | Runs the platform behind their firewall for internal data needs |
| **Solo Desktop User** | Runs the EXE locally for personal scraping tasks |
| **Browser Extension User** | Uses the extension for quick, page-level extraction while browsing |
| **Developer/Integrator** | Calls the API to embed scraping capabilities in their own apps |

### 2.3 Runtime Modes

**Cloud SaaS:** Full platform on cloud infra. Multi-tenant, quota/billing per tenant. Web dashboard + API.

**Self-Hosted:** Docker Compose / K8s deployment. Single-tenant, all data on-premise. Same dashboard/API.

**Windows EXE — Local Mode:** Tauri desktop app with embedded Python runtime. Local browser/proxy. SQLite + local filesystem. No cloud dependency.

**Windows EXE — Hybrid Mode:** Same app, connects to cloud/self-hosted backend. Heavy tasks offloaded to cloud workers. Local browser for quick tasks.

**Browser Extension — Cloud-Connected:** Chrome extension (Manifest V3) → cloud backend. User selects elements → task sent to cloud → results returned.

**Browser Extension — Local-Companion:** Extension → local EXE via native messaging. Fully offline. EXE = execution engine, extension = UI.

---

## 3. Finalized Technology Stack

### 3.1 Core Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Language** | Python 3.12+ | Async-native, rich scraping ecosystem, Playwright support |
| **Web Framework** | FastAPI + Uvicorn | High-performance async API, auto OpenAPI docs |
| **Database** | PostgreSQL 16 | Relational metadata, JSONB, proven at scale |
| **Queue/Cache** | Redis 7 / Valkey | Job queue, caching, rate limiting, pub/sub |
| **Object Storage** | S3-compatible (MinIO local, S3/GCS cloud) | Artifacts (screenshots, HTML, files) |
| **Browser Automation** | Playwright (Python) | Cross-browser, async, stealth plugins |
| **HTTP Client** | httpx + curl_cffi | httpx standard, curl_cffi for TLS fingerprint matching |
| **AI** | Anthropic Claude API | Haiku for bulk routing, Sonnet for complex repair |
| **Desktop Shell** | Tauri 2.0 | Lightweight Rust + web frontend, native messaging |
| **Browser Extension** | Chrome Manifest V3 | Standard extension arch, service workers |
| **Frontend** | React 18 + TypeScript + TailwindCSS | Shared between dashboard and Tauri |
| **ORM** | SQLAlchemy 2.0 (async) | Mature, async, excellent PostgreSQL support |
| **Migrations** | Alembic | Standard for SQLAlchemy |
| **Testing** | pytest + pytest-asyncio | Async-native, rich plugins |
| **Observability** | OpenTelemetry + structlog | Structured logging, tracing, metrics |
| **Containers** | Docker + Docker Compose | Standard deployment |
| **CI/CD** | GitHub Actions | Integrated with repo |

### 3.2 Python Dependencies (pyproject.toml)

```toml
[project]
name = "scraper-app"
version = "0.1.0"
requires-python = ">=3.12"

dependencies = [
    "fastapi>=0.115.0",
    "uvicorn[standard]>=0.30.0",
    "pydantic>=2.9.0",
    "pydantic-settings>=2.5.0",
    "sqlalchemy[asyncio]>=2.0.35",
    "asyncpg>=0.30.0",
    "alembic>=1.14.0",
    "redis[hiredis]>=5.2.0",
    "httpx>=0.27.0",
    "curl-cffi>=0.7.0",
    "playwright>=1.49.0",
    "selectolax>=0.3.21",
    "lxml>=5.3.0",
    "anthropic>=0.39.0",
    "boto3>=1.35.0",
    "structlog>=24.4.0",
    "opentelemetry-api>=1.28.0",
    "opentelemetry-sdk>=1.28.0",
    "prometheus-client>=0.21.0",
    "orjson>=3.10.0",
    "python-dotenv>=1.0.1",
    "tenacity>=9.0.0",
    "croniter>=3.0.0",
    "cryptography>=43.0.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.3.0",
    "pytest-asyncio>=0.24.0",
    "pytest-cov>=6.0.0",
    "ruff>=0.8.0",
    "mypy>=1.13.0",
    "respx>=0.21.0",
    "factory-boy>=3.3.0",
]
```

### 3.3 Frontend Dependencies

```
react, react-dom, react-router-dom, @tanstack/react-query, zustand,
tailwindcss, lucide-react, axios, zod, typescript, vite, vitest
```

---

## 4. Project Setup & Dependencies

### 4.1 Monorepo Structure

```
scraper-app/
├── packages/
│   ├── core/              — Core engine (router, task lifecycle, registry)
│   ├── contracts/         — Shared Pydantic models (task, result, session, policy)
│   ├── connectors/        — Extraction connectors (API, HTTP, browser, unlocker)
│   ├── ai/                — AI routing/repair/normalization
│   ├── sessions/          — Session management (proxy, captcha, cookies)
│   └── storage/           — Storage abstraction (postgres, redis, s3, local)
├── services/
│   ├── control_plane/     — FastAPI control plane API
│   ├── workers/           — Background task workers
│   └── session_service/   — Session management microservice
├── apps/
│   ├── web/               — React web dashboard (Vite)
│   ├── desktop/           — Tauri Windows EXE
│   └── extension/         — Chrome browser extension (Manifest V3)
├── infrastructure/
│   ├── docker/            — Dockerfiles + docker-compose.yml
│   └── k8s/               — Kubernetes manifests (optional)
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── scripts/               — Setup, migration, build, seed scripts
├── system/                — Project memory files
├── docs/                  — Specifications and roadmaps
└── pyproject.toml
```

### 4.2 Environment Variables (.env)

```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/scraper
DATABASE_POOL_SIZE=20

# Redis
REDIS_URL=redis://localhost:6379/0

# Object Storage
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=scraper-artifacts

# AI
ANTHROPIC_API_KEY=sk-ant-...
AI_MODEL_BULK=claude-haiku-4-5-20251001
AI_MODEL_PREMIUM=claude-sonnet-4-6

# Proxy
PROXY_PROVIDER=brightdata
PROXY_URL=http://...
PROXY_USERNAME=...
PROXY_PASSWORD=...

# CAPTCHA
CAPTCHA_PROVIDER=2captcha
CAPTCHA_API_KEY=...

# App
APP_ENV=development
APP_SECRET_KEY=...
LOG_LEVEL=INFO
```

### 4.3 Initial Setup Steps

```bash
# 1. Clone repo
git clone https://github.com/haqeeqiazadee-ux/Scraper-app.git && cd Scraper-app

# 2. Python env
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"

# 3. Playwright browsers
playwright install chromium firefox

# 4. Environment
cp .env.example .env  # Edit with your credentials

# 5. Infrastructure
docker compose -f infrastructure/docker/docker-compose.yml up -d postgres redis minio

# 6. Database
alembic upgrade head

# 7. Frontend
cd apps/web && npm install && cd ../..

# 8. Verify
pytest tests/ -x --tb=short
```

---

## 5. Core Architecture

### 5.1 Architecture Diagram (Conceptual)

```
┌─────────────────────────────────────────────────────────┐
│                    RUNTIME SHELLS                        │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌────────┐ │
│  │ Web      │  │ Desktop  │  │ Extension │  │  API   │ │
│  │ Dashboard│  │ (Tauri)  │  │ (Chrome)  │  │ Direct │ │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘  └───┬────┘ │
└───────┼──────────────┼──────────────┼────────────┼──────┘
        │              │              │            │
        ▼              ▼              ▼            ▼
┌─────────────────────────────────────────────────────────┐
│                  CONTROL PLANE (FastAPI)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Task API │  │ Auth/    │  │ Quota/   │  │ Result  │ │
│  │          │  │ Tenant   │  │ Billing  │  │ API     │ │
│  └────┬─────┘  └──────────┘  └──────────┘  └─────────┘ │
└───────┼─────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│                    CORE ENGINE                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │              EXECUTION ROUTER                     │   │
│  │   (AI-assisted lane selection + policy engine)    │   │
│  └────┬─────────┬──────────┬──────────┬─────────────┘   │
│       │         │          │          │                  │
│       ▼         ▼          ▼          ▼                  │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐         │
│  │API/Feed│ │  HTTP  │ │Browser │ │Hard-Tgt  │         │
│  │ Lane   │ │  Lane  │ │  Lane  │ │  Lane    │         │
│  └────────┘ └────────┘ └────────┘ └──────────┘         │
│       │         │          │          │                  │
│       ▼         ▼          ▼          ▼                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │           NORMALIZATION LAYER (AI-assisted)       │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│                   STORAGE LAYER                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │PostgreSQL│  │  Redis   │  │  S3/     │              │
│  │(metadata)│  │(queue/   │  │  MinIO   │              │
│  │          │  │ cache)   │  │(artifacts)│              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Core Engine Components

The core engine lives in `packages/core/` and is the SHARED heart of all runtime modes.

**engine.py — Main Orchestrator:**
```python
class ScraperEngine:
    """Central orchestrator. All runtime shells call this."""

    def __init__(self, config: EngineConfig, storage: StorageBackend,
                 session_mgr: SessionManager, ai_layer: AILayer):
        self.router = ExecutionRouter(config, ai_layer)
        self.storage = storage
        self.session_mgr = session_mgr
        self.registry = ConnectorRegistry()

    async def execute_task(self, task: TaskSchema) -> RunResult:
        """Execute a scraping task through the appropriate lane."""
        # 1. Validate task against policy
        policy = await self.storage.get_policy(task.policy_id)
        task.validate_against(policy)

        # 2. Route to best execution lane
        lane = await self.router.select_lane(task, policy)

        # 3. Acquire session (proxy, cookies, browser profile)
        session = await self.session_mgr.acquire(task, lane)

        # 4. Execute through selected connector
        connector = self.registry.get(lane)
        raw_result = await connector.execute(task, session)

        # 5. Normalize result (AI-assisted if needed)
        normalized = await self.normalizer.normalize(raw_result, task.schema)

        # 6. Store result and artifacts
        run = await self.storage.save_run(task, normalized)

        # 7. Release session
        await self.session_mgr.release(session)

        return run
```

**router.py — Execution Lane Router:**
```python
class ExecutionRouter:
    """Selects the optimal execution lane for a task."""

    LANE_PRIORITY = [
        LaneType.API_FEED,      # Cheapest, most reliable
        LaneType.HTTP,           # Fast, low cost
        LaneType.BROWSER,        # Expensive but flexible
        LaneType.HARD_TARGET,    # Last resort (unlockers)
    ]

    async def select_lane(self, task: TaskSchema, policy: PolicySchema) -> LaneType:
        # 1. Check if site has a known API/feed
        if await self._has_api_feed(task.target_url):
            return LaneType.API_FEED

        # 2. Check site difficulty score from history
        difficulty = await self._get_site_difficulty(task.target_domain)

        # 3. If simple static site, use HTTP lane
        if difficulty.score < 30 and not difficulty.requires_js:
            return LaneType.HTTP

        # 4. If JS-heavy or moderate difficulty, use browser
        if difficulty.score < 70:
            return LaneType.BROWSER

        # 5. Hard target — use unlocker services
        if difficulty.score >= 70:
            return LaneType.HARD_TARGET

        # 6. If no history, ask AI for routing recommendation
        return await self.ai_layer.recommend_lane(task)
```

### 5.3 Data Flow (Single Task Execution)

```
1. Client submits task via API/UI/Extension
2. Control Plane validates + enqueues task in Redis
3. Worker picks up task from queue
4. Engine.execute_task() is called
5. Router selects execution lane (deterministic first, AI fallback)
6. Session manager provides proxy/cookies/browser profile
7. Connector executes the extraction
8. If extraction fails → AI repair attempt (max 2 retries)
9. Normalizer maps raw data to target schema
10. Results saved to PostgreSQL, artifacts to S3
11. Client notified via webhook/polling/SSE
```

---

## 6. Shared Data Contracts

All data contracts live in `packages/contracts/` as Pydantic v2 models. These are shared across ALL runtime modes.

### 6.1 Task Schema

```python
class TaskSchema(BaseModel):
    """Defines a scraping task."""
    id: str = Field(default_factory=lambda: str(uuid4()))
    tenant_id: str
    target_url: str
    target_domain: str  # auto-extracted
    task_type: TaskType  # SINGLE_PAGE | CRAWL | MONITOR | BATCH
    extraction_schema: dict  # Target data shape (JSON Schema)
    policy_id: str | None = None
    priority: Priority = Priority.NORMAL
    max_retries: int = 3
    timeout_seconds: int = 60
    schedule: str | None = None  # cron expression for recurring
    metadata: dict = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    status: TaskStatus = TaskStatus.PENDING
```

### 6.2 Result Schema

```python
class ResultSchema(BaseModel):
    """Extraction result."""
    id: str = Field(default_factory=lambda: str(uuid4()))
    task_id: str
    run_id: str
    data: dict  # Extracted structured data
    raw_html_artifact_id: str | None = None
    screenshot_artifact_id: str | None = None
    extraction_method: LaneType
    confidence_score: float  # 0.0 - 1.0
    ai_repaired: bool = False
    normalized: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

### 6.3 Session Schema

```python
class SessionSchema(BaseModel):
    """Represents a scraping session with proxy/cookie/browser state."""
    id: str = Field(default_factory=lambda: str(uuid4()))
    proxy_url: str | None = None
    cookies: dict = Field(default_factory=dict)
    browser_profile_id: str | None = None
    user_agent: str | None = None
    health_score: float = 1.0  # 0.0 = dead, 1.0 = healthy
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_used_at: datetime | None = None
    request_count: int = 0
    failure_count: int = 0
    domain_affinity: str | None = None  # Sticky to one domain
```

### 6.4 Policy Schema

```python
class PolicySchema(BaseModel):
    """Routing and execution policy for a domain/task type."""
    id: str = Field(default_factory=lambda: str(uuid4()))
    domain_pattern: str  # e.g., "*.amazon.com"
    preferred_lane: LaneType | None = None
    blocked_lanes: list[LaneType] = Field(default_factory=list)
    max_concurrency: int = 5
    rate_limit_rpm: int = 60
    proxy_required: bool = False
    proxy_type: ProxyType | None = None  # RESIDENTIAL | DATACENTER | MOBILE
    captcha_strategy: CaptchaStrategy = CaptchaStrategy.AUTO
    retry_policy: RetryPolicy = RetryPolicy()
    ai_routing_enabled: bool = True
```

### 6.5 Run Schema

```python
class RunSchema(BaseModel):
    """A single execution attempt for a task."""
    id: str = Field(default_factory=lambda: str(uuid4()))
    task_id: str
    lane_used: LaneType
    session_id: str
    status: RunStatus  # RUNNING | SUCCESS | FAILED | RETRYING
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: datetime | None = None
    duration_ms: int | None = None
    attempt_number: int = 1
    error: str | None = None
    result_id: str | None = None
```

### 6.6 Artifact Schema

```python
class ArtifactSchema(BaseModel):
    """Stored binary artifact (HTML, screenshot, PDF, etc.)."""
    id: str = Field(default_factory=lambda: str(uuid4()))
    run_id: str
    artifact_type: ArtifactType  # HTML | SCREENSHOT | PDF | JSON | CSV
    storage_path: str  # S3 key or local path
    size_bytes: int
    content_type: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

---

## 7. Execution Lanes & Routing Logic

### 7.1 Lane Types

| Lane | When Used | Cost | Reliability | Speed |
|------|-----------|------|-------------|-------|
| **API/Feed** | Site has public API or RSS/Atom feed | Free-Low | Very High | Very Fast |
| **HTTP** | Static/SSR pages, no JS required | Low | High | Fast |
| **Browser** | JS-rendered pages, SPAs, login-required | Medium | Medium | Slow |
| **Hard-Target** | Anti-bot protected sites (Cloudflare, etc.) | High | Variable | Slow |
| **AI Normalization** | Post-extraction data cleanup | Medium | High | Fast |

### 7.2 Routing Decision Tree

```python
async def route_task(task, policy, site_history):
    # Step 1: Policy override — if policy specifies a lane, use it
    if policy and policy.preferred_lane:
        return policy.preferred_lane

    # Step 2: Known API/feed — check registry
    api_config = await api_registry.lookup(task.target_domain)
    if api_config:
        return LaneType.API_FEED

    # Step 3: Site history — use past success data
    if site_history:
        best_lane = site_history.most_successful_lane()
        if best_lane.success_rate > 0.8:
            return best_lane.lane_type

    # Step 4: Heuristic check — does the page need JS?
    probe = await http_probe(task.target_url)
    if probe.is_static and probe.has_structured_content:
        return LaneType.HTTP

    # Step 5: Default to browser for JS-heavy sites
    if probe.requires_javascript:
        return LaneType.BROWSER

    # Step 6: If everything looks hard, try browser first then escalate
    return LaneType.BROWSER

    # Note: Hard-target lane is reached via RETRY escalation,
    # not as a first-choice route
```

### 7.3 Retry & Escalation Logic

```
Attempt 1: Selected lane (e.g., HTTP)
  → If fails with block/403/captcha:
Attempt 2: Escalate to next lane (e.g., Browser + residential proxy)
  → If fails again:
Attempt 3: Escalate to hard-target lane (unlocker service)
  → If fails:
Mark FAILED, log reason, notify operator
```

---

## 8. Connector Strategy & Coding Logic

### 8.1 Connector Interface (Abstract Base)

```python
class BaseConnector(ABC):
    """All connectors implement this interface."""

    @abstractmethod
    async def execute(self, task: TaskSchema, session: SessionSchema) -> RawResult:
        """Execute extraction and return raw result."""
        ...

    @abstractmethod
    async def health_check(self) -> bool:
        """Check if this connector is operational."""
        ...

    @abstractmethod
    def supported_features(self) -> set[Feature]:
        """What this connector can do (JS rendering, login, etc.)."""
        ...
```

### 8.2 API/Feed Connector

```python
class APIConnector(BaseConnector):
    """Extracts data from known APIs and feeds (RSS, Atom, JSON APIs)."""

    async def execute(self, task, session):
        api_config = await self.registry.get_api_config(task.target_domain)

        if api_config.auth_type == AuthType.API_KEY:
            headers = {"Authorization": f"Bearer {api_config.api_key}"}
        elif api_config.auth_type == AuthType.OAUTH:
            token = await self.oauth_manager.get_token(api_config)
            headers = {"Authorization": f"Bearer {token}"}
        else:
            headers = {}

        async with httpx.AsyncClient() as client:
            response = await client.get(
                api_config.endpoint_url,
                headers=headers,
                params=task.api_params,
                timeout=task.timeout_seconds,
            )
            response.raise_for_status()

        return RawResult(
            data=response.json(),
            source=LaneType.API_FEED,
            status_code=response.status_code,
        )
```

### 8.3 HTTP Connector

```python
class HTTPConnector(BaseConnector):
    """Fast HTTP-based extraction with deterministic parsers."""

    async def execute(self, task, session):
        # Use curl_cffi for browser-like TLS fingerprint
        from curl_cffi.requests import AsyncSession

        async with AsyncSession() as s:
            response = await s.get(
                task.target_url,
                headers=self._build_headers(session),
                proxy=session.proxy_url,
                impersonate="chrome",  # TLS fingerprint matching
                timeout=task.timeout_seconds,
            )

        # Parse with selectolax (fast C-based parser)
        tree = HTMLParser(response.text)

        # Apply extraction rules from task schema
        data = self._extract_with_rules(tree, task.extraction_schema)

        return RawResult(
            data=data,
            raw_html=response.text,
            source=LaneType.HTTP,
            status_code=response.status_code,
        )
```

### 8.4 Browser Connector

```python
class BrowserConnector(BaseConnector):
    """Playwright-based browser automation for JS-heavy sites."""

    def __init__(self, browser_pool: BrowserPool):
        self.pool = browser_pool

    async def execute(self, task, session):
        browser_ctx = await self.pool.acquire(
            proxy=session.proxy_url,
            cookies=session.cookies,
            profile_id=session.browser_profile_id,
        )

        try:
            page = await browser_ctx.new_page()
            await page.set_extra_http_headers(self._stealth_headers())

            # Navigate with wait for network idle
            await page.goto(task.target_url, wait_until="networkidle")

            # Wait for specific selectors if defined in task
            if task.wait_for_selector:
                await page.wait_for_selector(task.wait_for_selector, timeout=15000)

            # Extract using page.evaluate() for JS-rendered content
            data = await page.evaluate(self._build_extraction_js(task.extraction_schema))

            # Capture artifacts
            html = await page.content()
            screenshot = await page.screenshot(full_page=True)

            return RawResult(
                data=data,
                raw_html=html,
                screenshot=screenshot,
                source=LaneType.BROWSER,
                status_code=200,
            )
        finally:
            await self.pool.release(browser_ctx)
```

### 8.5 Hard-Target / Unlocker Connector

```python
class UnlockerConnector(BaseConnector):
    """Uses third-party unlocker services for anti-bot protected sites."""

    PROVIDERS = {
        "brightdata": BrightDataUnlocker,
        "scrapingbee": ScrapingBeeUnlocker,
        "zenrows": ZenRowsUnlocker,
    }

    async def execute(self, task, session):
        provider = self.PROVIDERS[self.config.unlocker_provider]

        result = await provider.fetch(
            url=task.target_url,
            render_js=True,
            premium_proxy=True,
            country=task.geo_target,
        )

        # Parse the unblocked HTML
        tree = HTMLParser(result.html)
        data = self._extract_with_rules(tree, task.extraction_schema)

        return RawResult(
            data=data,
            raw_html=result.html,
            source=LaneType.HARD_TARGET,
            status_code=result.status_code,
            cost=result.cost,
        )
```

---

## 9. Session Management

### 9.1 Session Lifecycle

```
CREATE → IDLE → ACTIVE → (HEALTHY → reuse) or (DEGRADED → rotate) or (DEAD → destroy)
```

### 9.2 Session Manager Coding Logic

```python
class SessionManager:
    """Manages proxy sessions, cookies, browser profiles."""

    async def acquire(self, task: TaskSchema, lane: LaneType) -> SessionSchema:
        # 1. Check for reusable session with domain affinity
        existing = await self._find_reusable(task.target_domain, lane)
        if existing and existing.health_score > 0.5:
            existing.last_used_at = datetime.utcnow()
            return existing

        # 2. Create new session
        proxy = await self.proxy_provider.get_proxy(
            proxy_type=task.policy.proxy_type or ProxyType.DATACENTER,
            country=task.geo_target,
            sticky=True,
        )

        session = SessionSchema(
            proxy_url=proxy.url,
            user_agent=self._random_user_agent(),
            domain_affinity=task.target_domain,
        )

        await self.storage.save_session(session)
        return session

    async def release(self, session: SessionSchema):
        """Release session back to pool or destroy if unhealthy."""
        session.request_count += 1

        if session.health_score < 0.3:
            await self._destroy(session)
        else:
            session.status = SessionStatus.IDLE
            await self.storage.update_session(session)

    async def report_failure(self, session: SessionSchema, error: Exception):
        """Degrade session health on failure."""
        session.failure_count += 1
        session.health_score = max(0, session.health_score - 0.25)

        if isinstance(error, (CaptchaError, BlockedError)):
            session.health_score = 0  # Immediately kill
```

### 9.3 Browser Profile Reuse

```python
class BrowserPool:
    """Manages a pool of browser contexts with persistent profiles."""

    def __init__(self, max_browsers: int = 10):
        self.max_browsers = max_browsers
        self.playwright = None
        self.browsers: dict[str, BrowserContext] = {}

    async def acquire(self, proxy=None, cookies=None, profile_id=None):
        if profile_id and profile_id in self.browsers:
            return self.browsers[profile_id]

        browser = await self.playwright.chromium.launch(
            headless=True,
            args=["--disable-blink-features=AutomationControlled"],
        )

        context = await browser.new_context(
            proxy={"server": proxy} if proxy else None,
            user_agent=random_user_agent(),
            viewport={"width": 1920, "height": 1080},
            locale="en-US",
        )

        if cookies:
            await context.add_cookies(cookies)

        if profile_id:
            self.browsers[profile_id] = context

        return context
```

---

## 10. Proxy & CAPTCHA Strategy

### 10.1 Proxy Provider Abstraction

```python
class ProxyProvider(ABC):
    @abstractmethod
    async def get_proxy(self, proxy_type, country, sticky) -> ProxyConfig: ...
    @abstractmethod
    async def release_proxy(self, proxy: ProxyConfig): ...
    @abstractmethod
    async def health_check(self) -> bool: ...

class BrightDataProxy(ProxyProvider): ...
class OxylabsProxy(ProxyProvider): ...
class LocalProxy(ProxyProvider):  # For EXE local mode
    """Uses system proxy or direct connection."""
```

### 10.2 CAPTCHA Strategy

| Scenario | Action |
|----------|--------|
| No CAPTCHA | Proceed normally |
| Simple CAPTCHA (reCAPTCHA v2) | Solve via 2captcha/CapSolver |
| reCAPTCHA v3 | Use residential proxy to avoid triggering |
| hCaptcha | Solve via specialized service |
| Cloudflare Challenge | Escalate to hard-target lane |
| Unsolvable | Abandon + log + notify operator |

```python
class CaptchaSolver:
    async def solve(self, captcha_type, page_url, site_key):
        if self.config.provider == "2captcha":
            return await TwoCaptchaSolver().solve(captcha_type, page_url, site_key)
        elif self.config.provider == "capsolver":
            return await CapSolver().solve(captcha_type, page_url, site_key)
        else:
            raise CaptchaError(f"Unknown provider: {self.config.provider}")
```

---

## 11. AI Layer

### 11.1 AI Responsibilities

| Function | Model | When Used |
|----------|-------|-----------|
| **Lane Routing** | Haiku | When no history/policy exists for a domain |
| **Extraction Repair** | Sonnet | When deterministic extraction returns incomplete/broken data |
| **Schema Normalization** | Haiku | Map raw extracted fields to target schema |
| **Dedup Assistance** | Haiku | Identify duplicate entities across results |
| **Selector Generation** | Sonnet | Generate CSS/XPath selectors from natural language |

### 11.2 AI Router Logic

```python
class AIRouter:
    """Uses Claude to recommend execution lane for unknown sites."""

    async def recommend_lane(self, task: TaskSchema) -> LaneType:
        # Probe the site first (cheap HTTP HEAD + partial GET)
        probe = await self._probe_site(task.target_url)

        prompt = f"""Analyze this website and recommend the best scraping approach.

URL: {task.target_url}
HTTP Status: {probe.status_code}
Content-Type: {probe.content_type}
Has JS frameworks: {probe.has_js_frameworks}
Anti-bot headers: {probe.anti_bot_signals}
Response size: {probe.size_bytes} bytes

Recommend ONE of: API_FEED, HTTP, BROWSER, HARD_TARGET
Respond with just the lane name and a one-line reason."""

        response = await self.client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=100,
            messages=[{"role": "user", "content": prompt}],
        )

        return self._parse_lane(response.content[0].text)
```

### 11.3 AI Extraction Repair

```python
class AIRepair:
    """Repairs broken/incomplete extraction results using Claude."""

    async def repair(self, raw_result: RawResult, expected_schema: dict) -> dict:
        prompt = f"""The following extraction produced incomplete results.

Expected schema: {json.dumps(expected_schema, indent=2)}

Extracted data: {json.dumps(raw_result.data, indent=2)}

Raw HTML snippet (first 3000 chars):
{raw_result.raw_html[:3000]}

Please extract the missing fields from the HTML and return
a complete JSON object matching the expected schema."""

        response = await self.client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}],
        )

        return json.loads(response.content[0].text)
```

### 11.4 What AI Must NOT Do

- AI must NOT be the default extraction method for every page
- AI must NOT replace deterministic CSS/XPath selectors when they work
- AI must NOT make routing decisions for sites with known policies
- AI costs must be tracked and capped per tenant

---

## 12. Storage Architecture

### 12.1 Storage Layer Design

```python
class StorageBackend(ABC):
    """Unified storage interface — same contract for all deployment modes."""

    # Metadata (relational)
    @abstractmethod
    async def save_task(self, task: TaskSchema) -> str: ...
    @abstractmethod
    async def get_task(self, task_id: str) -> TaskSchema: ...
    @abstractmethod
    async def save_run(self, run: RunSchema) -> str: ...
    @abstractmethod
    async def save_result(self, result: ResultSchema) -> str: ...

    # Artifacts (object storage)
    @abstractmethod
    async def save_artifact(self, data: bytes, artifact: ArtifactSchema) -> str: ...
    @abstractmethod
    async def get_artifact(self, artifact_id: str) -> bytes: ...

    # Queue (task queue)
    @abstractmethod
    async def enqueue_task(self, task: TaskSchema): ...
    @abstractmethod
    async def dequeue_task(self) -> TaskSchema | None: ...

    # Cache
    @abstractmethod
    async def cache_get(self, key: str) -> str | None: ...
    @abstractmethod
    async def cache_set(self, key: str, value: str, ttl: int): ...
```

### 12.2 Storage Implementations

| Deployment Mode | Metadata | Artifacts | Queue | Cache |
|----------------|----------|-----------|-------|-------|
| **Cloud SaaS** | PostgreSQL | S3 | Redis | Redis |
| **Self-Hosted** | PostgreSQL | MinIO | Redis | Redis |
| **Windows EXE (local)** | SQLite | Local filesystem | In-memory queue | In-memory |
| **Windows EXE (hybrid)** | Remote PostgreSQL | Remote S3 | Remote Redis | Local + Remote |

```python
class PostgresStorage(StorageBackend):
    """PostgreSQL + S3 + Redis — for cloud and self-hosted modes."""
    ...

class LocalStorage(StorageBackend):
    """SQLite + filesystem + in-memory queue — for EXE local mode."""
    ...
```

---

## 13. Control Plane API

### 13.1 API Structure (FastAPI)

```
services/control_plane/
├── main.py              — App creation, middleware, lifespan
├── dependencies.py      — Dependency injection (DB, Redis, Engine)
├── routes/
│   ├── tasks.py         — POST /tasks, GET /tasks/{id}, DELETE /tasks/{id}
│   ├── results.py       — GET /results/{task_id}, GET /results/{id}/artifacts
│   ├── policies.py      — CRUD for routing policies
│   ├── sessions.py      — Session management endpoints
│   ├── tenants.py       — Tenant CRUD, quota management
│   ├── health.py        — GET /health, GET /ready
│   └── webhooks.py      — Webhook registration and management
├── middleware/
│   ├── auth.py          — API key / JWT authentication
│   ├── rate_limit.py    — Per-tenant rate limiting (Redis)
│   └── logging.py       — Request/response logging
└── models/
    └── api_models.py    — Request/response Pydantic models
```

### 13.2 Key API Endpoints

```
POST   /api/v1/tasks              — Submit a new scraping task
GET    /api/v1/tasks/{id}         — Get task status and details
GET    /api/v1/tasks/{id}/results — Get task results
DELETE /api/v1/tasks/{id}         — Cancel a task
POST   /api/v1/tasks/batch        — Submit multiple tasks
GET    /api/v1/tasks?status=...   — List tasks with filters

GET    /api/v1/results/{id}       — Get specific result
GET    /api/v1/results/{id}/artifacts/{type} — Download artifact

POST   /api/v1/policies           — Create routing policy
GET    /api/v1/policies           — List policies
PUT    /api/v1/policies/{id}      — Update policy
DELETE /api/v1/policies/{id}      — Delete policy

GET    /api/v1/tenants/me         — Current tenant info
GET    /api/v1/tenants/me/usage   — Usage stats and quota

GET    /api/v1/health             — Health check
GET    /api/v1/ready              — Readiness probe
```

### 13.3 API Integration Design

The API is designed for easy integration into other apps:

```python
# Example: Integrating into another Python app
import httpx

client = httpx.AsyncClient(
    base_url="https://scraper.yourdomain.com/api/v1",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
)

# Submit a task
task = await client.post("/tasks", json={
    "target_url": "https://example.com/products",
    "extraction_schema": {
        "type": "object",
        "properties": {
            "title": {"type": "string"},
            "price": {"type": "number"},
            "image_url": {"type": "string"},
        }
    }
})
task_id = task.json()["id"]

# Poll for results (or use webhooks)
result = await client.get(f"/tasks/{task_id}/results")
```

---

## 14. Runtime Shells

### 14.1 Web Dashboard (apps/web/)

React SPA with:
- Task submission wizard (URL input → schema builder → submit)
- Real-time task monitoring (SSE/WebSocket)
- Results viewer with data table + JSON viewer
- Policy management UI
- Usage dashboard (quota, billing, costs)
- Connector health status

### 14.2 Windows EXE — Tauri (apps/desktop/)

```
apps/desktop/
├── src-tauri/
│   ├── src/
│   │   ├── main.rs          — Tauri entry point
│   │   ├── commands.rs      — IPC commands (Rust → Python bridge)
│   │   ├── native_msg.rs    — Native messaging host for extension
│   │   └── python_bridge.rs — Starts/manages embedded Python process
│   ├── Cargo.toml
│   └── tauri.conf.json
├── src/                     — Shared React frontend
└── package.json
```

**Architecture:**
- Tauri Rust backend spawns a Python sidecar process running the core engine
- Communication via IPC (Tauri commands → stdin/stdout JSON-RPC to Python)
- Local mode: Python engine uses SQLite + local filesystem
- Hybrid mode: Python engine connects to remote PostgreSQL/Redis/S3
- Native messaging host registered for browser extension companion mode

### 14.3 Browser Extension (apps/extension/)

```
apps/extension/
├── manifest.json           — Manifest V3
├── background/
│   └── service-worker.js   — Background service worker
├── content/
│   └── content-script.js   — Injected into pages for element selection
├── popup/
│   ├── index.html
│   └── popup.js            — Extension popup UI
├── options/
│   └── options.js          — Extension settings
└── native-messaging/
    └── com.scraper.host.json — Native messaging host manifest
```

**Modes:**
- **Cloud-connected:** Extension → cloud API (same as web dashboard API)
- **Local-companion:** Extension → native messaging → Tauri EXE → Python engine

---

## 15. Security Model

### 15.1 Authentication & Authorization

| Context | Method |
|---------|--------|
| API access | API key (per tenant) + optional JWT |
| Web dashboard | JWT (short-lived access + refresh tokens) |
| Extension | API key stored in extension storage (encrypted) |
| Desktop EXE | Local auth (optional) or remote API key |
| Tenant isolation | Row-level security in PostgreSQL |

### 15.2 Secrets Management

- All secrets in environment variables (never in code)
- Proxy credentials encrypted at rest (Fernet/AES)
- API keys hashed in database (bcrypt), stored encrypted in extension
- OAuth tokens encrypted with tenant-specific key

### 15.3 Extension Security

- Content Security Policy enforced in manifest.json
- No eval(), no inline scripts
- Native messaging only with registered host
- Extension permissions minimized (activeTab, not <all_urls>)
- API key stored in chrome.storage.local (encrypted)

### 15.4 Trust Boundaries

```
Browser Extension ←→ [Native Messaging (validated JSON)] ←→ Tauri EXE
Browser Extension ←→ [HTTPS + API Key] ←→ Cloud API
Tauri EXE ←→ [Local IPC] ←→ Python Engine
Python Engine ←→ [TLS + Auth] ←→ PostgreSQL/Redis/S3
```

---

## 16. Observability

### 16.1 Structured Logging

```python
import structlog

logger = structlog.get_logger()

# Every log entry includes:
# - timestamp, level, event
# - task_id, run_id, tenant_id (via context)
# - lane_type, connector, domain
# - duration_ms, status_code, error

logger.info("task.executed",
    task_id=task.id,
    lane=lane.value,
    duration_ms=elapsed,
    status="success",
)
```

### 16.2 Metrics (Prometheus)

```
scraper_tasks_total{status, lane, tenant}          — Total tasks
scraper_task_duration_seconds{lane}                 — Execution time histogram
scraper_connector_errors_total{connector, error}    — Connector errors
scraper_ai_calls_total{model, function}             — AI API calls
scraper_proxy_usage_total{provider, type}           — Proxy usage
scraper_session_health{domain}                      — Session health gauge
scraper_queue_depth                                 — Task queue depth
```

### 16.3 Distributed Tracing (OpenTelemetry)

```
Task Submit → Control Plane → Queue → Worker → Engine →
  → Router → Connector → Normalizer → Storage → Result
```

Each span captures: task_id, lane, domain, duration, status, errors.

---

## 17. Testing Strategy

### 17.1 Test Pyramid

| Level | Count Target | What |
|-------|-------------|------|
| **Unit** | 200+ | Individual functions, parsers, models, routers |
| **Integration** | 50+ | Connector → Storage, Engine → Queue, API → DB |
| **E2E** | 20+ | Full task flow: submit → extract → result |
| **Browser** | 10+ | Playwright-based extension + desktop tests |
| **Packaging** | 5+ | Docker build, Tauri build, extension pack |

### 17.2 Test Structure

```
tests/
├── unit/
│   ├── test_router.py          — Lane routing logic
│   ├── test_contracts.py       — Schema validation
│   ├── test_parsers.py         — HTML extraction
│   ├── test_session_manager.py — Session lifecycle
│   ├── test_ai_layer.py        — AI function mocks
│   └── test_storage.py         — Storage adapters
├── integration/
│   ├── test_api_endpoints.py   — FastAPI routes
│   ├── test_task_flow.py       — Submit → execute → result
│   ├── test_connectors.py      — Real HTTP/browser extraction
│   └── test_queue.py           — Redis queue operations
├── e2e/
│   ├── test_full_pipeline.py   — Complete scraping flow
│   └── test_multi_tenant.py    — Tenant isolation
└── conftest.py                 — Shared fixtures (DB, Redis, mocks)
```

### 17.3 Testing Commands

```bash
# All tests
pytest tests/ -v --cov=packages

# Unit only
pytest tests/unit/ -v

# Integration (requires running DB/Redis)
pytest tests/integration/ -v --tb=long

# E2E
pytest tests/e2e/ -v --timeout=120
```

---

## 18. Deployment Strategy

### 18.1 Cloud SaaS Deployment

```yaml
# infrastructure/docker/docker-compose.yml
services:
  api:
    build: { dockerfile: Dockerfile.api }
    ports: ["8000:8000"]
    depends_on: [postgres, redis, minio]
    environment:
      DATABASE_URL: postgresql+asyncpg://...
      REDIS_URL: redis://redis:6379/0

  worker:
    build: { dockerfile: Dockerfile.worker }
    depends_on: [postgres, redis]
    deploy: { replicas: 3 }

  scheduler:
    build: { dockerfile: Dockerfile.worker }
    command: python -m services.workers.scheduler

  postgres:
    image: postgres:16-alpine
    volumes: [pgdata:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"

  web:
    build: { context: apps/web }
    ports: ["3000:80"]
```

### 18.2 Self-Hosted Deployment

Same Docker Compose with:
- All data stays on-premise
- Operator provides their own PostgreSQL/Redis or uses bundled
- Single `docker compose up` to start everything
- Configuration via `.env` file

### 18.3 Windows EXE Distribution

```bash
# Build Tauri app (produces .msi / .exe installer)
cd apps/desktop
npm run tauri build

# Output: src-tauri/target/release/bundle/msi/Scraper_x.y.z_x64.msi
```

Bundled with:
- Embedded Python runtime (PyInstaller or similar)
- Playwright chromium browser
- SQLite database (auto-created)
- Local storage directory

### 18.4 Browser Extension Distribution

```bash
# Build extension
cd apps/extension
npm run build

# Output: dist/ → ready for Chrome Web Store upload
# Or load unpacked from dist/ for development
```

---

## 19. Implementation Phases

### Phase 0 — Repository Setup (Week 1)
- [x] Create folder structure
- [x] Create all system/memory files
- [x] Create CLAUDE.md
- [x] Create Scraper Document v1
- [ ] Set up pyproject.toml with all dependencies
- [ ] Set up .env.example
- [ ] Set up Docker Compose for dev infrastructure
- [ ] Create initial Alembic migration

### Phase 1 — Shared Contracts & Core Engine (Week 2-3)
- [ ] Implement all Pydantic models in packages/contracts/
- [ ] Implement StorageBackend interface + PostgreSQL adapter
- [ ] Implement Redis queue adapter
- [ ] Implement ConnectorRegistry
- [ ] Implement ExecutionRouter (deterministic routing first)
- [ ] Implement ScraperEngine orchestrator
- [ ] Unit tests for all above

### Phase 2 — Connectors (Week 3-4)
- [ ] Implement HTTPConnector with curl_cffi
- [ ] Implement BrowserConnector with Playwright
- [ ] Implement APIConnector
- [ ] Implement UnlockerConnector (BrightData adapter)
- [ ] Implement SessionManager
- [ ] Implement ProxyProvider abstraction
- [ ] Integration tests for connectors

### Phase 3 — AI Layer (Week 4-5)
- [ ] Implement AIRouter (lane recommendation)
- [ ] Implement AIRepair (extraction repair)
- [ ] Implement AINormalizer (schema normalization)
- [ ] Cost tracking for AI calls
- [ ] Unit tests with mocked Claude API

### Phase 4 — Control Plane API (Week 5-6)
- [ ] FastAPI app setup with middleware
- [ ] Task CRUD endpoints
- [ ] Result endpoints
- [ ] Policy endpoints
- [ ] Authentication (API key + JWT)
- [ ] Rate limiting
- [ ] Integration tests for all endpoints

### Phase 5 — Workers & Queue (Week 6-7)
- [ ] Task worker (dequeue → engine.execute_task)
- [ ] Browser worker (manages Playwright browser pool)
- [ ] Scheduler (cron-based recurring tasks)
- [ ] Worker health monitoring
- [ ] Integration tests

### Phase 6 — Web Dashboard (Week 7-9)
- [ ] React project setup (Vite + TypeScript + Tailwind)
- [ ] Task submission UI
- [ ] Task monitoring dashboard
- [ ] Results viewer
- [ ] Policy management UI
- [ ] Usage/billing dashboard

### Phase 7 — Windows EXE (Week 9-11)
- [ ] Tauri project setup
- [ ] Python sidecar bridge
- [ ] Local storage adapter (SQLite)
- [ ] Local mode UI
- [ ] Hybrid mode (remote backend connection)
- [ ] Native messaging host for extension
- [ ] Build pipeline (.msi installer)

### Phase 8 — Browser Extension (Week 11-13)
- [ ] Manifest V3 setup
- [ ] Service worker (background)
- [ ] Content script (element selector)
- [ ] Popup UI
- [ ] Cloud-connected mode (API calls)
- [ ] Local-companion mode (native messaging)
- [ ] Extension packaging

### Phase 9 — Testing & Hardening (Week 13-15)
- [ ] Full E2E test suite
- [ ] Load testing (Locust)
- [ ] Security audit
- [ ] Error handling hardening
- [ ] Documentation

### Phase 10 — Deployment & Release (Week 15-16)
- [ ] Cloud deployment scripts
- [ ] Self-hosted deployment guide
- [ ] Windows EXE installer signing
- [ ] Chrome Web Store submission
- [ ] Final audit

---

## 20. Risk Matrix

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Anti-bot detection evolves | High | High | Multiple lanes, unlocker fallback, regular updates |
| Browser automation instability | Medium | Medium | Browser pool with health checks, auto-restart |
| Proxy costs spike | High | Medium | Cost caps per tenant, cheaper lanes first |
| Extension store rejection | Medium | Low | Follow manifest V3 guidelines strictly |
| Tauri + Python bridge complexity | Medium | Medium | Well-defined IPC protocol, thorough testing |
| AI costs exceed budget | Medium | Medium | Haiku for bulk, caps per tenant, deterministic first |
| Session/cookie management complexity | Medium | High | Health scoring, automatic rotation, domain affinity |
| Local↔Remote session transfer | High | Medium | Clear trust boundaries, encrypted transfer |
| PostgreSQL scaling limits | Low | Low | Connection pooling, read replicas, partitioning |
| Chrome Manifest V3 limitations | Medium | Medium | Service worker keepalive patterns, offscreen docs |

---

## End of Scraper Document v1

**Next steps:**
1. Create `docs/final_specs.md` — detailed implementation specification
2. Create `docs/tasks_breakdown.md` — atomic task breakdown with dependencies
3. Begin Phase 0 implementation (pyproject.toml, Docker Compose, Alembic)
```
