"""Per-company Claude analysis engine."""

import ast
import json
import logging
import os

import anthropic

from utils.retry import retry_sync

logger = logging.getLogger("gap_analyzer")

MODEL = os.getenv("CLAUDE_MODEL", "claude-opus-4-6")
MAX_TOKENS = 2000

COMPANY_ANALYSIS_PROMPT = """You are a senior product strategist and competitive intelligence analyst
preparing a board-level briefing for an ecommerce platform startup.

YOUR PROJECT (the startup you are advising):
{project_profile_json}

THE COMPANY YOU ARE ANALYSING:
Name        : {company_name}
URL         : {company_url}
Category    : {category}
Niche       : {niche}
Description : {description}
SEO Data    : {seo_data}

LIVE SCRAPED CONTENT:
{scraped_content}

══════════════════════════════════════════════════════════
YOUR TASK: Analyse this company across all five dimensions
below, then identify specific gaps, opportunities, and
recommendations for YOUR PROJECT based on what you find.

Do not invent data. If you cannot determine something from
the scraped content or Excel data, say 'Not determinable'
rather than guessing.

Every gap_for_your_project field must be specific and
actionable — not generic. Reference actual features or
patterns you saw.
══════════════════════════════════════════════════════════

Return ONLY a JSON object with these exact keys.
No markdown. No preamble. No explanation outside the JSON.

{{
  "company_name": string,
  "url": string,
  "category": string,
  "niche": string,

  "dim1_design_ux": {{
    "design_language": string,
    "ux_quality": string,
    "trust_signals": string,
    "mobile_posture": string,
    "design_maturity": string,
    "gap_for_your_project": string
  }},

  "dim2_functionality_tech": {{
    "core_product": string,
    "key_features": [string],
    "tech_signals": string,
    "integrations": string,
    "product_maturity": string,
    "gap_for_your_project": string
  }},

  "dim3_content_messaging": {{
    "primary_message": string,
    "messaging_clarity": string,
    "content_tone": string,
    "seo_depth": string,
    "social_proof": string,
    "primary_cta": string,
    "gap_for_your_project": string
  }},

  "dim4_services_products": {{
    "product_catalogue": string,
    "pricing_model": string,
    "pricing_visibility": string,
    "packaging": string,
    "upsell_mechanics": string,
    "gap_for_your_project": string
  }},

  "dim5_business_model": {{
    "business_model": string,
    "revenue_model": string,
    "icp": string,
    "gtm_motion": string,
    "competitive_position": string,
    "growth_stage": string,
    "gap_for_your_project": string
  }},

  "top_opportunities": [string],
  "value_add_ideas": [string],
  "watch_out_for": [string],
  "one_line_verdict": string
}}"""

SIMPLIFIED_PROMPT = """Analyse this company for competitive intelligence. Return JSON only.

PROJECT: {project_profile_json}
COMPANY: {company_name} ({company_url}) — {category}/{niche}
CONTENT: {scraped_content}

Return JSON with: company_name, url, category, niche, core_product, key_features (list),
pricing_model, business_model, top_opportunities (list), value_add_ideas (list),
watch_out_for (list), one_line_verdict"""


class ClaudeEngine:
    """Handles per-company analysis via Claude API."""

    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        self.client = anthropic.Anthropic(api_key=self.api_key)
        self.total_api_calls = 0

    def _parse_json_response(self, raw: str) -> dict | None:
        """Parse Claude JSON response, stripping fences."""
        raw = raw.strip()
        if raw.startswith("```"):
            lines = raw.split("\n")
            raw = "\n".join(lines[1:])
        if raw.endswith("```"):
            raw = raw[:-3]
        raw = raw.strip()
        if raw.startswith("json"):
            raw = raw[4:].strip()

        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            try:
                return ast.literal_eval(raw)
            except Exception:
                return None

    @retry_sync(max_retries=3, base_delay=10.0)
    def _call_claude(self, prompt: str, max_tokens: int = MAX_TOKENS) -> str:
        """Make a Claude API call with retry."""
        response = self.client.messages.create(
            model=MODEL,
            max_tokens=max_tokens,
            messages=[{"role": "user", "content": prompt}],
        )
        self.total_api_calls += 1
        return response.content[0].text

    def analyse_company(
        self,
        company: dict,
        project_profile: dict,
        scraped_content: str,
    ) -> dict:
        """Run full analysis for a single company. Returns analysis dict or error dict."""
        company_name = company.get("company_name", "Unknown")
        company_url = company.get("url", "")

        prompt = COMPANY_ANALYSIS_PROMPT.format(
            project_profile_json=json.dumps(project_profile, indent=2),
            company_name=company_name,
            company_url=company_url,
            category=company.get("category", "N/A"),
            niche=company.get("niche", "N/A"),
            description=company.get("description", "N/A"),
            seo_data=json.dumps(company.get("seo_data", {})),
            scraped_content=scraped_content or "No scraped content available — analyse from Excel data only.",
        )

        try:
            raw = self._call_claude(prompt)
            result = self._parse_json_response(raw)

            if result:
                return result

            # Retry with simplified prompt
            logger.warning(f"[WARN] [{company_name}] JSON parse failed, retrying with simplified prompt")
            simplified = SIMPLIFIED_PROMPT.format(
                project_profile_json=json.dumps(project_profile, indent=2),
                company_name=company_name,
                company_url=company_url,
                category=company.get("category", "N/A"),
                niche=company.get("niche", "N/A"),
                scraped_content=(scraped_content or "No content")[:2000],
            )

            raw2 = self._call_claude(simplified, max_tokens=1500)
            result2 = self._parse_json_response(raw2)

            if result2:
                return result2

            # Store raw text as last resort
            logger.error(f"[ERROR] [{company_name}] Claude JSON parse failed after retry")
            return {
                "company_name": company_name,
                "url": company_url,
                "category": company.get("category", ""),
                "niche": company.get("niche", ""),
                "parse_failed": True,
                "raw_claude_response": raw[:2000],
                "top_opportunities": [],
                "value_add_ideas": [],
                "watch_out_for": [],
                "one_line_verdict": "Analysis parse failed — raw response stored",
            }

        except Exception as e:
            logger.error(f"[ERROR] [{company_name}] Claude analysis failed: {e}")
            return {
                "company_name": company_name,
                "url": company_url,
                "category": company.get("category", ""),
                "niche": company.get("niche", ""),
                "claude_failed": True,
                "error": str(e),
                "top_opportunities": [],
                "value_add_ideas": [],
                "watch_out_for": [],
                "one_line_verdict": f"Analysis failed: {e}",
            }
