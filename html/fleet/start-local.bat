@echo off
cd /d "%~dp0"
start "LIN-Q Fleet Local Server" cmd /k node server.mjs
timeout /t 2 /nobreak > nul
start "" http://localhost:3000/fleet/
