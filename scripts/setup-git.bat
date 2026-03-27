@echo off
title YOUSELL Git Setup
color 0E

cd /d "%~dp0.."

echo ============================================
echo   YOUSELL Git Setup (run once)
echo ============================================
echo.

REM Set git identity
git config user.name "haqeeqiazadee-ux"
git config user.email "haqeeqiazadee@users.noreply.github.com"
echo [OK] Git identity configured

REM Check if remote exists
git remote get-url origin > nul 2>&1
if errorlevel 1 (
    git remote add origin https://github.com/haqeeqiazadee-ux/yousell-admin.git
    echo [OK] Remote origin added
) else (
    git remote set-url origin https://github.com/haqeeqiazadee-ux/yousell-admin.git
    echo [OK] Remote origin updated
)

REM Set default branch
git branch -M main
echo [OK] Default branch set to main

REM Verify
echo.
echo --- Current Config ---
git config user.name
git config user.email
git remote -v
echo.

echo Setup complete! You can now use auto-git.bat or push.bat.
echo.
pause
