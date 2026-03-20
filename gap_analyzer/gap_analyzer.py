#!/usr/bin/env python3
"""
Ecommerce Competitive Gap Analysis Engine
==========================================
Scans up to 500+ ecommerce companies, analyses them against a project spec,
and produces a professional Word document competitive intelligence report.

Fully autonomous — zero human input required after launch.
"""

import argparse
import asyncio
import datetime
import glob as globmod
import hashlib
import json
import logging
import os
import signal
import sys
import tempfile
import time
import traceback
import uuid

# Ensure the script's directory is on the Python path so subpackages are found
_SCRIPT_DIR = os.path.realpath(os.path.join(os.getcwd(), os.path.dirname(__file__)))
if _SCRIPT_DIR not in sys.path:
    sys.path.insert(0, _SCRIPT_DIR)

from dotenv import load_dotenv

# ─── Setup logging ───────────────────────────────────────────────────────────
load_dotenv()

LOG_FORMAT = "[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

logger = logging.getLogger("gap_analyzer")
logger.setLevel(logging.DEBUG)

# Console handler (INFO+)
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.INFO)
console_handler.setFormatter(logging.Formatter(LOG_FORMAT, DATE_FORMAT))
logger.addHandler(console_handler)

# File handler (DEBUG+)
file_handler = logging.FileHandler("gap_analyzer.log", mode="a", encoding="utf-8")
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(logging.Formatter(LOG_FORMAT, DATE_FORMAT))
logger.addHandler(file_handler)

# Custom DECISION level
DECISION = 25
logging.addLevelName(DECISION, "DECISION")
HEARTBEAT = 26
logging.addLevelName(HEARTBEAT, "HEARTBEAT")


# ─── Imports from package ────────────────────────────────────────────────────
from loaders.specs_loader import (
    extract_project_profile,
    hash_file as hash_specs_file,
    print_project_summary,
    read_specs_file,
)
from loaders.excel_loader import load_companies, hash_file as hash_excel_file
from scrapers.firecrawl import FirecrawlScraper, build_scraped_document
from scrapers.playwright_scraper import PlaywrightScraper
from analysis.claude_engine import ClaudeEngine
from analysis.synthesiser import Synthesiser
from output.report_runner import build_report
from output.excel_exporter import export_to_excel


# ─── App State ───────────────────────────────────────────────────────────────
class AppState:
    """In-memory state object for the entire run."""

    def __init__(self):
        self.run_id = f"run_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.run_started_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
        self.specs_file = ""
        self.companies_file = ""
        self.output_file = ""
        self.project_profile = {}
        self.total_companies = 0
        self.processed = 0
        self.succeeded = 0
        self.partial = 0
        self.failed = 0
        self.companies = {}  # domain -> analysis result
        self.synthesis = {}
        self.errors = []
        self.decisions = []

    def to_cache_dict(self) -> dict:
        """Serialise state to cache-compatible dict."""
        return {
            "metadata": {
                "run_id": self.run_id,
                "created_at": self.run_started_at,
                "last_updated": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                "specs_file": self.specs_file,
                "companies_file": self.companies_file,
                "total_companies": self.total_companies,
                "runs": [],  # Will be populated on save
            },
            "project_profile": self.project_profile,
            "companies": self.companies,
            "synthesis": self.synthesis,
            "decisions_log": self.decisions,
        }


# ─── Cache Management ────────────────────────────────────────────────────────
def save_cache(state: AppState, cache_path: str, existing_runs: list | None = None):
    """Atomically save cache to disk."""
    cache = state.to_cache_dict()

    # Merge existing runs
    runs = existing_runs or []
    current_run = {
        "run_id": state.run_id,
        "started": state.run_started_at,
        "ended": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "completed": state.succeeded,
        "partial": state.partial,
        "failed": state.failed,
    }
    # Update or append current run
    found = False
    for i, r in enumerate(runs):
        if r.get("run_id") == state.run_id:
            runs[i] = current_run
            found = True
            break
    if not found:
        runs.append(current_run)

    cache["metadata"]["runs"] = runs

    # Atomic write
    tmp_path = cache_path + ".tmp"
    with open(tmp_path, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)
    os.replace(tmp_path, cache_path)


def load_cache(cache_path: str) -> dict | None:
    """Load existing cache file if present."""
    if not os.path.exists(cache_path):
        return None
    try:
        with open(cache_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError) as e:
        logger.warning(f"[WARN] Failed to load cache: {e}")
        return None


def save_checkpoint(state: AppState, checkpoint_path: str):
    """Save lightweight checkpoint file."""
    remaining = state.total_companies - state.processed
    elapsed = time.time() - _start_time if _start_time else 0
    eta_seconds = (elapsed / max(state.processed, 1)) * remaining if state.processed else 0
    eta_str = f"~{int(eta_seconds / 60)} minutes remaining" if eta_seconds > 0 else "calculating..."

    content = (
        f"CHECKPOINT: {datetime.datetime.now(datetime.timezone.utc).isoformat()}\n"
        f"Run ID    : {state.run_id}\n"
        f"Progress  : {state.processed} / {state.total_companies} companies complete\n"
        f"Succeeded : {state.succeeded}\n"
        f"Partial   : {state.partial}\n"
        f"Failed    : {state.failed}\n"
        f"Cache     : gap_analyzer_cache.json\n"
        f"ETA       : {eta_str}\n"
    )
    with open(checkpoint_path, "w", encoding="utf-8") as f:
        f.write(content)


_start_time = None


# ─── Auto-detection helpers ──────────────────────────────────────────────────
def auto_detect_file(extensions: list[str], label: str) -> str | None:
    """Auto-detect a file by extension in the current directory."""
    candidates = []
    for ext in extensions:
        candidates.extend(globmod.glob(f"*.{ext}"))
    if not candidates:
        return None
    if len(candidates) == 1:
        logger.log(DECISION, f"[PRE-FLIGHT] Auto-detected {label} file: {candidates[0]}")
        return candidates[0]
    # Multiple: use most recently modified
    candidates.sort(key=os.path.getmtime, reverse=True)
    logger.log(
        DECISION,
        f"[PRE-FLIGHT] Multiple {label} files found. Using most recent: {candidates[0]}",
    )
    return candidates[0]


# ─── Signal handling ─────────────────────────────────────────────────────────
_global_state = None
_global_cache_path = "gap_analyzer_cache.json"


def _handle_interrupt(signum, frame):
    """Graceful shutdown on Ctrl+C."""
    if _global_state:
        logger.info("\n[INFO] Interrupted. Saving progress...")
        save_cache(_global_state, _global_cache_path, _existing_runs)
        save_checkpoint(_global_state, "gap_analyzer_checkpoint.txt")
        print(
            f"\nInterrupted. Progress saved to {_global_cache_path}. Re-run to resume.\n"
            f"TO RESUME: python gap_analyzer.py "
            f"--specs {_global_state.specs_file} "
            f"--companies {_global_state.companies_file} "
            f"--output {_global_state.output_file}"
        )
    sys.exit(0)


signal.signal(signal.SIGINT, _handle_interrupt)
signal.signal(signal.SIGTERM, _handle_interrupt)

_existing_runs = []


# ─── Per-company processing ──────────────────────────────────────────────────
async def process_company(
    company: dict,
    project_profile: dict,
    firecrawl: FirecrawlScraper,
    playwright: PlaywrightScraper,
    claude: ClaudeEngine,
    index: int,
    total: int,
) -> dict:
    """Process a single company: scrape → analyse → return result."""
    name = company.get("company_name", "Unknown")
    url = company.get("url", "")
    category = company.get("category", "")
    domain = company.get("domain", "")

    print(f"\n[{index:>4}/{total}] \u2501\u2501 {name} ({category}) \u2501\u2501")

    scrape_result = {"content": {}, "pages_scraped": [], "pages_failed": [], "source": "none"}
    scraped_content = ""

    # Step 1: Scrape
    if url:
        try:
            print(f"    [1/3] Firecrawl  \u2192 ", end="", flush=True)
            scrape_result = await asyncio.wait_for(
                firecrawl.scrape_company(url), timeout=60
            )
            pages_ok = len(scrape_result.get("pages_scraped", []))
            pages_fail = len(scrape_result.get("pages_failed", []))
            print(f"{pages_ok} pages scraped" + (f" ({pages_fail} returned 404)" if pages_fail else ""))

            # Playwright fallback for empty pages
            empty_pages = scrape_result.get("pages_failed", [])
            if empty_pages and url:
                print(f"    [2/3] Playwright \u2192 ", end="", flush=True)
                pw_urls = [f"{url.rstrip('/')}/{p}" for p in empty_pages[:3]]
                try:
                    pw_results = await asyncio.wait_for(
                        playwright.scrape_pages(pw_urls), timeout=30
                    )
                    pw_count = len([v for v in pw_results.values() if v])
                    if pw_count:
                        for pw_url, pw_content in pw_results.items():
                            if pw_content:
                                page_name = pw_url.split("/")[-1] or "homepage"
                                scrape_result["content"][page_name] = pw_content
                                scrape_result["pages_scraped"].append(page_name)
                        scrape_result["source"] = "firecrawl+playwright"
                        print(f"Fallback recovered {pw_count} pages")
                        logger.log(
                            DECISION,
                            f"[{domain}] Playwright fallback used \u2014 recovered {pw_count} pages",
                        )
                    else:
                        print("No additional content recovered")
                except asyncio.TimeoutError:
                    print("Timed out")
                except Exception as e:
                    print(f"Failed: {e}")
            else:
                print(f"    [2/3] Playwright \u2192 Not needed")

        except asyncio.TimeoutError:
            print("Timed out (120s)")
            logger.warning(f"[WARN] [{domain}] Total scrape timeout exceeded")
        except Exception as e:
            print(f"Failed: {e}")
            logger.warning(f"[WARN] [{domain}] Scraping failed: {e}")
    else:
        print(f"    [SKIP] No valid URL \u2014 analysis from Excel only")
        logger.log(DECISION, f"[{name}] No valid URL \u2014 analysis from Excel data only")

    scraped_content = build_scraped_document(scrape_result)

    # Step 2: Claude analysis
    print(f"    [3/3] Claude     \u2192 ", end="", flush=True)

    analysis = await claude.analyse_company_async(
        company,
        project_profile,
        scraped_content,
    )

    # Determine status
    if analysis.get("claude_failed"):
        status = "failed"
        print("Analysis FAILED")
    elif analysis.get("parse_failed"):
        status = "partial"
        print("Analysis partial (parse issue)")
    elif not scraped_content:
        status = "partial"
        print("Analysis complete (Excel data only)")
    else:
        status = "success"
        opps = len(analysis.get("top_opportunities", []))
        ideas = len(analysis.get("value_add_ideas", []))
        print(f"Analysis complete")
        print(f"           \u2713 {opps} opportunities  \u00b7  {ideas} value-add ideas")

    # Build result
    source = "excel_only" if not scraped_content else scrape_result.get("source", "firecrawl")
    result = {
        "status": status,
        "run_id": _global_state.run_id if _global_state else "",
        "analysed_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "source": source + "+claude",
        "pages_scraped": scrape_result.get("pages_scraped", []),
        "pages_failed": scrape_result.get("pages_failed", []),
        "analysis": analysis,
    }

    return result


# ─── Main ────────────────────────────────────────────────────────────────────
async def async_main(args):
    """Main async entry point."""
    global _global_state, _global_cache_path, _existing_runs, _start_time

    state = AppState()
    _global_state = state
    _start_time = time.time()

    # ─── Resolve inputs ───
    specs_path = args.specs
    if not specs_path:
        specs_path = auto_detect_file(["docx", "pdf", "txt"], "specs")
        if not specs_path:
            print("[ERROR] No specs file found. Pass --specs <path>")
            sys.exit(1)

    companies_path = args.companies
    if not companies_path:
        companies_path = auto_detect_file(["xlsx"], "companies")
        if not companies_path:
            print("[ERROR] No companies file found. Pass --companies <path>")
            sys.exit(1)

    output_path = args.output or "competitive_report.docx"
    cache_path = args.resume or "gap_analyzer_cache.json"
    _global_cache_path = cache_path
    checkpoint_path = "gap_analyzer_checkpoint.txt"
    workers = args.workers or 20

    state.specs_file = os.path.abspath(specs_path)
    state.companies_file = os.path.abspath(companies_path)
    state.output_file = os.path.abspath(output_path)

    # ─── Check API keys ───
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        print("[ERROR] ANTHROPIC_API_KEY not set. Add to .env or environment.")
        sys.exit(1)

    firecrawl_key = os.getenv("FIRECRAWL_API_KEY", "")
    if not firecrawl_key:
        logger.warning("[WARN] FIRECRAWL_API_KEY not set. Will use requests fallback only.")

    # ─── Load cache ───
    existing_cache = None
    if not args.fresh and os.path.exists(cache_path):
        existing_cache = load_cache(cache_path)
        if existing_cache:
            cached_count = len(existing_cache.get("companies", {}))
            logger.log(
                DECISION,
                f"[PRE-FLIGHT] Cache found ({cached_count} companies). Resuming automatically. "
                "Pass --fresh to start over.",
            )
            state.companies = existing_cache.get("companies", {})
            _existing_runs = existing_cache.get("metadata", {}).get("runs", [])

    # ─── Read specs ───
    print("\n\u2550" * 50)
    print("  Gap Analysis Engine \u2014 Ecommerce Competitive Intel")
    print("\u2550" * 50)
    print(f"  Specs file    : {specs_path}")

    specs_text = read_specs_file(specs_path)
    specs_hash = hash_specs_file(specs_path)

    # Check if specs changed since last cache
    if existing_cache:
        old_hash = existing_cache.get("metadata", {}).get("specs_hash", "")
        if old_hash and old_hash != specs_hash:
            logger.log(DECISION, "[PRE-FLIGHT] Specs file changed \u2014 project profile re-extracted")

    # Extract project profile
    project_profile = extract_project_profile(specs_text, api_key)
    state.project_profile = project_profile

    # ─── Load companies ───
    companies_list, stats = load_companies(companies_path)
    companies_hash = hash_excel_file(companies_path)

    state.total_companies = stats["total"]

    print(f"  Companies     : {stats['total']} across {stats['categories_count']} categories")
    print(f"  Workers       : {workers}")
    print(f"  Output        : {output_path}")
    print("\u2500" * 50)
    print_project_summary(project_profile)
    print("\u2500" * 50)

    # Apply filters
    if args.category:
        companies_list = [c for c in companies_list if c["category"].lower() == args.category.lower()]
        print(f"  Filter        : category = '{args.category}' ({len(companies_list)} companies)")
        state.total_companies = len(companies_list)

    if args.limit:
        companies_list = companies_list[: args.limit]
        print(f"  Limit         : first {args.limit} companies")
        state.total_companies = len(companies_list)

    # Handle --refresh flag
    refresh_domains = set()
    if args.refresh:
        for d in args.refresh.split(","):
            refresh_domains.add(d.strip().lower())
        logger.info(f"[INFO] Refreshing specific domains: {refresh_domains}")

    # Determine which companies to process
    to_process = []
    for company in companies_list:
        domain = company.get("domain", "")
        if not domain:
            to_process.append(company)
            continue

        if domain in refresh_domains:
            to_process.append(company)
            continue

        cached = state.companies.get(domain)
        if cached:
            status = cached.get("status", "")
            if status in ("success", "partial", "failed") and domain not in refresh_domains:
                continue  # Skip — already processed (use --refresh to retry specific domains)
            to_process.append(company)
        else:
            to_process.append(company)

    cached_count = state.total_companies - len(to_process)
    if cached_count > 0:
        print(f"  Cached        : {cached_count} companies loaded from cache")

    print(f"  To analyse    : {len(to_process)} companies")
    print(f"\n  Starting analysis...")
    print(f"  Results cached to: {cache_path}")
    print("\u2550" * 50)

    # ─── Process companies ───
    firecrawl = FirecrawlScraper(firecrawl_key)
    playwright = PlaywrightScraper()
    claude = ClaudeEngine(api_key)

    semaphore = asyncio.Semaphore(workers)
    heartbeat_interval = 300  # 5 minutes
    last_heartbeat = time.time()
    total_to_process = len(to_process)
    _cache_lock = asyncio.Lock()

    async def process_with_semaphore(company, idx, domain):
        async with semaphore:
            try:
                result = await process_company(
                    company, project_profile, firecrawl, playwright, claude,
                    idx, state.total_companies,
                )

                async with _cache_lock:
                    state.companies[domain] = result
                    state.processed += 1

                    status = result.get("status", "unknown")
                    if status == "success":
                        state.succeeded += 1
                    elif status == "partial":
                        state.partial += 1
                    else:
                        state.failed += 1

                    save_cache(state, cache_path, _existing_runs)

                    if state.processed % 10 == 0:
                        save_checkpoint(state, checkpoint_path)

            except Exception as e:
                logger.error(f"[ERROR] [{domain}] Unhandled error: {e}")
                async with _cache_lock:
                    state.errors.append({"domain": domain, "error": str(e)})
                    state.companies[domain] = {
                        "status": "failed",
                        "run_id": state.run_id,
                        "error": str(e),
                        "analysis": {
                            "company_name": company.get("company_name", domain),
                            "url": company.get("url", ""),
                            "category": company.get("category", ""),
                            "niche": company.get("niche", ""),
                            "top_opportunities": [],
                            "value_add_ideas": [],
                            "watch_out_for": [],
                            "one_line_verdict": f"Processing failed: {e}",
                        },
                    }
                    state.failed += 1
                    state.processed += 1
                    save_cache(state, cache_path, _existing_runs)

    # Launch all companies concurrently (semaphore limits parallelism)
    tasks = []
    for i, company in enumerate(to_process, 1):
        domain = company.get("domain", "") or f"no_domain_{i}"
        tasks.append(process_with_semaphore(company, cached_count + i, domain))

    await asyncio.gather(*tasks)

    # Close Playwright
    await playwright.close()

    # ─── End-of-run summary ───
    total_succeeded = sum(
        1 for d in state.companies.values() if d.get("status") == "success"
    )
    total_partial = sum(
        1 for d in state.companies.values() if d.get("status") == "partial"
    )
    total_failed = sum(
        1 for d in state.companies.values() if d.get("status") == "failed"
    )
    total_opps = sum(
        len(d.get("analysis", {}).get("top_opportunities", []))
        for d in state.companies.values()
    )
    total_ideas = sum(
        len(d.get("analysis", {}).get("value_add_ideas", []))
        for d in state.companies.values()
    )
    total_watch = sum(
        len(d.get("analysis", {}).get("watch_out_for", []))
        for d in state.companies.values()
    )

    print("\n" + "\u2550" * 50)
    print(f"  \u2705  Completed   : {total_succeeded} / {len(state.companies)}")
    print(f"  \u26a0\ufe0f  Partial     : {total_partial}")
    print(f"  \u2717   Failed      : {total_failed}")
    print("\u2500" * 50)
    print(f"  Total opportunities identified : {total_opps:,}")
    print(f"  Total value-add ideas          : {total_ideas:,}")
    print(f"  Total watch-out flags          : {total_watch:,}")
    print("\u2500" * 50)

    # ─── Synthesis (only if explicitly requested) ───
    if args.synthesis and len(state.companies) > 0:
        print("  Running cross-company synthesis...")
        synthesiser = Synthesiser(api_key)
        state.synthesis = synthesiser.synthesise(state.companies, project_profile)
        claude_api_calls = claude.total_api_calls + synthesiser.total_api_calls + 1
        save_cache(state, cache_path, _existing_runs)
        print("  \u2713 Synthesis complete")
    else:
        claude_api_calls = claude.total_api_calls + 1

    # ─── Build cache data ───
    cache_data = state.to_cache_dict()
    cache_data["metadata"]["runs"] = _existing_runs
    cache_data["metadata"]["specs_hash"] = specs_hash
    cache_data["metadata"]["companies_hash"] = companies_hash

    # ─── Excel output (default) ───
    excel_path = os.path.splitext(output_path)[0] + ".xlsx"
    print(f"  Building Excel report...")
    excel_ok = export_to_excel(cache_data, excel_path)
    if excel_ok:
        print(f"  \u2705  Excel saved \u2192 {excel_path}")
    else:
        print(f"  \u26a0\ufe0f  Excel export failed. Check logs.")

    # ─── Word document (only if --report or --synthesis) ───
    if args.report or args.synthesis:
        print("  Building Word document...")
        cache_data.setdefault("reports_generated", []).append({
            "run_id": state.run_id,
            "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "output_file": output_path,
            "companies_in_report": len(state.companies),
            "synthesis_included": args.synthesis,
        })

        out_dir = os.path.dirname(os.path.abspath(output_path))
        if out_dir:
            os.makedirs(out_dir, exist_ok=True)

        success = build_report(cache_data, output_path)

        if success:
            print(f"  \u2705  Report saved \u2192 {output_path}")
        else:
            print(f"  \u26a0\ufe0f  Report generation had issues. Check logs.")

    # Write errors log
    if state.errors:
        with open("gap_analyzer_errors.log", "w", encoding="utf-8") as f:
            for err in state.errors:
                f.write(f"{err.get('domain', 'unknown')}: {err.get('error', '')}\n")

    elapsed = time.time() - _start_time
    print(f"  Total time    : {int(elapsed // 60)}m {int(elapsed % 60)}s")
    print(f"  API calls     : {claude_api_calls}")
    print("\u2550" * 50)

    # Final cache save
    save_cache(state, cache_path, _existing_runs)
    save_checkpoint(state, checkpoint_path)


def main():
    """CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Ecommerce Competitive Gap Analysis Engine"
    )
    parser.add_argument("--specs", type=str, default=None, help="Path to project specs (.docx/.pdf/.txt)")
    parser.add_argument("--companies", type=str, default=None, help="Path to companies Excel (.xlsx)")
    parser.add_argument("--output", type=str, default="competitive_report.docx", help="Output .docx path")
    parser.add_argument("--workers", type=int, default=20, help="Parallel workers (default 20)")
    parser.add_argument("--limit", type=int, default=None, help="Process only first N companies")
    parser.add_argument("--category", type=str, default=None, help="Process only this category")
    parser.add_argument("--resume", type=str, default="gap_analyzer_cache.json", help="Cache file path")
    parser.add_argument("--synthesis", action="store_true", help="Run cross-company synthesis (off by default)")
    parser.add_argument("--report", action="store_true", help="Also generate Word document report")
    parser.add_argument("--fresh", action="store_true", help="Discard cache and start fresh")
    parser.add_argument("--refresh", type=str, default=None, help="Re-analyse specific domains (comma-separated)")
    parser.add_argument("--no-overwrite", action="store_true", help="Don't overwrite existing output")

    args = parser.parse_args()

    # Handle --no-overwrite
    if args.no_overwrite and os.path.exists(args.output):
        ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        base, ext = os.path.splitext(args.output)
        args.output = f"{base}_{ts}{ext}"
        logger.log(DECISION, f"[PRE-FLIGHT] --no-overwrite set. Output: {args.output}")
    elif os.path.exists(args.output):
        logger.log(DECISION, f"[PRE-FLIGHT] Overwriting existing output: {args.output}")

    try:
        asyncio.run(async_main(args))
    except KeyboardInterrupt:
        pass  # Handled by signal handler
    except Exception as e:
        # Top-level crash handler
        logger.error(f"[FATAL] Unhandled exception: {e}")
        with open("gap_analyzer_crash.log", "w", encoding="utf-8") as f:
            f.write(f"CRASH at {datetime.datetime.now().isoformat()}\n")
            f.write(traceback.format_exc())
        if _global_state:
            try:
                save_cache(_global_state, _global_cache_path, _existing_runs)
            except Exception:
                pass
        print(
            f"\n[FATAL] Crash detected. Progress saved. See gap_analyzer_crash.log.\n"
            f"TO RESUME: python gap_analyzer.py "
            f"--specs {_global_state.specs_file if _global_state else 'specs'} "
            f"--companies {_global_state.companies_file if _global_state else 'companies'} "
            f"--output {_global_state.output_file if _global_state else 'report.docx'}"
        )
        sys.exit(1)


if __name__ == "__main__":
    main()
