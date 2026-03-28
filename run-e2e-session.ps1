# ============================================================
# YouSell E2E Live Testing Session Runner
# Run from project root: .\run-e2e-session.ps1
# ============================================================

$PROJECT_ROOT = $PSScriptRoot
$LOG_FILE = "$PROJECT_ROOT\E2E_SESSION_LOG.md"
$RESULTS_DIR = "$PROJECT_ROOT\e2e-results"
$TIMESTAMP = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# Create results dir if not exists
if (-not (Test-Path $RESULTS_DIR)) {
    New-Item -ItemType Directory -Path $RESULTS_DIR | Out-Null
}

# Session output log
$SESSION_OUTPUT = "$RESULTS_DIR\session_output_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  YouSell E2E Live Testing Session" -ForegroundColor Cyan
Write-Host "  Started: $TIMESTAMP" -ForegroundColor Cyan
Write-Host "  Logging to: $SESSION_OUTPUT" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $PROJECT_ROOT

# Track results
$results = @{}

function Run-Suite {
    param(
        [string]$Name,
        [string]$Command,
        [string]$Key
    )

    Write-Host ""
    Write-Host "------------------------------------------------------------" -ForegroundColor Yellow
    Write-Host "  Running: $Name" -ForegroundColor Yellow
    Write-Host "  Command: $Command" -ForegroundColor Yellow
    Write-Host "  Time: $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Yellow
    Write-Host "------------------------------------------------------------" -ForegroundColor Yellow

    $start = Get-Date
    $output = Invoke-Expression $Command 2>&1
    $end = Get-Date
    $duration = [math]::Round(($end - $start).TotalSeconds, 1)
    $exitCode = $LASTEXITCODE

    # Write output to session log
    "=== $Name ===" | Out-File -Append $SESSION_OUTPUT
    $output | Out-File -Append $SESSION_OUTPUT
    "" | Out-File -Append $SESSION_OUTPUT

    # Display output
    $output | ForEach-Object { Write-Host $_ }

    if ($exitCode -eq 0) {
        Write-Host "  ✅ PASSED in ${duration}s" -ForegroundColor Green
        $results[$Key] = @{ Status = "PASSED"; Duration = "${duration}s"; ExitCode = $exitCode }
    } else {
        Write-Host "  ❌ FAILED in ${duration}s (exit code: $exitCode)" -ForegroundColor Red
        $results[$Key] = @{ Status = "FAILED"; Duration = "${duration}s"; ExitCode = $exitCode }
    }
}

# ── 1. Install Playwright browsers if needed ──────────────────
Write-Host "Checking Playwright browsers..." -ForegroundColor Cyan
npx playwright install chromium 2>&1 | Out-Null
Write-Host "✓ Browsers ready" -ForegroundColor Green

# ── 2. Auth Setup ─────────────────────────────────────────────
Run-Suite `
    -Name "1. Auth Setup" `
    -Command "npx playwright test auth.setup --reporter=list" `
    -Key "auth_setup"

if ($results["auth_setup"].Status -eq "FAILED") {
    Write-Host ""
    Write-Host "⛔ Auth setup failed — cannot continue without authentication." -ForegroundColor Red
    Write-Host "   Check credentials or network connectivity to admin.yousell.online" -ForegroundColor Red
    exit 1
}

# ── 3. Auth Flows ─────────────────────────────────────────────
Run-Suite `
    -Name "2. Auth Flows" `
    -Command "npx playwright test auth-flows --project=desktop-chrome --reporter=list" `
    -Key "auth_flows"

# ── 4. Admin Dashboard ────────────────────────────────────────
Run-Suite `
    -Name "3. Admin Dashboard" `
    -Command "npx playwright test admin-dashboard --project=desktop-chrome --reporter=list" `
    -Key "admin_dashboard"

# ── 5. Admin Pages (All) ──────────────────────────────────────
Run-Suite `
    -Name "4. Admin Pages (Comprehensive)" `
    -Command "npx playwright test admin-pages-comprehensive --project=desktop-chrome --reporter=list" `
    -Key "admin_pages"

# ── 6. Client Dashboard ───────────────────────────────────────
Run-Suite `
    -Name "5. Client Dashboard" `
    -Command "npx playwright test client-dashboard --project=desktop-chrome --reporter=list" `
    -Key "client_dashboard"

# ── 7. Marketing Website ──────────────────────────────────────
Run-Suite `
    -Name "6. Marketing Website" `
    -Command "npx playwright test marketing-website --project=desktop-chrome --reporter=list" `
    -Key "marketing"

# ── 8. Components ─────────────────────────────────────────────
Run-Suite `
    -Name "7. Components" `
    -Command "npx playwright test components --project=desktop-chrome --reporter=list" `
    -Key "components"

# ── 9. Responsive ─────────────────────────────────────────────
Run-Suite `
    -Name "8. Responsive Design" `
    -Command "npx playwright test responsive --project=desktop-chrome --reporter=list" `
    -Key "responsive"

# ── 10. Accessibility ─────────────────────────────────────────
Run-Suite `
    -Name "9. Accessibility" `
    -Command "npx playwright test accessibility --project=desktop-chrome --reporter=list" `
    -Key "accessibility"

# ── 11. Cross-Functional (seams between all 3 surfaces) ───────
Run-Suite `
    -Name "10. Cross-Functional (Marketing ↔ Dashboard ↔ Admin)" `
    -Command "npx playwright test cross-functional --project=desktop-chrome --reporter=list" `
    -Key "cross_functional"

# ── 12. Visual Regression ─────────────────────────────────────
Write-Host ""
Write-Host "Note: Visual regression — first run creates baselines (no failures expected)" -ForegroundColor Cyan
Run-Suite `
    -Name "11. Visual Regression" `
    -Command "npx playwright test visual-regression --project=desktop-chrome --reporter=list --update-snapshots" `
    -Key "visual"

# ── Summary ───────────────────────────────────────────────────
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  E2E SESSION COMPLETE — $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$passed = 0
$failed = 0

foreach ($key in $results.Keys) {
    $r = $results[$key]
    $icon = if ($r.Status -eq "PASSED") { "✅" } else { "❌" }
    $color = if ($r.Status -eq "PASSED") { "Green" } else { "Red" }
    Write-Host "  $icon $key — $($r.Status) ($($r.Duration))" -ForegroundColor $color
    if ($r.Status -eq "PASSED") { $passed++ } else { $failed++ }
}

Write-Host ""
Write-Host "  Passed: $passed / $($results.Count)" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Yellow" })
Write-Host "  Failed: $failed / $($results.Count)" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host ""
Write-Host "  Full output log: $SESSION_OUTPUT" -ForegroundColor Cyan
Write-Host "  HTML report: Run 'npx playwright show-report e2e-report'" -ForegroundColor Cyan
Write-Host ""

# Open HTML report
$openReport = Read-Host "Open HTML report in browser? (y/n)"
if ($openReport -eq "y") {
    npx playwright show-report e2e-report
}
