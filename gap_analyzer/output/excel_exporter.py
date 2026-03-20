"""Export per-company analysis results to a structured Excel file."""

import logging
import os

logger = logging.getLogger("gap_analyzer")


def export_to_excel(cache_data: dict, output_path: str) -> bool:
    """Export all company analyses to an Excel workbook with one row per company."""
    try:
        from openpyxl import Workbook
        from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
    except ImportError:
        logger.error("[ERROR] openpyxl not installed. Run: pip install openpyxl")
        return False

    companies = cache_data.get("companies", {})
    if not companies:
        logger.warning("[WARN] No companies to export")
        return False

    wb = Workbook()

    # ─── Sheet 1: Full Analysis ───
    ws = wb.active
    ws.title = "Company Analysis"

    header_font = Font(bold=True, color="FFFFFF", size=10)
    header_fill = PatternFill(start_color="1B2A4A", end_color="1B2A4A", fill_type="solid")
    wrap = Alignment(wrap_text=True, vertical="top")
    thin_border = Border(
        left=Side(style="thin", color="D5D5D5"),
        right=Side(style="thin", color="D5D5D5"),
        top=Side(style="thin", color="D5D5D5"),
        bottom=Side(style="thin", color="D5D5D5"),
    )

    headers = [
        "Domain",
        "Company Name",
        "URL",
        "Category",
        "Niche",
        "Status",
        "Source",
        "One-Line Verdict",
        # Dim 2: Functionality
        "Core Product",
        "Key Features",
        "Tech Signals",
        "Integrations",
        "Product Maturity",
        "Functionality Gap",
        # Dim 3: Content
        "Primary Message",
        "Messaging Clarity",
        "Content Tone",
        "SEO Depth",
        "Social Proof",
        "Primary CTA",
        "Content Gap",
        # Dim 4: Services
        "Product Catalogue",
        "Pricing Model",
        "Pricing Visibility",
        "Packaging",
        "Upsell Mechanics",
        "Services Gap",
        # Dim 5: Business Model
        "Business Model",
        "Revenue Model",
        "ICP",
        "GTM Motion",
        "Competitive Position",
        "Growth Stage",
        "Business Model Gap",
        # Lists
        "Top Opportunities",
        "Value-Add Ideas",
        "Watch Out For",
        # Meta
        "Pages Scraped",
        "Analysed At",
    ]

    for col_idx, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col_idx, value=header)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = thin_border

    # Freeze header row
    ws.freeze_panes = "A2"

    row_idx = 2
    for domain, data in sorted(companies.items()):
        analysis = data.get("analysis", data)
        status = data.get("status", "unknown")
        source = data.get("source", "")

        dim2 = analysis.get("dim2_functionality_tech", {}) or {}
        dim3 = analysis.get("dim3_content_messaging", {}) or {}
        dim4 = analysis.get("dim4_services_products", {}) or {}
        dim5 = analysis.get("dim5_business_model", {}) or {}

        row = [
            domain,
            analysis.get("company_name", domain),
            analysis.get("url", ""),
            analysis.get("category", ""),
            analysis.get("niche", ""),
            status,
            source,
            analysis.get("one_line_verdict", ""),
            # Dim 2
            dim2.get("core_product", ""),
            _join_list(dim2.get("key_features", [])),
            dim2.get("tech_signals", ""),
            dim2.get("integrations", ""),
            dim2.get("product_maturity", ""),
            dim2.get("gap_for_your_project", ""),
            # Dim 3
            dim3.get("primary_message", ""),
            dim3.get("messaging_clarity", ""),
            dim3.get("content_tone", ""),
            dim3.get("seo_depth", ""),
            dim3.get("social_proof", ""),
            dim3.get("primary_cta", ""),
            dim3.get("gap_for_your_project", ""),
            # Dim 4
            dim4.get("product_catalogue", ""),
            dim4.get("pricing_model", ""),
            dim4.get("pricing_visibility", ""),
            dim4.get("packaging", ""),
            dim4.get("upsell_mechanics", ""),
            dim4.get("gap_for_your_project", ""),
            # Dim 5
            dim5.get("business_model", ""),
            dim5.get("revenue_model", ""),
            dim5.get("icp", ""),
            dim5.get("gtm_motion", ""),
            dim5.get("competitive_position", ""),
            dim5.get("growth_stage", ""),
            dim5.get("gap_for_your_project", ""),
            # Lists
            _join_list(analysis.get("top_opportunities", [])),
            _join_list(analysis.get("value_add_ideas", [])),
            _join_list(analysis.get("watch_out_for", [])),
            # Meta
            ", ".join(data.get("pages_scraped", [])),
            data.get("analysed_at", ""),
        ]

        for col_idx, value in enumerate(row, 1):
            cell = ws.cell(row=row_idx, column=col_idx, value=str(value) if value else "")
            cell.alignment = wrap
            cell.border = thin_border

        row_idx += 1

    # Auto-width columns (capped at 50)
    for col_idx in range(1, len(headers) + 1):
        max_len = len(str(ws.cell(row=1, column=col_idx).value or ""))
        for r in range(2, min(row_idx, 20)):  # Sample first 18 rows
            val = str(ws.cell(row=r, column=col_idx).value or "")
            max_len = max(max_len, min(len(val), 50))
        ws.column_dimensions[_col_letter(col_idx)].width = min(max_len + 4, 50)

    # ─── Sheet 2: Opportunities Matrix ───
    ws2 = wb.create_sheet("Opportunities")
    opp_headers = ["Company", "Category", "Niche", "Opportunity"]
    for col_idx, header in enumerate(opp_headers, 1):
        cell = ws2.cell(row=1, column=col_idx, value=header)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = thin_border
    ws2.freeze_panes = "A2"

    opp_row = 2
    for domain, data in sorted(companies.items()):
        analysis = data.get("analysis", data)
        name = analysis.get("company_name", domain)
        cat = analysis.get("category", "")
        niche = analysis.get("niche", "")
        for opp in analysis.get("top_opportunities", []):
            ws2.cell(row=opp_row, column=1, value=name).border = thin_border
            ws2.cell(row=opp_row, column=2, value=cat).border = thin_border
            ws2.cell(row=opp_row, column=3, value=niche).border = thin_border
            ws2.cell(row=opp_row, column=4, value=opp).border = thin_border
            opp_row += 1

    for col_idx in range(1, 5):
        ws2.column_dimensions[_col_letter(col_idx)].width = 40

    # ─── Sheet 3: Gaps Summary ───
    ws3 = wb.create_sheet("Gaps")
    gap_headers = ["Company", "Category", "Dimension", "Gap For Your Project"]
    for col_idx, header in enumerate(gap_headers, 1):
        cell = ws3.cell(row=1, column=col_idx, value=header)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = thin_border
    ws3.freeze_panes = "A2"

    gap_row = 2
    dim_labels = [
        ("dim2_functionality_tech", "Functionality & Tech"),
        ("dim3_content_messaging", "Content & Messaging"),
        ("dim4_services_products", "Services & Products"),
        ("dim5_business_model", "Business Model"),
    ]
    for domain, data in sorted(companies.items()):
        analysis = data.get("analysis", data)
        name = analysis.get("company_name", domain)
        cat = analysis.get("category", "")
        for dim_key, dim_label in dim_labels:
            dim_data = analysis.get(dim_key, {}) or {}
            gap = dim_data.get("gap_for_your_project", "")
            if gap and gap.lower() not in ("n/a", "not determinable", "none", ""):
                ws3.cell(row=gap_row, column=1, value=name).border = thin_border
                ws3.cell(row=gap_row, column=2, value=cat).border = thin_border
                ws3.cell(row=gap_row, column=3, value=dim_label).border = thin_border
                ws3.cell(row=gap_row, column=4, value=gap).border = thin_border
                gap_row += 1

    for col_idx in range(1, 5):
        ws3.column_dimensions[_col_letter(col_idx)].width = 40

    # Save
    os.makedirs(os.path.dirname(os.path.abspath(output_path)) or ".", exist_ok=True)
    wb.save(output_path)
    logger.info(f"[INFO] Excel report saved: {output_path} ({row_idx - 2} companies, "
                f"{opp_row - 2} opportunities, {gap_row - 2} gaps)")
    return True


def _join_list(items: list, sep: str = "\n• ") -> str:
    """Join a list into a bullet-separated string."""
    if not items:
        return ""
    return "• " + sep.join(str(i) for i in items)


def _col_letter(col_idx: int) -> str:
    """Convert 1-based column index to Excel column letter."""
    result = ""
    while col_idx > 0:
        col_idx, remainder = divmod(col_idx - 1, 26)
        result = chr(65 + remainder) + result
    return result
