# YOUSELL FIX LOG

Track every bug fix to avoid duplicate work. Check this file before fixing anything.

---

## COMPLETED FIXES (Do Not Re-Fix)

### Infrastructure & Build
| ID | Fix | Commit | Files |
|----|-----|--------|-------|
| FIX-001 | Tailwind v3 config, CSS imports, content paths | 5458d56..03d3f34 | tailwind.config, globals.css |
| FIX-002 | Next.js pinned to 14.2.35 | 98d495b | package.json |
| FIX-003 | Tailwind/postcss/autoprefixer moved to deps | 3085fbf | package.json |
| FIX-004 | Add missing deps: lucide-react, @base-ui/react, cva | d1a32a7, 3e4c1dd | package.json |
| FIX-005 | Netlify config for Next.js deployment | 13b1df9 | netlify.toml |
| FIX-006 | Security headers + Node 18 in netlify.toml | (audit session) | netlify.toml |
| FIX-007 | `<img>` → `next/image` across 6 files | 7b94570 | admin pages |
| FIX-008 | TypeScript: products.data implicit any | 6d11149 | admin/page.tsx |
| FIX-009 | TypeScript: PreViralProduct nullable scores | 05a9b54 | admin/page.tsx |
| FIX-010 | TypeScript: Realtime subscribe status param | ec539a8 | admin/page.tsx |

### Auth & Security
| ID | Fix | Commit | Files |
|----|-----|--------|-------|
| FIX-011 | Login page: real Supabase auth form | b780655 | login/page.tsx |
| FIX-012 | Login redirect loop in admin layout | 2349c32 | admin/layout.tsx |
| FIX-013 | Access Denied: RPC to bypass RLS in middleware | 69d3d09 | middleware.ts |
| FIX-014 | Middleware: accept super_admin role | (audit) | middleware.ts |
| FIX-015 | requireAdmin(): accept super_admin | (audit) | lib/auth/roles.ts |
| FIX-016 | UserRole type: add super_admin, viewer | (audit) | lib/types/database.ts |
| FIX-017 | Admin layout: defense-in-depth role check | (audit) | admin/layout.tsx |
| FIX-018 | Secrets leaked to client via next.config env:{} — removed | (audit) | next.config.mjs |
| FIX-019 | Auth callback open redirect via `next` param | (QA) | api/auth/callback/route.ts |
| FIX-020 | check_user_role RPC: revoke anon access | (QA) | migration 015 |
| FIX-021 | Admin login: router.push → window.location.href | (session fix) | admin/login/page.tsx |
| FIX-022 | Client login: router.push → window.location.href | (audit) | login/page.tsx |
| FIX-023 | Admin sidebar not rendering (force-dynamic + cookie fallback) | (session fix) | admin/layout.tsx |
| FIX-024 | Root page: role-aware redirect (was hardcoded /admin/scan) | 53ff41e | page.tsx |
| FIX-025 | Client login: role-aware redirect (admin→/admin) | 53ff41e | login/page.tsx |

### Database & Table Names
| ID | Fix | Commit | Files |
|----|-----|--------|-------|
| FIX-026 | Table alignment: everything uses `scan_history` consistently | 5e486ec | multiple |
| FIX-027 | v7 tables migration (8 tables: subscriptions, platform_access, etc.) | (QA) | migration 009 |
| FIX-028 | product_clusters + product_cluster_members | (phase 2) | migration 012 |
| FIX-029 | creator_product_matches | (phase 3) | migration 013 |
| FIX-030 | ads table + competitor enhancements | (phase 5) | migration 014 |
| FIX-031 | tiktok_videos table | (phase 1) | migration 010 |
| FIX-032 | tiktok_hashtag_signals table | (phase 1) | migration 011 |

### API Routes
| ID | Fix | Commit | Files |
|----|-----|--------|-------|
| FIX-033 | Missing auth header in scan API route | 8bf670f | api/admin/scan/route.ts |
| FIX-034 | Settings route: inline role check → requireAdmin() | (QA) | api/admin/settings/route.ts |
| FIX-035 | Clients API: missing count in GET response | 53ff41e | api/admin/clients/route.ts |
| FIX-036 | Products API: cost/currency missing from whitelist | 53ff41e | api/admin/products/route.ts |

### Scoring & Business Logic
| ID | Fix | Commit | Files |
|----|-----|--------|-------|
| FIX-037 | 3-pillar scoring (0.40/0.35/0.25) replacing legacy 2-pillar | (QA) | lib/scoring/composite.ts |
| FIX-038 | Financial route: 8 auto-rejection rules (was 5) | (QA) | api/admin/financial/route.ts |

### Frontend Pages
| ID | Fix | Commit | Files |
|----|-----|--------|-------|
| FIX-039 | Admin dashboard: silent .catch → error banners (6 pages) | (QA) | admin/*.tsx |
| FIX-040 | Client dashboard: direct Supabase → API route calls | (QA) | dashboard/page.tsx |
| FIX-041 | Realtime: singleton browser client + debug logging | 9a28251 | admin/page.tsx |

### E2E / Debug
| ID | Fix | Commit | Files |
|----|-----|--------|-------|
| FIX-042 | E2E tests: RLS bypass + scans table reference | 6c6e8cf | api/admin/e2e/route.ts |
| FIX-043 | E2E tests: align with live DB schema | c6b6e5d | api/admin/e2e/route.ts |
| FIX-044 | Allocation test: orphaned test data cleanup | 03d0ca2 | api/admin/e2e/route.ts |
| FIX-045 | Debug test 1.4: query valid enum value only | 98a1c59 | api/admin/debug/route.ts |

---

## KNOWN ISSUES (Not Yet Fixed)

| ID | Issue | Severity | Notes |
|----|-------|----------|-------|
| OPEN-001 | Legacy duplicate tables (scans vs scan_history, allocations vs product_allocations, blueprints vs launch_blueprints) | Low | Noted for future cleanup |
| OPEN-002 | OAuth flows for store integrations not implemented | Medium | Connect buttons are UI-only placeholders |
| OPEN-003 | Content generation worker not implemented | Medium | Content studio page exists but no generation backend |
| OPEN-004 | Order tracking webhooks from stores not implemented | Medium | Orders page exists but no inbound webhook handlers |
| OPEN-005 | Netlify domain aliases not configured | Config | Need admin.yousell.online + yousell.online in Netlify dashboard |
| OPEN-006 | Stripe env vars not set | Config | STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET needed in Netlify |

---

## HOW TO USE THIS LOG

Before fixing any bug:
1. Search this file for the symptom/file
2. If already listed under COMPLETED, skip it
3. If new, fix it and add an entry here with commit hash
