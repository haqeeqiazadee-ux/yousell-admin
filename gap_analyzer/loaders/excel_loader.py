"""Reads company data from Excel files with flexible column matching."""

import hashlib
import logging
import os
import re

import pandas as pd

from utils.domain import extract_domain, is_valid_url, normalise_url

logger = logging.getLogger("gap_analyzer")

# Required columns and their fuzzy match patterns
COLUMN_PATTERNS = {
    "company_name": ["company", "name", "business", "brand"],
    "url": ["url", "website", "web", "domain", "link", "site"],
    "category": ["category", "sector", "industry", "type", "segment"],
    "niche": ["niche", "sub-category", "subcategory", "sub category", "speciality", "specialty"],
    "description": ["description", "desc", "about", "summary", "overview", "notes"],
}


def _fuzzy_match_columns(df_columns: list[str]) -> dict[str, str]:
    """Map required fields to actual column names using fuzzy matching."""
    mapping = {}
    lower_cols = {c.lower().strip(): c for c in df_columns}

    for field, patterns in COLUMN_PATTERNS.items():
        matched = False
        # Exact match first
        for pattern in patterns:
            for lower_name, original in lower_cols.items():
                if pattern == lower_name:
                    mapping[field] = original
                    matched = True
                    break
            if matched:
                break

        # Substring match
        if not matched:
            for pattern in patterns:
                for lower_name, original in lower_cols.items():
                    if pattern in lower_name or lower_name in pattern:
                        mapping[field] = original
                        matched = True
                        break
                if matched:
                    break

    return mapping


def _identify_seo_columns(df_columns: list[str], mapped_columns: set[str]) -> list[str]:
    """Identify SEO/traffic columns — any numeric columns not already mapped."""
    seo_keywords = [
        "traffic", "keyword", "dr", "authority", "da", "rank", "seo",
        "backlink", "visitor", "organic", "domain rating", "page authority",
        "referring", "ahrefs", "semrush", "moz",
    ]
    seo_cols = []
    for col in df_columns:
        if col in mapped_columns:
            continue
        lower = col.lower().strip()
        for kw in seo_keywords:
            if kw in lower:
                seo_cols.append(col)
                break
    return seo_cols


def load_companies(path: str) -> tuple[list[dict], dict]:
    """Load companies from Excel. Returns (companies_list, stats_dict)."""
    logger.info(f"[INFO] Loading companies from: {path}")
    df = pd.read_excel(path, engine="openpyxl")

    # Fuzzy match columns
    col_mapping = _fuzzy_match_columns(list(df.columns))

    for field, actual_col in col_mapping.items():
        logger.info(f"[DECISION] [PRE-FLIGHT] Mapped '{actual_col}' → {field}")

    if "url" not in col_mapping:
        logger.warning("[WARN] No URL column found — all companies will be Excel-only analysis")

    mapped_set = set(col_mapping.values())
    seo_cols = _identify_seo_columns(list(df.columns), mapped_set)
    if seo_cols:
        logger.info(f"[INFO] SEO columns detected: {seo_cols}")

    companies = []
    seen_domains = set()
    skipped_no_url = 0
    skipped_duplicate = 0

    for idx, row in df.iterrows():
        # Extract mapped fields
        company_name = str(row.get(col_mapping.get("company_name", ""), "")).strip()
        url_raw = str(row.get(col_mapping.get("url", ""), "")).strip()
        category = str(row.get(col_mapping.get("category", ""), "")).strip()
        niche = str(row.get(col_mapping.get("niche", ""), "")).strip()
        description = str(row.get(col_mapping.get("description", ""), "")).strip()

        # Clean NaN values
        for field_name in ["company_name", "category", "niche", "description"]:
            val = locals()[field_name]
            if val.lower() == "nan" or val == "":
                locals()[field_name]  # already handled below

        if company_name.lower() == "nan":
            company_name = ""
        if category.lower() == "nan":
            category = ""
        if niche.lower() == "nan":
            niche = ""
        if description.lower() == "nan":
            description = ""

        # URL handling
        url = ""
        domain = ""
        if url_raw and url_raw.lower() != "nan" and is_valid_url(url_raw):
            url = normalise_url(url_raw)
            domain = extract_domain(url)
        else:
            skipped_no_url += 1

        # Duplicate detection
        if domain and domain in seen_domains:
            logger.info(f"[DECISION] Duplicate domain skipped: {domain} (row {idx + 2})")
            skipped_duplicate += 1
            continue

        if domain:
            seen_domains.add(domain)

        # Build SEO data dict
        seo_data = {}
        for sc in seo_cols:
            val = row.get(sc, "")
            if pd.notna(val):
                seo_data[sc] = val

        company = {
            "company_name": company_name or domain or f"Company_{idx}",
            "url": url,
            "domain": domain,
            "category": category,
            "niche": niche,
            "description": description,
            "seo_data": seo_data,
            "row_index": idx + 2,  # 1-indexed + header row
        }
        companies.append(company)

    # Group by category for stats
    categories = {}
    for c in companies:
        cat = c["category"] or "Uncategorised"
        categories[cat] = categories.get(cat, 0) + 1

    stats = {
        "total": len(companies),
        "categories_count": len(categories),
        "categories": categories,
        "skipped_no_url": skipped_no_url,
        "skipped_duplicate": skipped_duplicate,
    }

    logger.info(
        f"[INFO] Loaded {stats['total']} companies across "
        f"{stats['categories_count']} categories "
        f"(skipped {skipped_no_url} no-URL, {skipped_duplicate} duplicates)"
    )

    return companies, stats


def hash_file(path: str) -> str:
    """Return MD5 hash of file contents."""
    hasher = hashlib.md5()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            hasher.update(chunk)
    return hasher.hexdigest()
