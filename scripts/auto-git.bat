@echo off
title YOUSELL Auto-Git Sync
color 0A

echo ============================================
echo   YOUSELL Auto-Git Sync - Background Watcher
echo ============================================
echo.
echo Monitoring for changes every 60 seconds...
echo Press Ctrl+C to stop.
echo.

cd /d "%~dp0.."

set LOGFILE=scripts\auto-git.log

:loop
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TIMESTAMP=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2% %datetime:~8,2%:%datetime:~10,2%:%datetime:~12,2%

REM Check if there are any changes
git status --porcelain > nul 2>&1
for /f %%i in ('git status --porcelain 2^>nul') do goto haschanges

echo [%TIMESTAMP%] No changes detected. >> "%LOGFILE%"
echo [%TIMESTAMP%] No changes detected.
goto wait

:haschanges
echo [%TIMESTAMP%] Changes detected - committing and pushing... >> "%LOGFILE%"
echo [%TIMESTAMP%] Changes detected - committing and pushing...

git add -A
if errorlevel 1 (
    echo [%TIMESTAMP%] ERROR: git add failed >> "%LOGFILE%"
    echo [%TIMESTAMP%] ERROR: git add failed
    goto wait
)

git commit -m "auto: update %TIMESTAMP%"
if errorlevel 1 (
    echo [%TIMESTAMP%] ERROR: git commit failed >> "%LOGFILE%"
    echo [%TIMESTAMP%] ERROR: git commit failed
    goto wait
)

git push origin main
if errorlevel 1 (
    echo [%TIMESTAMP%] ERROR: git push failed >> "%LOGFILE%"
    echo [%TIMESTAMP%] ERROR: git push failed
    goto wait
)

echo [%TIMESTAMP%] SUCCESS: Changes pushed to GitHub >> "%LOGFILE%"
echo [%TIMESTAMP%] SUCCESS: Changes pushed to GitHub

:wait
timeout /t 60 /nobreak > nul
goto loop
