"""Cross-company synthesis engine — aggregates all findings into strategic report."""

import ast
import json
import logging
import os

import anthropic

logger = logging.getLogger("gap_analyzer")

MODEL = os.getenv("CLAUDE_MODEL", "claude-opus-4-6")
MAX_SYNTHESIS_TOKENS = 8000

SYNTHESIS_PROMPT = """You are the lead strategist preparing the final competitive intelligence
briefing for the board.

YOUR PROJECT:
{project_profile_json}

You have just completed analysis of {total_companies} companies across
{total_categories} categories in the ecommerce ecosystem.

Here is a structured summary of all findings:
{aggregated_findings_summary}

Produce a MASTER STRATEGIC REPORT as a JSON object with:

{{
  "executive_summary": string,

  "top_missing_features": [
    {{"feature": string,
     "seen_at": [string],
     "priority": "High/Medium/Low",
     "recommendation": string}}
  ],

  "content_strategy_gaps": [string],

  "underserved_niches": [string],

  "business_model_enhancements": [string],

  "category_by_category_insights": [
    {{"category": string,
     "key_players": [string],
     "dominant_patterns": string,
     "project_gaps": string,
     "recommendations": [string]}}
  ],

  "quick_wins": [string],

  "strategic_priorities": [string],

  "risks_if_not_addressed": [string]
}}

Return ONLY the JSON. No markdown fences. No preamble."""


class Synthesiser:
    """Aggregates per-company analyses into a master strategic report."""

    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        self.client = anthropic.Anthropic(api_key=self.api_key)
        self.total_api_calls = 0

    def _build_aggregated_summary(self, companies: dict, max_chars: int = 80000) -> str:
        """Build a condensed summary of all company findings grouped by category."""
        by_category = {}
        for domain, data in companies.items():
            analysis = data.get("analysis", data)
            cat = analysis.get("category", "Uncategorised") or "Uncategorised"
            if cat not in by_category:
                by_category[cat] = []
            by_category[cat].append({
                "name": analysis.get("company_name", domain),
                "url": analysis.get("url", ""),
                "niche": analysis.get("niche", ""),
                "opportunities": analysis.get("top_opportunities", []),
                "value_ideas": analysis.get("value_add_ideas", []),
                "watch_out": analysis.get("watch_out_for", []),
                "verdict": analysis.get("one_line_verdict", ""),
            })

        lines = []
        for category, entries in sorted(by_category.items()):
            lines.append(f"\n═══ CATEGORY: {category} ({len(entries)} companies) ═══")
            for e in entries:
                lines.append(f"\n  {e['name']} ({e['url']})")
                if e.get("niche"):
                    lines.append(f"    Niche: {e['niche']}")
                if e.get("verdict"):
                    lines.append(f"    Verdict: {e['verdict']}")
                if e.get("opportunities"):
                    for opp in e["opportunities"][:3]:
                        lines.append(f"    ★ Opportunity: {opp}")
                if e.get("value_ideas"):
                    for vi in e["value_ideas"][:2]:
                        lines.append(f"    💡 Idea: {vi}")
                if e.get("watch_out"):
                    for wo in e["watch_out"][:2]:
                        lines.append(f"    ⚠ Watch: {wo}")

        summary = "\n".join(lines)
        if len(summary) > max_chars:
            summary = summary[:max_chars] + "\n... [truncated for context limits]"
        return summary

    def _parse_json(self, raw: str) -> dict | None:
        """Parse JSON from Claude response with multiple fallbacks."""
        raw = raw.strip()
        if raw.startswith("```"):
            raw = "\n".join(raw.split("\n")[1:])
        if raw.endswith("```"):
            raw = raw[:-3]
        raw = raw.strip()
        if raw.startswith("json"):
            raw = raw[4:].strip()
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            pass
        # Fallback: ast.literal_eval
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

    def synthesise(self, companies: dict, project_profile: dict) -> dict:
        """Run synthesis across all company analyses."""
        total = len(companies)
        categories = set()
        for data in companies.values():
            analysis = data.get("analysis", data)
            cat = analysis.get("category", "")
            if cat:
                categories.add(cat)

        # Check if we need to batch
        summary = self._build_aggregated_summary(companies)

        # If summary is manageable, do single synthesis
        if len(summary) < 80000:
            return self._run_single_synthesis(
                summary, project_profile, total, len(categories)
            )
        else:
            return self._run_batched_synthesis(
                companies, project_profile, total, len(categories)
            )

    def _run_single_synthesis(
        self,
        summary: str,
        project_profile: dict,
        total_companies: int,
        total_categories: int,
    ) -> dict:
        """Run a single synthesis call."""
        prompt = SYNTHESIS_PROMPT.format(
            project_profile_json=json.dumps(project_profile, indent=2),
            total_companies=total_companies,
            total_categories=total_categories,
            aggregated_findings_summary=summary,
        )

        try:
            response = self.client.messages.create(
                model=MODEL,
                max_tokens=MAX_SYNTHESIS_TOKENS,
                messages=[{"role": "user", "content": prompt}],
            )
            self.total_api_calls += 1
            if not response.content:
                raise RuntimeError("Claude returned empty response content")
            raw = response.content[0].text
            result = self._parse_json(raw)

            if result:
                return result

            # Retry once with explicit instruction
            logger.warning("[WARN] Synthesis JSON parse failed, retrying with stricter prompt")
            retry_response = self.client.messages.create(
                model=MODEL,
                max_tokens=MAX_SYNTHESIS_TOKENS,
                messages=[
                    {"role": "user", "content": prompt},
                    {"role": "assistant", "content": raw},
                    {"role": "user", "content": "Your response was not valid JSON. Return ONLY the JSON object, starting with { and ending with }. No markdown fences, no text before or after."},
                ],
            )
            self.total_api_calls += 1
            if retry_response.content:
                raw2 = retry_response.content[0].text
                result2 = self._parse_json(raw2)
                if result2:
                    return result2

            logger.error("[ERROR] Synthesis JSON parse failed after retry")
            return {"executive_summary": raw[:3000], "parse_failed": True}

        except Exception as e:
            logger.error(f"[ERROR] Synthesis failed: {e}")
            return {"executive_summary": f"Synthesis failed: {e}", "error": str(e)}

    def _run_batched_synthesis(
        self,
        companies: dict,
        project_profile: dict,
        total_companies: int,
        total_categories: int,
    ) -> dict:
        """Split into batches and run meta-synthesis."""
        logger.info(
            f"[DECISION] Synthesis split into batches due to context limits"
        )

        domains = list(companies.keys())
        batch_size = 100
        batch_summaries = []

        for i in range(0, len(domains), batch_size):
            batch_domains = domains[i : i + batch_size]
            batch_companies = {d: companies[d] for d in batch_domains}
            summary = self._build_aggregated_summary(batch_companies, max_chars=40000)

            batch_prompt = f"""Summarise the key findings from these {len(batch_domains)} companies
for a competitive intelligence report.

PROJECT: {json.dumps(project_profile, indent=2)}

FINDINGS:
{summary}

Return JSON with: top_opportunities (list), top_gaps (list), key_patterns (list),
notable_companies (list of names), risks (list). Be concise but specific."""

            try:
                response = self.client.messages.create(
                    model=MODEL,
                    max_tokens=2000,
                    messages=[{"role": "user", "content": batch_prompt}],
                )
                self.total_api_calls += 1
                if not response.content:
                    batch_summaries.append({"error": "Empty response"})
                    continue
                raw_text = response.content[0].text
                parsed = self._parse_json(raw_text)
                if parsed:
                    batch_summaries.append(parsed)
                else:
                    batch_summaries.append({"raw": raw_text[:2000]})
            except Exception as e:
                logger.error(f"[ERROR] Batch synthesis failed: {e}")
                batch_summaries.append({"error": str(e)})

        # Meta-synthesis across batches
        meta_prompt = SYNTHESIS_PROMPT.format(
            project_profile_json=json.dumps(project_profile, indent=2),
            total_companies=total_companies,
            total_categories=total_categories,
            aggregated_findings_summary=json.dumps(batch_summaries, indent=2)[:60000],
        )

        try:
            response = self.client.messages.create(
                model=MODEL,
                max_tokens=MAX_SYNTHESIS_TOKENS,
                messages=[{"role": "user", "content": meta_prompt}],
            )
            self.total_api_calls += 1
            if not response.content:
                return {"executive_summary": "Meta-synthesis returned empty response", "error": "empty_content"}
            raw_text = response.content[0].text
            result = self._parse_json(raw_text)
            return result or {"executive_summary": raw_text[:3000]}
        except Exception as e:
            logger.error(f"[ERROR] Meta-synthesis failed: {e}")
            return {"executive_summary": f"Synthesis failed: {e}", "error": str(e)}
