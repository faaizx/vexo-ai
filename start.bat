@echo off
title Vexo AI - Minecraft Server AI Studio (Open BYOK Edition)
color 0A

:: Ensure drive and directory switch to the script location
cd /d "%~dp0"

echo =====================================================================
echo   VEXO AI (OPEN BYOK EDITION) - MINECRAFT SERVER DEVELOPER & ADMIN
echo =====================================================================
echo.
echo Starting Web Studio server on port 3000...
echo.

if not exist "web\node_modules" (
    echo Installing dependencies in web folder...
    cd web && call npm install && cd ..
)

echo Opening Web Studio at http://localhost:3000...
start http://localhost:3000

node web/server/server.js
pause
