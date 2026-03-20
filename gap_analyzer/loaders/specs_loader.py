"""Reads project specification documents (.docx, .pdf, .txt)."""

import hashlib
import json
import logging
import os
import re

import anthropic

logger = logging.getLogger("gap_analyzer")

MODEL = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-20250514")

SPECS_EXTRACTION_PROMPT = """Read this project specification document line by line.
Extract and summarise:
(a) Every service, feature, and product the project plans to offer
(b) The stated target audience and customer segments
(c) The stated business model and revenue model
(d) The technology stack or platform type described
(e) Any stated differentiators or unique value propositions
(f) Any explicitly listed competitors or reference companies

Output this as a structured JSON object — the PROJECT PROFILE.
Return ONLY valid JSON with these keys:
{
  "services_and_features": [list of strings],
  "target_audience": [list of strings],
  "business_model": string,
  "revenue_model": string,
  "technology_stack": string,
  "differentiators": [list of strings],
  "competitors_referenced": [list of strings],
  "summary": string
}"""


def _read_docx(path: str) -> str:
    """Read .docx file and return full text."""
    from docx import Document
    doc = Document(path)
    return "\n".join(p.text for p in doc.paragraphs if p.text.strip())


def _read_pdf(path: str) -> str:
    """Read .pdf file and return full text."""
    from pdfminer.high_level import extract_text
    return extract_text(path)


def _read_txt(path: str) -> str:
    """Read plain text file."""
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        return f.read()


def read_specs_file(path: str) -> str:
    """Read specs file, trying all readers in order."""
    ext = os.path.splitext(path)[1].lower()

    readers = []
    if ext == ".docx":
        readers = [_read_docx, _read_pdf, _read_txt]
    elif ext == ".pdf":
        readers = [_read_pdf, _read_docx, _read_txt]
    else:
        readers = [_read_txt, _read_docx, _read_pdf]

    for reader in readers:
        try:
            text = reader(path)
            if text and text.strip():
                reader_name = reader.__name__.replace("_read_", "")
                logger.info(f"[DECISION] [PRE-FLIGHT] Specs read using {reader_name} reader")
                return text
        except Exception as e:
            logger.debug(f"Reader {reader.__name__} failed for {path}: {e}")
            continue

    raise RuntimeError(f"Could not read specs file: {path} — all readers failed")


def hash_file(path: str) -> str:
    """Return MD5 hash of file contents."""
    hasher = hashlib.md5()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            hasher.update(chunk)
    return hasher.hexdigest()


def extract_project_profile(specs_text: str, api_key: str | None = None) -> dict:
    """Use Claude to extract a structured project profile from specs text."""
    client = anthropic.Anthropic(api_key=api_key or os.getenv("ANTHROPIC_API_KEY"))

    # Truncate if extremely long to stay within limits
    if len(specs_text) > 100000:
        specs_text = specs_text[:100000]
        logger.info("[DECISION] [PRE-FLIGHT] Specs text truncated to 100K chars for Claude processing")

    try:
        response = client.messages.create(
            model=MODEL,
            max_tokens=2000,
            messages=[
                {
                    "role": "user",
                    "content": f"{SPECS_EXTRACTION_PROMPT}\n\n---\n\nDOCUMENT CONTENT:\n{specs_text}",
                }
            ],
        )
    except Exception as e:
        logger.error(f"[ERROR] Claude API call failed for specs extraction: {e}")
        return _empty_profile(f"API call failed: {e}")

    if not response.content:
        logger.error("[ERROR] Claude returned empty response for specs extraction")
        return _empty_profile("Empty response")

    raw = response.content[0].text.strip()
    raw = _strip_json_fences(raw)

    try:
        profile = json.loads(raw)
    except json.JSONDecodeError:
        import ast
        try:
            profile = ast.literal_eval(raw)
        except Exception:
            # Try to find JSON object anywhere in the response
            json_match = re.search(r'\{[\s\S]*\}', raw)
            if json_match:
                try:
                    profile = json.loads(json_match.group())
                except json.JSONDecodeError:
                    logger.error("[ERROR] Failed to parse project profile JSON from Claude")
                    profile = _empty_profile(raw[:500])
            else:
                logger.error("[ERROR] Failed to parse project profile JSON from Claude")
                profile = _empty_profile(raw[:500])

    return profile


def _strip_json_fences(raw: str) -> str:
    """Strip markdown code fences and leading 'json' tag from a response."""
    raw = raw.strip()
    # Handle ```json ... ``` or ``` ... ```
    fence_match = re.match(r'^```(?:json)?\s*\n?(.*?)```\s*$', raw, re.DOTALL)
    if fence_match:
        return fence_match.group(1).strip()
    # Handle leading ``` without trailing
    if raw.startswith("```"):
        lines = raw.split("\n", 1)
        raw = lines[1] if len(lines) > 1 else raw[3:]
        if raw.endswith("```"):
            raw = raw[:-3]
        return raw.strip()
    if raw.startswith("json"):
        raw = raw[4:].strip()
    return raw


def _empty_profile(summary: str = "") -> dict:
    """Return a fallback empty project profile."""
    return {
        "services_and_features": [],
        "target_audience": [],
        "business_model": "Could not parse",
        "revenue_model": "Could not parse",
        "technology_stack": "Could not parse",
        "differentiators": [],
        "competitors_referenced": [],
        "summary": summary,
    }


def print_project_summary(profile: dict):
    """Print human-readable project profile summary."""
    print("  PROJECT PROFILE SUMMARY:")
    services = profile.get("services_and_features", [])
    if services:
        print(f"  Services      : {', '.join(services[:8])}")
        if len(services) > 8:
            print(f"                  ... and {len(services) - 8} more")
    audience = profile.get("target_audience", [])
    if audience:
        print(f"  Target audience: {', '.join(audience[:5])}")
    bm = profile.get("business_model", "N/A")
    print(f"  Business model : {bm}")
    rm = profile.get("revenue_model", "N/A")
    print(f"  Revenue model  : {rm}")
    diff = profile.get("differentiators", [])
    if diff:
        print(f"  Differentiators: {', '.join(diff[:5])}")
