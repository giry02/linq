@echo off
cd /d "%~dp0fleet"
start "LIN-Q Requirements Review" cmd /k "set PORT=3100&& node server.mjs"
timeout /t 2 /nobreak > nul
start "" http://localhost:3100/requirements-mvp/
