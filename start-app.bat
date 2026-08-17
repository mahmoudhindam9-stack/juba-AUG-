@echo off
title Restocash ERP Application
cd /d "%~dp0"

echo ===================================================
echo     Restocash ERP - Running Application Mode
echo ===================================================
echo.

:: Start dev server in background
start "Restocash ERP Server" /min cmd /c "npm run dev"

echo Waiting for local server to initialize...
timeout /t 3 /nobreak >nul

echo Opening Restocash ERP in standalone app window...

:: Launch in App Mode (msedge --app or chrome --app opens window without browser tabs or address bar)
start msedge --app=http://localhost:3000 || start chrome --app=http://localhost:3000 || start http://localhost:3000
