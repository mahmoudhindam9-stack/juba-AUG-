@echo off
title Restocash ERP Java Launcher
cd /d "%~dp0"

echo ===================================================
echo     Restocash ERP - Java Desktop Application
echo ===================================================
echo.

:: Start Node server in background if not already running
start "Restocash ERP Server" /min cmd /c "npm run dev"

echo Waiting for local server to initialize...
timeout /t 3 /nobreak >nul

echo Compiling Java Desktop App...
javac RestocashApp.java 2>nul

if %ERRORLEVEL% equ 0 (
    echo Launching Java Application Window...
    java RestocashApp
) else (
    echo Java SDK not found. Launching Standalone App Window directly...
    call start-app.bat
)
