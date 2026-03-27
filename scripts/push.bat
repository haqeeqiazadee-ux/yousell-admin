@echo off
title YOUSELL Quick Push
color 0B

cd /d "%~dp0.."

for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TIMESTAMP=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2% %datetime:~8,2%:%datetime:~10,2%

echo ============================================
echo   YOUSELL Quick Push
echo ============================================
echo.

git add -A
if errorlevel 1 (
    echo ERROR: git add failed
    pause
    exit /b 1
)

git status --short
echo.

git commit -m "update: %TIMESTAMP%"
if errorlevel 1 (
    echo Nothing to commit.
    pause
    exit /b 0
)

git push origin main
if errorlevel 1 (
    echo ERROR: git push failed
    pause
    exit /b 1
)

echo.
echo SUCCESS: All changes pushed to GitHub!
echo.
pause
