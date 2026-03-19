# Ecommerce Competitive Gap Analysis Engine

A production-grade competitive intelligence tool that scans up to 500+ ecommerce companies, analyses each against your project specification using AI, and produces a comprehensive Word document report suitable for direct use in business plan updates.

The engine combines live web scraping (Firecrawl API + Playwright fallback), AI-powered analysis (Claude), and professional document generation to deliver actionable competitive insights — features your project is missing, UX patterns to adopt, content strategies to borrow, business model mechanics to consider, and market gaps to exploit.

## Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ (optional — falls back to python-docx if not installed)
- Anthropic API key
- Firecrawl API key (optional — uses requests fallback if missing)

### Installation (Windows/PowerShell)

```powershell
# Clone and enter directory
cd gap_analyzer

# Install Python dependencies
pip install -r requirements.txt

# Install Playwright browser
playwright install chromium

# Install Node.js dependencies (for Word doc generation)
npm install

# Set up environment variables
Copy-Item .env.example .env
# Edit .env and add your API keys
```

### Installation (macOS/Linux)

```bash
cd gap_analyzer
pip install -r requirements.txt
playwright install chromium
npm install
cp .env.example .env
# Edit .env and add your API keys
```

## Preparing Your Inputs

### 1. Project Specs Document

Your project specification document tells the engine what YOUR project offers, so it can identify what competitors have that you don't. Supported formats: `.docx`, `.pdf`, `.txt`.

Include in your specs:
- All services, features, and products your project offers
- Target audience and customer segments
- Business model and revenue model
- Technology stack
- Unique value propositions
- Any known competitors

### 2. Companies Excel File

An `.xlsx` file with your competitor list. Use `companies_template.xlsx` as a starting point.

**Required columns** (names are fuzzy-matched):
| Column | Description |
|--------|-------------|
| Company Name | Display name |
| URL | Company website (primary scraping target) |
| Category | Top-level category (e.g., "Fulfilment", "Payments") |

**Optional columns:**
| Column | Description |
|--------|-------------|
| Niche | Sub-category (e.g., "Last-mile delivery") |
| Description | Short company description |
| Domain Rating | SEO metric |
| Monthly Traffic | Traffic estimate |
| Keywords | Number of ranking keywords |
| Authority Score | Domain authority |

Column names are matched flexibly — "Web URL", "Website", "Domain" all map to the URL field.

To generate the template:
```bash
python create_template.py
```

## Running the Tool

### Basic run
```bash
python gap_analyzer.py --specs specs.docx --companies companies.xlsx
```

### Test with first 5 companies
```bash
python gap_analyzer.py --specs specs.docx --companies companies.xlsx --limit 5
```

### Process only one category
```bash
python gap_analyzer.py --specs specs.docx --companies companies.xlsx --category "Payments"
```

### Resume a previous run
```bash
# Automatic — if gap_analyzer_cache.json exists, it resumes by default
python gap_analyzer.py --specs specs.docx --companies companies.xlsx
```

### Start fresh (discard cache)
```bash
python gap_analyzer.py --specs specs.docx --companies companies.xlsx --fresh
```

### Refresh specific companies
```bash
python gap_analyzer.py --specs specs.docx --companies companies.xlsx --refresh "klaviyo.com,gorgias.com"
```

### Skip synthesis (faster, no master report)
```bash
python gap_analyzer.py --specs specs.docx --companies companies.xlsx --no-synthesis
```

### All flags
```
--specs       Path to project specification document (.docx/.pdf/.txt)
--companies   Path to company Excel file (.xlsx)
--output      Output Word document path (default: competitive_report.docx)
--workers     Parallel workers, 1-5 (default: 3)
--limit       Process only first N companies
--category    Process only companies in this category
--resume      Path to cache JSON (default: gap_analyzer_cache.json)
--no-synthesis  Skip final cross-company synthesis
--fresh       Discard existing cache and start over
--refresh     Re-analyse specific domains (comma-separated)
--no-overwrite  Don't overwrite existing output (adds timestamp)
```

## Understanding the Output

The Word document contains:

1. **Executive Summary** — Project profile, competitive landscape overview, quick wins, strategic priorities
2. **Key Findings by Dimension** — Design/UX patterns, missing features, content gaps, business model insights
3. **Findings by Category** — Per-category breakdown with key players, patterns, and gaps
4. **Company-by-Company Analysis** — Detailed 5-dimension analysis card for each company
5. **Master Opportunity Matrix** — All opportunities ranked by frequency and priority
6. **Strategic Recommendations** — Detailed missing features, underserved niches
7. **Risks If Not Addressed** — What happens if you ignore these findings
8. **Appendix A** — Full company index with analysis status
9. **Appendix B** — Data sources, run metadata, API usage

## Troubleshooting

### Common Issues

**"No specs file found"**
Pass `--specs path/to/your/specs.docx` or place a `.docx`/`.pdf`/`.txt` file in the same directory.

**"ANTHROPIC_API_KEY not set"**
Create a `.env` file from `.env.example` and add your Anthropic API key.

**Firecrawl scraping failures**
If you don't have a Firecrawl API key, the tool automatically falls back to `requests` + BeautifulSoup. Playwright is used as a secondary fallback for JS-heavy sites.

**Run interrupted mid-way**
Just re-run the same command. The cache automatically resumes from where it stopped. Completed companies are not re-analysed.

**Word document won't open**
If the `.docx` generation fails, a `_fallback.txt` file is created with all findings in plain text.

### Logs
- `gap_analyzer.log` — Full debug log
- `gap_analyzer_errors.log` — Companies that failed
- `gap_analyzer_crash.log` — Unhandled exceptions
- `gap_analyzer_checkpoint.txt` — Quick progress check

## Performance Tips

| Companies | Workers | Estimated Time |
|-----------|---------|---------------|
| 10        | 3       | ~5 minutes    |
| 50        | 3       | ~25 minutes   |
| 100       | 3       | ~50 minutes   |
| 500       | 3       | ~3-4 hours    |
| 500       | 5       | ~2-3 hours    |

- Use `--limit 5` first to verify everything works
- Use `--workers 5` for faster processing (check API rate limits)
- The cache system means you never lose progress — interrupted runs resume instantly
- Running on a subset with `--category` is useful for focused analysis
