/**
 * Word Document Report Builder — Competitive Intelligence Report
 * Uses the docx npm package to generate a professional .docx file.
 *
 * Usage: node report_builder.js <cache_json_path> <output_docx_path>
 */

const fs = require("fs");
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  AlignmentType,
  HeadingLevel,
  LevelFormat,
  PageBreak,
  TableOfContents,
  BorderStyle,
  convertInchesToTwip,
} = require("docx");

// ─── Colour constants ───
const NAVY = "1B2A4A";
const SLATE = "2C3E50";
const BLUE = "2E86C1";
const BODY_COLOR = "1A1A1A";
const TABLE_HEADER_FILL = "1B2A4A";
const TABLE_ALT_FILL = "EAF2FF";
const RED = "922B21";
const AMBER = "7D6608";
const TEAL = "0D6B4F";
const WHITE = "FFFFFF";

// ─── Helper functions ───
function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    children: [
      new TextRun({ text, bold: true, size: 32, color: NAVY, font: "Arial" }),
    ],
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150 },
    children: [
      new TextRun({ text, bold: true, size: 28, color: SLATE, font: "Arial" }),
    ],
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100 },
    children: [
      new TextRun({ text, bold: true, size: 24, color: BLUE, font: "Arial" }),
    ],
  });
}

function bodyText(text) {
  return new Paragraph({
    spacing: { after: 100 },
    children: [
      new TextRun({ text, size: 22, color: BODY_COLOR, font: "Arial" }),
    ],
  });
}

function boldBodyText(label, value) {
  return new Paragraph({
    spacing: { after: 80 },
    children: [
      new TextRun({ text: label, bold: true, size: 22, color: BODY_COLOR, font: "Arial" }),
      new TextRun({ text: value, size: 22, color: BODY_COLOR, font: "Arial" }),
    ],
  });
}

function bulletItem(text) {
  return new Paragraph({
    spacing: { after: 60 },
    indent: { left: convertInchesToTwip(0.5) },
    children: [
      new TextRun({ text: `\u2022 ${text}`, size: 22, color: BODY_COLOR, font: "Arial" }),
    ],
  });
}

function priorityColor(priority) {
  if (!priority) return BODY_COLOR;
  const p = priority.toLowerCase();
  if (p === "high") return RED;
  if (p === "medium") return AMBER;
  if (p === "low") return TEAL;
  return BODY_COLOR;
}

function tableCell(text, opts = {}) {
  const isHeader = opts.header || false;
  const isAlt = opts.alt || false;
  const width = opts.width || 2000;

  const shading = isHeader
    ? { type: ShadingType.CLEAR, color: "auto", fill: TABLE_HEADER_FILL }
    : isAlt
    ? { type: ShadingType.CLEAR, color: "auto", fill: TABLE_ALT_FILL }
    : undefined;

  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading,
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: String(text || "").substring(0, 300),
            size: 20,
            color: isHeader ? WHITE : BODY_COLOR,
            bold: isHeader,
            font: "Arial",
          }),
        ],
      }),
    ],
  });
}

function makeTableRow(cells, opts = {}) {
  return new TableRow({
    children: cells.map((text, i) =>
      tableCell(text, {
        header: opts.header,
        alt: opts.alt,
        width: opts.widths ? opts.widths[i] : 2000,
      })
    ),
  });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

// ─── Main build function ───
function buildReport(cacheData) {
  const metadata = cacheData.metadata || {};
  const projectProfile = cacheData.project_profile || {};
  const companies = cacheData.companies || {};
  const synthesis = cacheData.synthesis || {};
  const totalCompanies = Object.keys(companies).length;

  const sections = [];

  // ─── COVER PAGE ───
  sections.push(
    new Paragraph({ spacing: { before: 3000 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "Competitive Intelligence Report",
          bold: true,
          size: 56,
          color: NAVY,
          font: "Arial",
        }),
      ],
    }),
    new Paragraph({ spacing: { before: 400 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Ecommerce Ecosystem Analysis \u2014 ${totalCompanies} Companies`,
          size: 28,
          color: SLATE,
          font: "Arial",
        }),
      ],
    }),
    new Paragraph({ spacing: { before: 200 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Date: ${metadata.last_updated || new Date().toISOString().split("T")[0]}`,
          size: 22,
          color: BODY_COLOR,
          font: "Arial",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "Version: 1.0 \u2014 Confidential",
          size: 22,
          color: BODY_COLOR,
          font: "Arial",
        }),
      ],
    }),
    pageBreak()
  );

  // ─── TABLE OF CONTENTS ───
  sections.push(heading1("Table of Contents"));
  sections.push(
    new TableOfContents("Table of Contents", {
      hyperlink: true,
      headingStyleRange: "1-3",
    })
  );
  sections.push(pageBreak());

  // ─── SECTION 1: EXECUTIVE SUMMARY ───
  sections.push(heading1("1. Executive Summary"));
  sections.push(heading2("Project Profile"));

  const services = projectProfile.services_and_features || [];
  if (services.length) {
    sections.push(boldBodyText("Services: ", services.slice(0, 10).join(", ")));
  }
  sections.push(
    boldBodyText("Business Model: ", projectProfile.business_model || "N/A")
  );
  sections.push(
    boldBodyText(
      "Target Audience: ",
      (projectProfile.target_audience || []).join(", ") || "N/A"
    )
  );

  const execSummary = synthesis.executive_summary || "";
  if (execSummary) {
    sections.push(bodyText(execSummary));
  }

  // Quick wins
  const quickWins = synthesis.quick_wins || [];
  if (quickWins.length) {
    sections.push(heading2("Quick Wins"));
    const qwWidths = [6000, 3000];
    sections.push(
      new Table({
        columnWidths: qwWidths,
        rows: [
          makeTableRow(["Action", "Impact"], { header: true, widths: qwWidths }),
          ...quickWins.map((qw, i) =>
            makeTableRow([qw, "High"], { alt: i % 2 === 1, widths: qwWidths })
          ),
        ],
      })
    );
  }

  // Strategic priorities
  const priorities = synthesis.strategic_priorities || [];
  if (priorities.length) {
    sections.push(heading2("Top Strategic Priorities"));
    priorities.forEach((p, i) => {
      sections.push(bodyText(`${i + 1}. ${p}`));
    });
  }

  sections.push(pageBreak());

  // ─── SECTION 2: KEY FINDINGS BY DIMENSION ───
  sections.push(heading1("2. Key Findings by Dimension"));

  const uxPatterns = synthesis.top_ux_patterns_to_adopt || [];
  if (uxPatterns.length) {
    sections.push(heading2("Design & UX Patterns to Adopt"));
    uxPatterns.forEach((p) => sections.push(bulletItem(p)));
  }

  const missingFeatures = synthesis.top_missing_features || [];
  if (missingFeatures.length) {
    sections.push(heading2("Top Missing Features"));
    const mfWidths = [2500, 2500, 1200, 3000];
    sections.push(
      new Table({
        columnWidths: mfWidths,
        rows: [
          makeTableRow(["Feature", "Seen At", "Priority", "Recommendation"], {
            header: true,
            widths: mfWidths,
          }),
          ...missingFeatures
            .filter((mf) => typeof mf === "object")
            .map((mf, i) =>
              makeTableRow(
                [
                  mf.feature || "",
                  (mf.seen_at || []).join(", "),
                  mf.priority || "",
                  mf.recommendation || "",
                ],
                { alt: i % 2 === 1, widths: mfWidths }
              )
            ),
        ],
      })
    );
  }

  const contentGaps = synthesis.content_strategy_gaps || [];
  if (contentGaps.length) {
    sections.push(heading2("Content Strategy Gaps"));
    contentGaps.forEach((cg) => sections.push(bulletItem(cg)));
  }

  const bizEnhancements = synthesis.business_model_enhancements || [];
  if (bizEnhancements.length) {
    sections.push(heading2("Business Model Enhancements"));
    bizEnhancements.forEach((be) => sections.push(bulletItem(be)));
  }

  sections.push(pageBreak());

  // ─── SECTION 3: FINDINGS BY CATEGORY ───
  sections.push(heading1("3. Findings by Category"));

  const catInsights = synthesis.category_by_category_insights || [];
  catInsights.forEach((ci) => {
    if (typeof ci !== "object") return;
    sections.push(heading2(ci.category || "Unknown"));
    if (ci.key_players && ci.key_players.length) {
      sections.push(boldBodyText("Key Players: ", ci.key_players.join(", ")));
    }
    sections.push(boldBodyText("Patterns: ", ci.dominant_patterns || "N/A"));
    sections.push(boldBodyText("Project Gaps: ", ci.project_gaps || "N/A"));
    (ci.recommendations || []).forEach((r) => sections.push(bulletItem(r)));
  });

  sections.push(pageBreak());

  // ─── SECTION 4: COMPANY-BY-COMPANY ANALYSIS ───
  sections.push(heading1("4. Company-by-Company Analysis"));

  // Group by category
  const byCategory = {};
  for (const [domain, data] of Object.entries(companies)) {
    const analysis = data.analysis || data;
    const cat = analysis.category || "Uncategorised";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push({ domain, analysis });
  }

  const dimWidths = [2000, 3500, 3700];
  for (const [category, entries] of Object.entries(byCategory).sort()) {
    sections.push(heading2(`${category} (${entries.length} companies)`));

    entries.forEach(({ domain, analysis }) => {
      const name = analysis.company_name || domain;
      const url = analysis.url || "";
      const verdict = analysis.one_line_verdict || "";
      const niche = analysis.niche || "";

      sections.push(heading3(name));
      sections.push(
        bodyText(`URL: ${url}  |  Category: ${category}  |  Niche: ${niche}`)
      );
      if (verdict) {
        sections.push(boldBodyText("Verdict: ", verdict));
      }

      // Dimension table
      const dims = [
        ["Design/UX", "dim1_design_ux"],
        ["Functionality", "dim2_functionality_tech"],
        ["Content", "dim3_content_messaging"],
        ["Services", "dim4_services_products"],
        ["Business Model", "dim5_business_model"],
      ];

      const dimRows = [
        makeTableRow(["Dimension", "What They Do", "Gap For Your Project"], {
          header: true,
          widths: dimWidths,
        }),
      ];

      dims.forEach(([label, key], i) => {
        const dimData = analysis[key] || {};
        if (typeof dimData !== "object") return;
        const summaryParts = [];
        for (const [k, v] of Object.entries(dimData)) {
          if (k !== "gap_for_your_project" && typeof v === "string") {
            summaryParts.push(v);
          }
        }
        dimRows.push(
          makeTableRow(
            [
              label,
              summaryParts.slice(0, 3).join("; ").substring(0, 200),
              String(dimData.gap_for_your_project || "N/A").substring(0, 200),
            ],
            { alt: i % 2 === 1, widths: dimWidths }
          )
        );
      });

      sections.push(new Table({ columnWidths: dimWidths, rows: dimRows }));

      // Opportunities
      const opps = analysis.top_opportunities || [];
      if (opps.length) {
        sections.push(boldBodyText("Top Opportunities:", ""));
        opps.forEach((o) => sections.push(bulletItem(o)));
      }

      // Value-add ideas
      const ideas = analysis.value_add_ideas || [];
      if (ideas.length) {
        sections.push(boldBodyText("Value-Add Ideas:", ""));
        ideas.forEach((i_item) => sections.push(bulletItem(i_item)));
      }

      // Watch out
      const watch = analysis.watch_out_for || [];
      if (watch.length) {
        sections.push(boldBodyText("Watch Out For:", ""));
        watch.forEach((w) => sections.push(bulletItem(w)));
      }
    });
  }

  sections.push(pageBreak());

  // ─── SECTION 5: MASTER OPPORTUNITY MATRIX ───
  sections.push(heading1("5. Master Opportunity Matrix"));

  const allOpps = [];
  for (const [domain, data] of Object.entries(companies)) {
    const analysis = data.analysis || data;
    const name = analysis.company_name || domain;
    (analysis.top_opportunities || []).forEach((opp) => {
      allOpps.push({ opportunity: opp, company: name });
    });
  }

  if (allOpps.length) {
    const oppWidths = [4000, 2500, 1500];
    const oppRows = [
      makeTableRow(["Opportunity", "Seen At", "Priority"], {
        header: true,
        widths: oppWidths,
      }),
    ];
    allOpps.slice(0, 100).forEach((item, i) => {
      oppRows.push(
        makeTableRow(
          [
            item.opportunity.substring(0, 200),
            item.company,
            "Medium",
          ],
          { alt: i % 2 === 1, widths: oppWidths }
        )
      );
    });
    sections.push(new Table({ columnWidths: oppWidths, rows: oppRows }));
  }

  sections.push(pageBreak());

  // ─── SECTION 6: STRATEGIC RECOMMENDATIONS ───
  sections.push(heading1("6. Strategic Recommendations"));

  if (missingFeatures.length) {
    sections.push(heading2("Top Missing Features (Detailed)"));
    missingFeatures.forEach((mf) => {
      if (typeof mf === "object") {
        sections.push(
          bodyText(
            `${mf.feature || ""} \u2014 ${mf.recommendation || ""} (Seen at: ${(mf.seen_at || []).join(", ")})`
          )
        );
      }
    });
  }

  const niches = synthesis.underserved_niches || [];
  if (niches.length) {
    sections.push(heading2("Underserved Niches to Target"));
    niches.forEach((n) => sections.push(bulletItem(n)));
  }

  sections.push(pageBreak());

  // ─── SECTION 7: RISKS ───
  sections.push(heading1("7. Risks If Not Addressed"));

  const risks = synthesis.risks_if_not_addressed || [];
  if (risks.length) {
    const riskWidths = [3500, 2000, 3700];
    sections.push(
      new Table({
        columnWidths: riskWidths,
        rows: [
          makeTableRow(["Risk", "Impact", "Mitigation"], {
            header: true,
            widths: riskWidths,
          }),
          ...risks.map((r, i) =>
            makeTableRow([String(r).substring(0, 200), "High", "See recommendations"], {
              alt: i % 2 === 1,
              widths: riskWidths,
            })
          ),
        ],
      })
    );
  }

  sections.push(pageBreak());

  // ─── APPENDIX A: COMPANY INDEX ───
  sections.push(heading1("Appendix A: Full Company Index"));

  const idxWidths = [2000, 2500, 1500, 1500, 1200];
  const idxRows = [
    makeTableRow(["Company", "URL", "Category", "Niche", "Status"], {
      header: true,
      widths: idxWidths,
    }),
  ];
  Object.entries(companies)
    .sort()
    .forEach(([domain, data], i) => {
      const analysis = data.analysis || data;
      idxRows.push(
        makeTableRow(
          [
            (analysis.company_name || domain).substring(0, 50),
            (analysis.url || domain).substring(0, 60),
            (analysis.category || "").substring(0, 30),
            (analysis.niche || "").substring(0, 30),
            data.status || "success",
          ],
          { alt: i % 2 === 1, widths: idxWidths }
        )
      );
    });
  sections.push(new Table({ columnWidths: idxWidths, rows: idxRows }));

  sections.push(pageBreak());

  // ─── APPENDIX B: DATA SOURCES ───
  sections.push(heading1("Appendix B: Data Sources"));

  const runs = (metadata.runs || []);
  sections.push(bodyText(`Analysis Date: ${metadata.last_updated || "N/A"}`));
  sections.push(bodyText(`Companies File: ${metadata.companies_file || "N/A"}`));
  sections.push(bodyText(`Specs File: ${metadata.specs_file || "N/A"}`));
  sections.push(bodyText(`Claude Model: claude-sonnet-4-5-20251022`));
  sections.push(bodyText(`Total Companies: ${totalCompanies}`));
  sections.push(bodyText(`Total Runs: ${runs.length}`));
  runs.forEach((r) => {
    sections.push(
      bodyText(
        `  Run ${r.run_id || "N/A"}: ${r.completed || 0} completed, ${r.failed || 0} failed`
      )
    );
  });

  // Reports generated
  const reports = cacheData.reports_generated || [];
  if (reports.length) {
    sections.push(heading2("Previous Reports"));
    reports.forEach((rpt) => {
      sections.push(
        bodyText(
          `  ${rpt.generated_at || "N/A"}: ${rpt.companies_in_report || 0} companies`
        )
      );
    });
  }

  // ─── Build document ───
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children: sections,
      },
    ],
    numbering: {
      config: [
        {
          reference: "bullet-list",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "\u2022",
              alignment: AlignmentType.LEFT,
            },
          ],
        },
      ],
    },
    features: {
      updateFields: true,
    },
  });

  return doc;
}

// ─── CLI entry point ───
async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error("Usage: node report_builder.js <cache.json> <output.docx>");
    process.exit(1);
  }

  const [cachePath, outputPath] = args;

  console.log(`[INFO] Reading cache: ${cachePath}`);
  const raw = fs.readFileSync(cachePath, "utf-8");
  const cacheData = JSON.parse(raw);

  console.log(`[INFO] Building Word document...`);
  const doc = buildReport(cacheData);

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);

  console.log(`[INFO] Report saved: ${outputPath}`);
}

main().catch((err) => {
  console.error(`[ERROR] Report generation failed: ${err.message}`);
  process.exit(1);
});
