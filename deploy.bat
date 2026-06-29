@echo off
REM ============================================================
REM  Jacob Labs - one-command deploy
REM  Backs up -> commits to git -> pushes (if remote) -> Firebase
REM
REM  Usage:
REM    deploy.bat                 (auto commit message = timestamp)
REM    deploy.bat "your message"  (custom commit message)
REM ============================================================
setlocal EnableDelayedExpansion

cd /d "%~dp0"

echo.
echo  JACOB LABS - deploy
echo  ------------------------------------------------------------

REM --- check Firebase CLI ---
where firebase >nul 2>nul
if errorlevel 1 (
  echo  [!] Firebase CLI not found. Install once with:
  echo      npm install -g firebase-tools
  echo.
  pause
  exit /b 1
)

REM --- timestamp ---
for /f %%I in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd-HHmmss"') do set STAMP=%%I

REM --- commit message: arg if given, else timestamp ---
set "MSG=%~1"
if "%MSG%"=="" set "MSG=site update %STAMP%"

REM --- backup public ---
if exist public (
  echo  [*] Backing up public  -^>  .backup-%STAMP%
  xcopy public ".backup-%STAMP%\" /E /I /Q /Y >nul
)

REM ============================================================
REM  GIT
REM ============================================================
where git >nul 2>nul
if errorlevel 1 (
  echo  [i] Git not installed - skipping version control step.
  goto :deploy
)

REM --- init repo if needed ---
if not exist ".git" (
  echo  [*] No git repo found - initializing one...
  git init >nul
  git branch -M main >nul 2>nul
)

echo  [*] Staging and committing changes...
git add -A
REM commit; if nothing changed, git returns nonzero - that's fine
git commit -m "%MSG%" >nul 2>nul
if errorlevel 1 (
  echo  [i] Nothing new to commit ^(working tree clean^).
) else (
  echo  [OK] Committed: "%MSG%"
)

REM --- push only if a remote named origin exists ---
git remote get-url origin >nul 2>nul
if errorlevel 1 (
  echo  [i] No git remote 'origin' set - skipping push.
  echo      To enable push, run once:
  echo        git remote add origin https://github.com/aniljacobv-lab/jacoblabs-site.git
) else (
  echo  [*] Pushing to origin...
  git push -u origin HEAD
  if errorlevel 1 (
    echo  [!] Push failed - continuing with deploy anyway.
  ) else (
    echo  [OK] Pushed to origin.
  )
)

:deploy
REM ============================================================
REM  FIREBASE
REM ============================================================
echo.
echo  [*] Deploying to Firebase Hosting...
echo.
call firebase deploy --only hosting
if errorlevel 1 (
  echo.
  echo  [!] Deploy failed. If not signed in, run:  firebase login
  echo      To set the project, run:  firebase use --add
  pause
  exit /b 1
)

echo.
echo  [OK] Live. Backup saved as .backup-%STAMP%
echo.
endlocal
pause
