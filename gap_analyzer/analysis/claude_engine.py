"""Per-company Claude analysis engine."""

import ast
import json
import logging
import os

import anthropic

from utils.retry import retry_async, retry_sync

logger = logging.getLogger("gap_analyzer")

MODEL = os.getenv("CLAUDE_MODEL", "claude-haiku-4-5-20251001")
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
YOUR TASK: Analyse this company and identify gaps and
opportunities for YOUR PROJECT.

RULES:
- Be PRECISE but BRIEF. Each string value: 1-2 sentences max.
- Each list item: under 20 words. But include ALL relevant items you find — no artificial caps.
- gap_for_your_project: one specific, actionable sentence referencing what you saw.
- Focus on functionality, content, services, business model — NOT visual design or UX.
- Do not invent data. Say 'Not determinable' if unknown.
- No markdown. No preamble. Return ONLY the JSON object.
══════════════════════════════════════════════════════════

{{
  "company_name": string,
  "url": string,
  "category": string,
  "niche": string,

  "dim2_functionality_tech": {{
    "core_product": string (1 sentence),
    "key_features": [string] (all notable features, each under 10 words),
    "tech_signals": string (1 sentence),
    "integrations": string (1 sentence),
    "product_maturity": string (Early/Growth/Mature/Enterprise),
    "gap_for_your_project": string (1 actionable sentence)
  }},

  "dim3_content_messaging": {{
    "primary_message": string (1 sentence),
    "messaging_clarity": string (Clear/Moderate/Weak),
    "content_tone": string (2-3 words),
    "seo_depth": string (1 sentence),
    "social_proof": string (1 sentence),
    "primary_cta": string (quote the CTA),
    "gap_for_your_project": string (1 actionable sentence)
  }},

  "dim4_services_products": {{
    "product_catalogue": string (1 sentence),
    "pricing_model": string (1 sentence),
    "pricing_visibility": string (Public/Hidden/Partial),
    "packaging": string (1 sentence),
    "upsell_mechanics": string (1 sentence),
    "gap_for_your_project": string (1 actionable sentence)
  }},

  "dim5_business_model": {{
    "business_model": string (1 sentence),
    "revenue_model": string (SaaS/Marketplace/Commission/etc),
    "icp": string (1 sentence),
    "gtm_motion": string (1 sentence),
    "competitive_position": string (Leader/Challenger/Niche/Emerging),
    "growth_stage": string (Startup/Growth/Mature/Enterprise),
    "gap_for_your_project": string (1 actionable sentence)
  }},

  "top_opportunities": [string] (all you find, each under 20 words),
  "value_add_ideas": [string] (all you find, each under 20 words),
  "watch_out_for": [string] (all you find, each under 20 words),
  "one_line_verdict": string (1 sentence)
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
        self.async_client = anthropic.AsyncAnthropic(api_key=self.api_key)
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
            pass
        try:
            return ast.literal_eval(raw)
        except Exception:
            pass
        # Fallback: find outermost JSON object via bracket matching
        start = raw.find("{")
        if start != -1:
            depth = 0
            for i in range(start, len(raw)):
                if raw[i] == "{":
                    depth += 1
                elif raw[i] == "}":
                    depth -= 1
                    if depth == 0:
                        try:
                            return json.loads(raw[start : i + 1])
                        except json.JSONDecodeError:
                            break
        return None

    @retry_sync(max_retries=3, base_delay=10.0)
    def _call_claude(self, prompt: str, max_tokens: int = MAX_TOKENS) -> str:
        """Make a Claude API call with retry (sync)."""
        response = self.client.messages.create(
            model=MODEL,
            max_tokens=max_tokens,
            messages=[{"role": "user", "content": prompt}],
        )
        self.total_api_calls += 1
        if not response.content:
            raise RuntimeError("Claude returned empty response content")
        return response.content[0].text

    @retry_async(max_retries=3, base_delay=5.0)
    async def _call_claude_async(self, prompt: str, max_tokens: int = MAX_TOKENS) -> str:
        """Make a Claude API call with retry (async — non-blocking)."""
        response = await self.async_client.messages.create(
            model=MODEL,
            max_tokens=max_tokens,
            messages=[{"role": "user", "content": prompt}],
        )
        self.total_api_calls += 1
        if not response.content:
            raise RuntimeError("Claude returned empty response content")
        return response.content[0].text

    async def analyse_company_async(
        self,
        company: dict,
        project_profile: dict,
        scraped_content: str,
    ) -> dict:
        """Run full analysis for a single company (async). Returns analysis dict or error dict."""
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
            raw = await self._call_claude_async(prompt)
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

            raw2 = await self._call_claude_async(simplified, max_tokens=1500)
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

    def analyse_company(
        self,
        company: dict,
        project_profile: dict,
        scraped_content: str,
    ) -> dict:
        """Run full analysis for a single company (sync). Returns analysis dict or error dict."""
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
